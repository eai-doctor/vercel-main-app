import { VITAL_TYPES, EMPTY_FORMS } from "./constants";

const HL7_FAMILY_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/v3-RoleCode";

/** small helper: only emit fields that have actual content */
const omitEmpty = (obj) => {
  const out = {};
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v === undefined || v === null) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    out[k] = v;
  });
  return out;
};

/** Build a CodeableConcept from a free-text string */
const textCC = (text) => (text ? { text, coding: [{ display: text }] } : undefined);

/** Read first non-empty CodeableConcept display: prefers .text, falls back to coding[0].display/code */
const ccText = (cc) => {
  if (!cc) return "";
  if (typeof cc === "string") return cc;
  if (cc.text) return cc.text;
  const c = Array.isArray(cc.coding) ? cc.coding[0] : null;
  return c?.display || c?.code || "";
};

/** Read a FHIR Reference's human label */
const refText = (ref) => {
  if (!ref) return "";
  return ref.display || ref.reference || "";
};

/** Pick first present date out of a list of candidates */
const firstDate = (...candidates) => candidates.find((d) => d) || "";

/**
 * UI 폼 데이터를 FHIR Resource 구조로 변환 (POST/PUT용)
 */
export function buildFhirResource(tab, form) {
  switch (tab) {
    case "Condition":
      return {
        resourceType: "Condition",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: form.status }],
        },
        code: { coding: [{ display: form.display || form.name }], text: form.display || form.name },
        onsetDateTime: form.onsetDate || undefined,
        note: form.notes ? [{ text: form.notes }] : [],
      };
    case "Observation":
      const vt = VITAL_TYPES.find((v) => v.label === form.vitalType) || VITAL_TYPES[0];
      return {
        resourceType: "Observation",
        category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
        code: { coding: [{ system: "http://loinc.org", code: vt.code, display: vt.label }], text: vt.label },
        valueQuantity: { value: parseFloat(form.value) || form.value, unit: form.unit || vt.unit },
        effectiveDateTime: form.date || undefined,
      };

    case "MedicationStatement":
      return omitEmpty({
        resourceType: "MedicationStatement",
        status: form.status,
        statusReason: form.statusReason ? [textCC(form.statusReason)] : undefined,
        category: form.category
          ? {
              coding: [
                {
                  system:
                    "http://terminology.hl7.org/CodeSystem/medication-statement-category",
                  code: form.category,
                },
              ],
            }
          : undefined,
        medicationCodeableConcept: textCC(form.medication),
        effectiveDateTime: form.effectiveDate || undefined,
        dateAsserted: form.dateAsserted || undefined,
        reasonCode: form.reasonCode ? [textCC(form.reasonCode)] : undefined,
        dosage: form.dosage ? [{ text: form.dosage }] : undefined,
        note: form.notes ? [{ text: form.notes }] : undefined,
      });

    case "Procedure":
      return omitEmpty({
        resourceType: "Procedure",
        status: form.status,
        statusReason: textCC(form.statusReason),
        category: textCC(form.category),
        code: textCC(form.display),
        performedDateTime: form.performedDate || undefined,
        performer: form.performer
          ? [{ actor: { display: form.performer } }]
          : undefined,
        location: form.location ? { display: form.location } : undefined,
        reasonCode: form.reasonCode ? [textCC(form.reasonCode)] : undefined,
        bodySite: form.bodySite ? [textCC(form.bodySite)] : undefined,
        outcome: textCC(form.outcome),
        note: form.notes ? [{ text: form.notes }] : undefined,
      });

    case "DiagnosticReport":
      return omitEmpty({
        resourceType: "DiagnosticReport",
        status: form.status,
        category: form.category ? [textCC(form.category)] : undefined,
        code: textCC(form.display),
        effectiveDateTime: form.effectiveDate || undefined,
        issued: form.issued || undefined,
        performer: form.performer
          ? [{ display: form.performer }]
          : undefined,
        resultsInterpreter: form.resultsInterpreter
          ? [{ display: form.resultsInterpreter }]
          : undefined,
        result: form.result
          ? form.result
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((display) => ({ display }))
          : undefined,
        conclusion: form.conclusion || undefined,
        conclusionCode: form.conclusionCode
          ? [textCC(form.conclusionCode)]
          : undefined,
      });

    case "Flag":
      return omitEmpty({
        resourceType: "Flag",
        status: form.status,
        category: form.category ? [textCC(form.category)] : undefined,
        code: textCC(form.display),
        period:
          form.periodStart || form.periodEnd
            ? omitEmpty({ start: form.periodStart, end: form.periodEnd })
            : undefined,
        author: form.author ? { display: form.author } : undefined,
        encounter: form.encounter ? { display: form.encounter } : undefined,
        // Flag has no .note in R4; keep as extension-style note for app display
        _note: form.notes ? [{ text: form.notes }] : undefined,
      });

    case "CarePlan":
      return omitEmpty({
        resourceType: "CarePlan",
        status: form.status,
        intent: form.intent,
        category: form.category ? [textCC(form.category)] : undefined,
        title: form.title || undefined,
        description: form.description || undefined,
        period:
          form.periodStart || form.periodEnd
            ? omitEmpty({ start: form.periodStart, end: form.periodEnd })
            : undefined,
        author: form.author ? { display: form.author } : undefined,
        addresses: form.addresses
          ? form.addresses
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((display) => ({ display }))
          : undefined,
        activity: form.activity
          ? [{ detail: { description: form.activity } }]
          : undefined,
        note: form.notes ? [{ text: form.notes }] : undefined,
      });

    case "FamilyMemberHistory":
      return omitEmpty({
        resourceType: "FamilyMemberHistory",
        status: form.status,
        date: form.date || undefined,
        name: form.name || undefined,
        relationship: form.relationship
          ? {
              coding: [
                { system: HL7_FAMILY_SYSTEM, code: form.relationship },
              ],
              text: form.relationship,
            }
          : undefined,
        sex: form.sex
          ? {
              coding: [
                {
                  system:
                    "http://hl7.org/fhir/administrative-gender",
                  code: form.sex,
                },
              ],
              text: form.sex,
            }
          : undefined,
        bornDate: form.bornDate || undefined,
        ageString: form.age ? String(form.age) : undefined,
        deceasedBoolean:
          form.deceasedBoolean && !form.deceasedDate ? true : undefined,
        deceasedDate: form.deceasedDate || undefined,
        reasonCode: form.reasonCode ? [textCC(form.reasonCode)] : undefined,
        condition: form.condition
          ? [{ code: textCC(form.condition) }]
          : undefined,
        note: form.notes ? [{ text: form.notes }] : undefined,
      });

    default: return {};
  }
}

