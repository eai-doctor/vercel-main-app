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
        diagnoses: (r.Condition || []).map(mapCondition),

        // 나머지는 parseDisplayData 재사용
        immunizations: parse('Immunization',       r.Immunization)
            .sort((a, b) => (b.date || '').localeCompare(a.date || '')),

        medications: [
            ...parse('MedicationRequest',   r.MedicationRequest),
            ...parse('MedicationStatement', r.MedicationStatement),
        ].sort((a, b) => (b.date || '').localeCompare(a.date || '')),

        allergies: (r.AllergyIntolerance || []).map(mapAllergy),
        procedures:   (r.Procedure || [])
                        .map(mapProcedure)
                        .sort((a, b) => (b.date_performed || '').localeCompare(a.date_performed || '')),

        vital_signs: parse('Observation',
            (r.Observation || []).filter(o =>
                o.category?.[0]?.coding?.[0]?.code === 'vital-signs'
            )
        ).sort((a, b) => (b.date || '').localeCompare(a.date || '')),

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
        summary: e.specialty || reason || e.class?.code || '',

    };
}