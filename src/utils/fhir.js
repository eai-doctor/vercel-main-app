// utils/fhirToPatientData.js
import { parseDisplayData } from '@/pages/patient/profile/utils';

function mapCondition(res) {
  const coding = res.code?.coding?.[0] || {};
  const system = coding.system || '';
  const code = coding.code || '';
  const condition = res.code?.text || coding.display || '';

  const isSnomed = system.includes('snomed');
  const isIcd10 = system.includes('icd-10') || system.includes('icd10');
  const isLoinc = system.includes('loinc');

  const code_system =
    isSnomed ? 'SNOMED-CT' :
    isIcd10 ? 'ICD-10' :
    isLoinc ? 'LOINC' :
    system.split('/').pop() || '';

  return {
    ...parseDisplayData('Condition', res),
    original: res,

    condition,
    code,
    code_system,
    status: res.clinicalStatus?.coding?.[0]?.code || 'unknown',
    date_diagnosed: res.onsetDateTime || res.onsetPeriod?.start || res.recordedDate || '',

    chat_logs : res._symptom_meta?.chat_logs || [],

    relevance_to_focus: 'moderate',
    snomed_code: isSnomed ? code : undefined,
    icd_code: isIcd10 ? code : undefined,
  };
}

function mapAllergy(res) {
    const coding = res.code?.coding?.[0] || {};
    const substance =
        res.code?.text ||
        coding.display ||
        res.reaction?.[0]?.substance?.text ||
        res.reaction?.[0]?.substance?.coding?.[0]?.display ||
        '';

    return {
        ...parseDisplayData('AllergyIntolerance', res),
        original: res,

        allergy: substance,
        substance,
        code: coding.code || '',
        code_system: coding.system?.includes('snomed') ? 'SNOMED-CT' : coding.system?.split('/').pop() || '',
        status: res.clinicalStatus?.coding?.[0]?.code || 'unknown',
        verification_status: res.verificationStatus?.coding?.[0]?.code || '',
        criticality: res.criticality || 'unknown',
        category: Array.isArray(res.category) ? res.category.join(', ') : res.category || '',
        type: res.type || '',
        date_diagnosed: res.onsetDateTime || res.onsetPeriod?.start || res.recordedDate || '',
        relevance_to_focus: 'moderate',
    };
}

function mapProcedure(res) {
    const coding = res.code?.coding?.[0] || {};
    const system = coding.system || '';
    const isSnomed = system.includes('snomed');

    const procedure =
        res.code?.text ||
        coding.display ||
        res.display ||
        'Procedure';

    const reason =
        res.reasonReference?.[0]?.display ||
        res.reasonCode?.[0]?.text ||
        res.reasonCode?.[0]?.coding?.[0]?.display ||
        '';

    return {
        ...parseDisplayData('Procedure', res),
        original: res,

        procedure,
        display: procedure,
        code: coding.code || '',
        code_system: isSnomed ? 'SNOMED-CT' : system.split('/').pop() || '',
        status: res.status || 'unknown',
        reason,
        date_performed:
            res.performedDateTime ||
            res.performedPeriod?.start ||
            res.performedPeriod?.end ||
            res.meta?.lastUpdated ||
            '',
        end_date: res.performedPeriod?.end || '',
        encounter: res.encounter?.reference || '',
        relevance_to_focus: 'moderate',

        snomed_code: isSnomed ? coding.code || '' : undefined,
    };
}

// NEW: dedicated mapper for vital-signs Observations
// VitalSigns.jsx expects: v.measurement, v.value, v.unit, v.date
function mapVitalSign(res) {
    const coding = res.code?.coding?.[0] || {};

    const measurement =
        res.code?.text ||
        coding.display ||
        coding.code ||
        '';

    // Quantity (most common)
    let value = '';
    let unit = '';
    if (res.valueQuantity) {
        value = res.valueQuantity.value ?? '';
        unit  = res.valueQuantity.unit || res.valueQuantity.code || '';
    } else if (res.valueString) {
        value = res.valueString;
    } else if (res.valueCodeableConcept) {
        value = res.valueCodeableConcept.text || res.valueCodeableConcept.coding?.[0]?.display || '';
    } else if (res.component) {
        // e.g. Blood Pressure has components (systolic / diastolic)
        value = res.component
            .map(c => {
                const v = c.valueQuantity?.value ?? '';
                const u = c.valueQuantity?.unit || c.valueQuantity?.code || '';
                const label = c.code?.text || c.code?.coding?.[0]?.display || '';
                return label ? `${label}: ${v}${u ? ' ' + u : ''}` : `${v}${u ? ' ' + u : ''}`;
            })
            .join(' / ');
        unit = ''; // unit is already embedded per component
    }

    const date =
        res.effectiveDateTime ||
        res.effectivePeriod?.start ||
        res.issued ||
        res.meta?.lastUpdated ||
        '';

    return {
        ...parseDisplayData('Observation', res),
        original: res,

        measurement,
        value: value !== '' ? String(value) : '',
        unit,
        date,
        status: res.status || '',
        relevance_to_focus: 'moderate',
    };
}