/** * For editing Data
 */
export function formFromRecord(tab, rec) {
  const res = rec.resource || rec || {};
  if (!res) return EMPTY_FORMS[tab];

  switch (tab) {
    case "Condition":
      return {
        display: res?.code?.text || res?.code?.coding?.[0]?.display || "",
        status: res?.clinicalStatus?.coding?.[0]?.code || "active",
        onsetDate: res?.onsetDateTime?.slice(0, 10) || "",
        notes: res.note?.[0]?.text || "",
      };
    case "Observation":
      const display = res.code?.coding?.[0]?.display || "";
      const match = VITAL_TYPES.find((v) => v.label === display);
      return {
        vitalType: match ? match.label : VITAL_TYPES[0].label,
        value: res.valueQuantity?.value != null ? String(res.valueQuantity.value) : "",
        unit: res.valueQuantity?.unit || "",
        date: res.effectiveDateTime || "",
      };

    case "MedicationStatement":
      return {
        medication:
          res.medicationCodeableConcept?.text ||
          res.medicationCodeableConcept?.coding?.[0]?.display ||
          res.medication || "",
        status: res.status || "active",
        statusReason:
          res.statusReason?.[0]?.text ||
          res.statusReason?.[0]?.coding?.[0]?.display || "",
        category: res.category?.coding?.[0]?.code || "outpatient",
        effectiveDate: res.effectiveDateTime || "",
        dateAsserted: res.dateAsserted || "",
        reasonCode:
          res.reasonCode?.[0]?.text ||
          res.reasonCode?.[0]?.coding?.[0]?.display || "",
        dosage: res.dosage?.[0]?.text || "",
        notes: res.note?.[0]?.text || "",
      };

    case "Procedure":
      return {
        display: res.code?.text || res.code?.coding?.[0]?.display || "",
        status: res.status || "completed",
        statusReason:
          res.statusReason?.text ||
          res.statusReason?.coding?.[0]?.display || "",
        category:
          res.category?.text || res.category?.coding?.[0]?.display || "",
        performedDate:
          res.performedDateTime || res.performedPeriod?.start || "",
        performer:
          res.performer?.[0]?.actor?.display ||
          res.performer?.[0]?.actor?.reference || "",
        location: res.location?.display || res.location?.reference || "",
        reasonCode:
          res.reasonCode?.[0]?.text ||
          res.reasonCode?.[0]?.coding?.[0]?.display || "",
        bodySite:
          res.bodySite?.[0]?.text ||
          res.bodySite?.[0]?.coding?.[0]?.display || "",
        outcome:
          res.outcome?.text || res.outcome?.coding?.[0]?.display || "",
        notes: res.note?.[0]?.text || "",
      };

    case "DiagnosticReport":
      return {
        display: res.code?.text || res.code?.coding?.[0]?.display || "",
        status: res.status || "final",
        category:
          res.category?.[0]?.text ||
          res.category?.[0]?.coding?.[0]?.display || "",
        effectiveDate:
          res.effectiveDateTime || res.effectivePeriod?.start || "",
        issued: res.issued || "",
        performer:
          res.performer?.[0]?.display || res.performer?.[0]?.reference || "",
        resultsInterpreter:
          res.resultsInterpreter?.[0]?.display ||
          res.resultsInterpreter?.[0]?.reference || "",
        result: Array.isArray(res.result)
          ? res.result.map((r) => r.display || r.reference).filter(Boolean).join(", ")
          : "",
        conclusion: res.conclusion || "",
        conclusionCode:
          res.conclusionCode?.[0]?.text ||
          res.conclusionCode?.[0]?.coding?.[0]?.display || "",
      };

    case "Flag":
      return {
        display: res.code?.text || res.code?.coding?.[0]?.display || "",
        status: res.status || "active",
        category:
          res.category?.[0]?.text ||
          res.category?.[0]?.coding?.[0]?.display || "",
        periodStart: res.period?.start || "",
        periodEnd: res.period?.end || "",
        author: res.author?.display || res.author?.reference || "",
        encounter:
          res.encounter?.display || res.encounter?.reference || "",
        notes: res._note?.[0]?.text || res.note?.[0]?.text || "",
      };

    case "CarePlan":
      return {
        title: res.title || "",
        description: res.description || "",
        status: res.status || "active",
        intent: res.intent || "plan",
        category:
          res.category?.[0]?.text ||
          res.category?.[0]?.coding?.[0]?.display || "",
        periodStart: res.period?.start || "",
        periodEnd: res.period?.end || "",
        author: res.author?.display || res.author?.reference || "",
        addresses: Array.isArray(res.addresses)
          ? res.addresses.map((a) => a.display || a.reference).filter(Boolean).join(", ")
          : "",
        activity: Array.isArray(res.activity)
          ? res.activity.map((a) => a.detail?.description).filter(Boolean).join("\n")
          : "",
        notes: res.note?.[0]?.text || "",
      };

    case "FamilyMemberHistory":
      return {
        name: res.name || "",
        relationship:
          res.relationship?.coding?.[0]?.code ||
          res.relationship?.text ||
          "MTH",
        status: res.status || "completed",
        sex: res.sex?.coding?.[0]?.code || res.sex?.text || "unknown",
        bornDate: res.bornDate || "",
        age:
          res.ageString ||
          (res.ageAge?.value != null ? String(res.ageAge.value) : ""),
        deceasedBoolean:
          res.deceasedBoolean === true || !!res.deceasedDate,
        deceasedDate: res.deceasedDate || "",
        condition:
          res.condition?.[0]?.code?.text ||
          res.condition?.[0]?.code?.coding?.[0]?.display || "",
        reasonCode:
          res.reasonCode?.[0]?.text ||
          res.reasonCode?.[0]?.coding?.[0]?.display || "",
        notes: res.note?.[0]?.text || "",
        date: res.date || "",
      };

    default: return EMPTY_FORMS[tab];
  }
}

