import { VITAL_TYPES, EMPTY_FORMS } from "./constants";

/** * UI 폼 데이터를 FHIR Resource 구조로 변환 (POST/PUT용)
 */
export function buildFhirResource(tab, form) {
  switch (tab) {
    case "Condition":
      return {
        resourceType: "Condition",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: form.status }],
        },
        code: { coding: [{ display: form.name }], text: form.name },
        onsetDateTime: form.onsetDate || undefined,
        note: form.notes ? [{ text: form.notes }] : [],
      };
    case "Observation":
      const vt = VITAL_TYPES.find((v) => v.label === form.vitalType) || VITAL_TYPES[0];
      return {
        resourceType: "Observation",
        category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
        code: { coding: [{ system: "http://loinc.org", code: vt.code, display: vt.label }], text: vt.label },
        valueQuantity: { value: parseFloat(form.value) || form.value, unit: vt.unit },
        effectiveDateTime: form.date || undefined,
      };
    // ... 나머지 case (MedicationRequest, AllergyIntolerance 등)는 기존 로직 유지
    default: return {};
  }
}

/** * For editing Data
 */
export function formFromRecord(tab, rec) {
  const res = rec.resource || {};
  if (!res) return EMPTY_FORMS[tab];

  switch (tab) {
    case "Condition":
      return {
        name: res.code?.text || res.code?.coding?.[0]?.display || "",
        status: res.clinicalStatus?.coding?.[0]?.code || "active",
        onsetDate: res.onsetDateTime || "",
        notes: res.note?.[0]?.text || "",
      };
    case "Observation":
      const display = res.code?.coding?.[0]?.display || "";
      const match = VITAL_TYPES.find((v) => v.label === display);
      return {
        vitalType: match ? match.label : VITAL_TYPES[0].label,
        value: res.valueQuantity?.value != null ? String(res.valueQuantity.value) : "",
        date: res.effectiveDateTime || "",
      };
    // ... 나머지 case 유지
    default: return EMPTY_FORMS[tab];
  }
}

export function parseDisplayData(tab, rec) {
  const res = rec.resource || rec; // FHIR or DB fallback
  console.log(`Parsing display data for tab ${tab}:`, res);

  switch (tab) {
    case "Condition":
      return {
        _id: rec._id,
        primary:
          res.code?.text || res.display || "Unknown Condition",

        secondary: `Status: ${
          res.clinicalStatus?.coding?.[0]?.code ||
          res.status ||
          "unknown"
        }`,

        date: res.onsetDateTime || res.onset_date || res.onsetDate

      };

    case "Observation":
      return {
        _id: rec._id,

        primary:
          res.code?.text || res.display || "Observation",

        secondary: `${
          res.value ??
          ""
        } ${
          res.unit ||
          ""
        }`,

        date: res.effectiveDateTime || res.date,
      };

    case "Immunization":
      return {
        _id: rec._id,

        primary:
          res.vaccine ||
          res.display ||
          "Immunization",

        secondary: `Status: ${
          res.status || "completed"
        }`,

        date:
          res.occurrenceDateTime ||
          res.date,
      };

    case "MedicationRequest":
      return {
        _id: rec._id,

        primary:
          res.medication ||
          "Medication",

        secondary: `Status: ${
          res.status || "unknown"
        }`,

        date:
          res.effectiveDateTime ||
          res.date || res.onsetDate,
      };

    case "AllergyIntolerance":
  return {
        _id: rec._id,

    primary:
      res.code?.text || res.display || "Unknown Allergy",

    secondary: `Criticality: ${
      res.criticality || "unknown"
    } · Substance: ${
      res.reaction?.[0]?.substance?.text ||
      res.substance ||
      "unknown"
    }`,

    date: res.recordedDate || res.date || res.onsetDate,

    notes: res.note?.[0]?.text,
  };

    default:
      return {
        _id : undefined,
        primary: "Record",
        secondary: "",
      };
  }
}