// NEW: dedicated mapper for Immunizations
// Immunizations.jsx expects: im.vaccine, im.status, im.date
function mapImmunization(res) {
    const coding = res.vaccineCode?.coding?.[0] || {};

    const vaccine =
        res.vaccineCode?.text ||
        coding.display ||
        coding.code ||
        '';

    const date =
        res.occurrenceDateTime ||
        res.occurrenceString ||
        res.recorded ||
        res.meta?.lastUpdated ||
        '';

    return {
        ...parseDisplayData('Immunization', res),
        original: res,

        vaccine,
        status: res.status || '',
        date,
        lot_number: res.lotNumber || '',
        site: res.site?.text || res.site?.coding?.[0]?.display || '',
        route: res.route?.text || res.route?.coding?.[0]?.display || '',
        dose_quantity: res.doseQuantity?.value != null
            ? `${res.doseQuantity.value}${res.doseQuantity.unit ? ' ' + res.doseQuantity.unit : ''}`
            : '',
        relevance_to_focus: 'moderate',
    };
}

function mapMedication(res) {
    const isMedicationRequest = res.resourceType === 'MedicationRequest';

    const coding =
        res.medicationCodeableConcept?.coding?.[0] ||
        res.medication?.concept?.coding?.[0] ||
        res.medication?.coding?.[0] ||
        {};
    const system = coding.system || '';

    const name =
        res.medicationCodeableConcept?.text ||
        res.medication?.concept?.text ||
        res.medication?.text ||
        coding.display ||
        coding.code ||
        '';

    const dosageInstruction = res.dosageInstruction?.[0] || res.dosage?.[0] || {};

    const dose =
        dosageInstruction.doseAndRate?.[0]?.doseQuantity?.value != null
            ? `${dosageInstruction.doseAndRate[0].doseQuantity.value}${dosageInstruction.doseAndRate[0].doseQuantity.unit ? ' ' + dosageInstruction.doseAndRate[0].doseQuantity.unit : ''}`
            : dosageInstruction.text || '';

    const frequency =
        dosageInstruction.timing?.code?.text ||
        dosageInstruction.timing?.repeat?.period != null
            ? `${dosageInstruction.timing.repeat.period} ${dosageInstruction.timing.repeat.periodUnit || ''}`
            : '';

    const route =
        dosageInstruction.route?.text ||
        dosageInstruction.route?.coding?.[0]?.display ||
        '';

    const indication =
        res.reasonCode?.[0]?.text ||
        res.reasonCode?.[0]?.coding?.[0]?.display ||
        res.reason?.[0]?.concept?.text ||
        res.reason?.[0]?.concept?.coding?.[0]?.display ||
        '';

    const start_date = isMedicationRequest
        ? res.authoredOn || res.dispenseRequest?.validityPeriod?.start || ''
        : res.effectiveDateTime || res.effectivePeriod?.start || res.dateAsserted || '';

    const end_date = isMedicationRequest
        ? res.dispenseRequest?.validityPeriod?.end || ''
        : res.effectivePeriod?.end || '';

    const isSnomed = system.includes('snomed');
    const isRxNorm = system.includes('rxnorm');

    return {
        ...parseDisplayData(res.resourceType === 'MedicationRequest' ? 'MedicationRequest' : 'MedicationStatement', res),
        original: res,

        name,
        code: coding.code || '',
        code_system: isSnomed ? 'SNOMED-CT' : isRxNorm ? 'RxNorm' : system.split('/').pop() || '',
        status: res.status || '',
        start_date,
        end_date,
        dose,
        frequency,
        route,
        indication,
        relevance_to_focus: 'moderate',
    };
}