export function parseDisplayData(tab, rec) {
  // The bulk FHIR endpoint returns plain FHIR resources — `rec` IS the resource.
  // Older DB-shaped records may wrap as `{ resource: {...} }`; support both.
  const res = rec?.resource || rec || {};
  const _id = rec?._id || rec?.id || res?.id;

  switch (tab) {
    // ========================= Condition =========================
    case "Condition": {
      const status =
        res.clinicalStatus?.coding?.[0]?.code ||
        ccText(res.clinicalStatus) ||
        res.status ||
        "unknown";
      return {
        _id,
        primary: ccText(res.code) || res.display || "Unknown Condition",
        secondary: `Status: ${status}`,
        date: firstDate(res.onsetDateTime, res.onsetPeriod?.start, res.recordedDate, res.onsetDate),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= Observation =========================
    case "Observation": {
      const label = ccText(res.code) || "Observation";

      // Build a value string. Cover: valueQuantity, valueCodeableConcept,
      // valueString, valueBoolean, and component[] (e.g. systolic/diastolic BP)
      let valueStr = "";
      if (res.valueQuantity?.value != null) {
        valueStr = `${res.valueQuantity.value}${
          res.valueQuantity.unit ? ` ${res.valueQuantity.unit}` : ""
        }`;
      } else if (res.valueCodeableConcept) {
        valueStr = ccText(res.valueCodeableConcept);
      } else if (res.valueString) {
        valueStr = String(res.valueString);
      } else if (res.valueBoolean != null) {
        valueStr = String(res.valueBoolean);
      } else if (Array.isArray(res.component) && res.component.length) {
        // e.g. BP: systolic / diastolic
        valueStr = res.component
          .map((c) => {
            const v = c.valueQuantity?.value;
            const u = c.valueQuantity?.unit || "";
            return v != null ? `${v}${u ? ` ${u}` : ""}` : "";
          })
          .filter(Boolean)
          .join(" / ");
      }

      return {
        _id,
        primary: label,
        secondary: valueStr || `Status: ${res.status || "unknown"}`,
        date: firstDate(res.effectiveDateTime, res.effectivePeriod?.start, res.issued, res.date),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= Immunization =========================
    case "Immunization": {
      return {
        _id,
        primary: ccText(res.vaccineCode) || res.vaccine || "Immunization",
        secondary: `Status: ${res.status || "completed"}`,
        date: firstDate(res.occurrenceDateTime, res.occurrenceString, res.recorded, res.date),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= MedicationRequest =========================
    case "MedicationRequest": {
      const med =
        ccText(res.medicationCodeableConcept) ||
        refText(res.medicationReference) ||
        res.medication ||
        "Medication";
      const dosage = res.dosageInstruction?.[0]?.text || "";
      return {
        _id,
        primary: med,
        secondary: dosage
          ? `${dosage} · Status: ${res.status || "unknown"}`
          : `Status: ${res.status || "unknown"}`,
        date: firstDate(res.authoredOn, res.dosageInstruction?.[0]?.timing?.event?.[0], res.date),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= AllergyIntolerance =========================
    case "AllergyIntolerance": {
      const status =
        res.clinicalStatus?.coding?.[0]?.code ||
        ccText(res.clinicalStatus) ||
        res.status ||
        "unknown";
      const substance =
        ccText(res.code) ||
        ccText(res.reaction?.[0]?.substance) ||
        res.substance ||
        "";
      return {
        _id,
        primary: ccText(res.code) || res.display || "Allergy",
        secondary: `Criticality: ${res.criticality || "unknown"} · Status: ${status}${
          substance ? ` · ${substance}` : ""
        }`,
        date: firstDate(res.recordedDate, res.onsetDateTime, res.onsetPeriod?.start, res.date),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= MedicationStatement =========================
    case "MedicationStatement": {
      const med =
        ccText(res.medicationCodeableConcept) ||
        refText(res.medicationReference) ||
        res.medication ||
        "Medication Statement";
      const dosage = res.dosage?.[0]?.text || "";
      return {
        _id,
        primary: med,
        secondary: `Status: ${res.status || "unknown"}${dosage ? ` · ${dosage}` : ""}`,
        date: firstDate(res.effectiveDateTime, res.effectivePeriod?.start, res.dateAsserted, res.date),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= Procedure =========================
    case "Procedure": {
      const reason =
        ccText(res.reasonCode?.[0]) ||
        refText(res.reasonReference?.[0]) ||
        "";
      const bodySite = ccText(res.bodySite?.[0]);
      return {
        _id,
        primary: ccText(res.code) || res.display || "Procedure",
        secondary: `Status: ${res.status || "unknown"}${
          bodySite ? ` · Site: ${bodySite}` : ""
        }${reason ? ` · ${reason}` : ""}`,
        date: firstDate(res.performedDateTime, res.performedPeriod?.start, res.date),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= DiagnosticReport =========================
    case "DiagnosticReport": {
      const cat = ccText(res.category?.[0]);
      const resultCount = Array.isArray(res.result) ? res.result.length : 0;
      const secondaryParts = [`Status: ${res.status || "unknown"}`];
      if (cat) secondaryParts.push(cat);
      if (resultCount) secondaryParts.push(`${resultCount} result${resultCount > 1 ? "s" : ""}`);
      return {
        _id,
        primary: ccText(res.code) || res.display || "Diagnostic Report",
        secondary: secondaryParts.join(" · "),
        date: firstDate(res.effectiveDateTime, res.effectivePeriod?.start, res.issued, res.date),
        notes: res.conclusion || res.note?.[0]?.text,
      };
    }

    // ========================= Flag =========================
    case "Flag": {
      const cat = ccText(res.category?.[0]);
      return {
        _id,
        primary: ccText(res.code) || res.display || "Flag",
        secondary: `Status: ${res.status || "unknown"}${cat ? ` · ${cat}` : ""}`,
        date: firstDate(res.period?.start, res.date),
        notes: res._note?.[0]?.text || res.note?.[0]?.text,
      };
    }

    // ========================= CarePlan =========================
    case "CarePlan": {
      const cat = ccText(res.category?.[0]);
      const firstActivity =
        ccText(res.activity?.[0]?.detail?.code) ||
        res.activity?.[0]?.detail?.description ||
        "";
      return {
        _id,
        primary:
          res.title ||
          cat ||
          firstActivity ||
          "Care Plan",
        secondary: `Status: ${res.status || "unknown"} · Intent: ${
          res.intent || "unknown"
        }${firstActivity && (res.title || cat) ? ` · ${firstActivity}` : ""}`,
        date: firstDate(res.period?.start, res.created, res.date),
        notes: res.description || res.note?.[0]?.text,
      };
    }

    // ========================= FamilyMemberHistory =========================
    case "FamilyMemberHistory": {
      const rel =
        ccText(res.relationship) ||
        res.relationship?.coding?.[0]?.code ||
        "Family member";
      const cond =
        ccText(res.condition?.[0]?.code) ||
        res.condition?.[0]?.code?.text ||
        "";
      return {
        _id,
        primary: res.name ? `${res.name} (${rel})` : rel,
        secondary: `${cond ? `Condition: ${cond}` : "No condition recorded"}${
          res.deceasedBoolean || res.deceasedDate ? " · Deceased" : ""
        }`,
        date: firstDate(res.date, res.bornDate),
        notes: res.note?.[0]?.text,
      };
    }

    default:
      return {
        _id,
        primary: "Record",
        secondary: "",
      };
  }
}