export function fhirRecordsToPatientData(fhirRecords) {
    const r = fhirRecords;

    const patient = r.Patient?.[0] || {};
    const officialName = patient.name?.find(n => n.use === 'official') || patient.name?.[0] || {};

    const patient_identification = {
        patient_id: patient.id,
        first_name: officialName.given?.[0] || '',
        last_name: officialName.family || '',
        full_name: `${officialName.given?.[0] || ''} ${officialName.family || ''}`.trim(),

        date_of_birth: patient.birthDate || '',
        birth_date: patient.birthDate || '',

        gender: patient.gender || '',
        address: patient.address?.[0],
        deceased: patient.deceasedDateTime || patient.deceasedBoolean || null,
        mrn: patient.identifier?.find(i =>
            i.type?.coding?.[0]?.code === 'MR'
        )?.value || '',

        phone: patient.telecom?.find(t => t.system === 'phone')?.value || '',
        email: patient.telecom?.find(t => t.system === 'email')?.value || '',
        status: patient.deceasedDateTime || patient.deceasedBoolean ? 'Deceased' : 'Active',
    };

    const parse = (tab, resources) =>
        (resources || []).map(res => ({
            ...parseDisplayData(tab, res),
            original: res,
        }));

    const allEncounters = r.Encounter || [];

    return {
        patient_identification,

        // Condition
        diagnoses: (r.Condition || []).map(mapCondition).sort((a, b) => (b.date_diagnosed || '').localeCompare(a.date_diagnosed || '')),

        encounters: (r.Encounter || []).map(newMapEncounter).sort((a, b) => (b.date || '').localeCompare(a.date || '')),

        // Use dedicated mappers so field names match the frontend components
        immunizations: (r.Immunization || [])
            .map(mapImmunization)
            .sort((a, b) => (b.date || '').localeCompare(a.date || '')),

        medications: [
            ...(r.MedicationRequest   || []).map(mapMedication),
            ...(r.MedicationStatement || []).map(mapMedication),
        ].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || '')),

        allergies: (r.AllergyIntolerance || []).map(mapAllergy),
        procedures:   (r.Procedure || [])
                        .map(mapProcedure)
                        .sort((a, b) => (b.date_performed || '').localeCompare(a.date_performed || '')),

        vital_signs: (r.Observation || [])
            .filter(o => o.category?.[0]?.coding?.[0]?.code === 'vital-signs')
            .map(mapVitalSign)
            .sort((a, b) => (b.date || '').localeCompare(a.date || '')),

        labs: {
            observations: parse('Observation',
                (r.Observation || []).filter(o =>
                    o.category?.[0]?.coding?.[0]?.code === 'laboratory'
                )
            ).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
            reports: parse('DiagnosticReport', r.DiagnosticReport),
        },

        carePlans:     parse('CarePlan',            r.CarePlan),
        flags:         parse('Flag',                r.Flag),
        familyHistory: parse('FamilyMemberHistory', r.FamilyMemberHistory),

        consultations: allEncounters
            .filter(e => e.class?.code === 'AMB')
            .map(mapEncounter),
        admissions: allEncounters
            .filter(e => ['EMER', 'IMP', 'ACUTE'].includes(e.class?.code))
            .map(mapEncounter),

        requested_labs: [],
        imaging: [],
    };
}

function mapEncounter(e) {
    return {
        id:       e.id,
        type:     e.type?.[0]?.text || e.type?.[0]?.coding?.[0]?.display || '',
        date:     e.period?.start,
        end:      e.period?.end,
        provider: e.serviceProvider?.display
                  || e.participant?.[0]?.individual?.display || '',
        reason:   e.reasonCode?.[0]?.coding?.[0]?.display || '',
        status:   e.status,
        original: e,
        relevance_to_focus: 'moderate',
        specialty : e.specialty || '',
        summary: e.specialty || e.class?.code || '',
    };
}

function newMapEncounter(e) {
  const type =
    e.type?.[0]?.text ||
    e.type?.[0]?.coding?.[0]?.display ||
    '';

  const reason =
    e.reasonCode?.[0]?.text ||
    e.reasonCode?.[0]?.coding?.[0]?.display ||
    e.reason?.[0]?.concept?.text ||
    e.reason?.[0]?.concept?.coding?.[0]?.display ||
    '';

  const specialty =
    e.specialty?.text ||
    e.specialty?.coding?.[0]?.display ||
    e.specialty?.coding?.[0]?.code ||
    '';

  const encounterClass =
    e.class?.display ||
    e.class?.code ||
    '';

  return {
    id: e.id,
    type,
    date: e.period?.start || e.actualPeriod?.start || '',
    end: e.period?.end || e.actualPeriod?.end || '',
    provider:
      e.serviceProvider?.display ||
      e.participant?.[0]?.individual?.display ||
      '',
    reason,
    status: e.status || '',
    original: e,
    relevance_to_focus: 'moderate',
    specialty,
    summary: specialty || reason || encounterClass || type || '',
  };
}