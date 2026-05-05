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

    case "AllergyIntolerance":
      return {
        display:
          res.code?.text ||
          res.code?.coding?.[0]?.display ||
          "",
        allergy:
          res.code?.text ||
          res.code?.coding?.[0]?.display ||
          "",
        substance:
          res.code?.text ||
          res.code?.coding?.[0]?.display ||
          "",
        status:
          res.clinicalStatus?.coding?.[0]?.code ||
          "active",
        verificationStatus:
          res.verificationStatus?.coding?.[0]?.code ||
          "confirmed",
        type: res.type || "allergy",
        category: Array.isArray(res.category)
          ? res.category[0] || ""
          : res.category || "",
        criticality: res.criticality || "",
        onsetDate:
          res.onsetDateTime?.slice(0, 10) ||
          "",
        recordedDate:
          res.recordedDate?.slice(0, 10) ||
          "",
        reaction:
          res.reaction?.[0]?.manifestation?.[0]?.text ||
          res.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display ||
          "",
        severity:
          res.reaction?.[0]?.severity ||
          "",
        notes: res.note?.[0]?.text || "",
      };
    
    case "MedicationRequest":
    return {
      medication:
        res.medicationCodeableConcept?.text ||
        res.medicationCodeableConcept?.coding?.[0]?.display ||
        "",
      status: res.status || "active",
      intent: res.intent || "order",
      authoredOn: res.authoredOn || "",
      requester: res.requester?.display || "",
      dosage: res.dosageInstruction?.[0]?.text || "",
      notes: res.note?.[0]?.text || "",
    };
    
    case "Immunization":
      return {
        vaccine:
          res.vaccineCode?.text ||
          res.vaccineCode?.coding?.[0]?.display ||
          res.vaccineCode?.coding?.[0]?.code ||
          "",
        status: res.status || "completed",
        occurrenceDate:
          res.occurrenceDateTime ||
          res.occurrenceString ||
          "",
        lotNumber: res.lotNumber || "",
        manufacturer:
          res.manufacturer?.display ||
          res.manufacturer?.reference ||
          "",
        site:
          res.site?.text ||
          res.site?.coding?.[0]?.display ||
          res.site?.coding?.[0]?.code ||
          "",
        route:
          res.route?.text ||
          res.route?.coding?.[0]?.display ||
          res.route?.coding?.[0]?.code ||
          "",
        doseQuantity:
          res.doseQuantity?.value !== undefined
            ? String(res.doseQuantity.value)
            : "",
        notes: res.note?.[0]?.text || "",
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
        display:
          res.code?.text ||
          res.code?.coding?.[0]?.display ||
          res.code?.coding?.[0]?.code ||
          "",
        status: res.status || "completed",
        statusReason:
          res.statusReason?.text ||
          res.statusReason?.coding?.[0]?.display ||
          "",
        category:
          res.category?.text ||
          res.category?.coding?.[0]?.display ||
          "",
        performedDate:
          res.performedDateTime?.slice(0, 10) ||
          res.performedPeriod?.start?.slice(0, 10) ||
          "",
        performer:
          res.performer?.[0]?.actor?.display ||
          res.performer?.[0]?.actor?.reference ||
          "",
        location:
          res.location?.display ||
          res.location?.reference ||
          "",
        reasonCode:
          res.reasonCode?.[0]?.text ||
          res.reasonCode?.[0]?.coding?.[0]?.display ||
          res.reasonReference?.[0]?.display ||
          res.reasonReference?.[0]?.reference ||
          "",
        bodySite:
          res.bodySite?.[0]?.text ||
          res.bodySite?.[0]?.coding?.[0]?.display ||
          "",
        outcome:
          res.outcome?.text ||
          res.outcome?.coding?.[0]?.display ||
          "",
        notes: res.note?.[0]?.text || "",
      };

    case "DiagnosticReport":
      return {
        display:
          res.code?.text ||
          res.code?.coding?.[0]?.display ||
          res.code?.coding?.[0]?.code ||
          "",
        status: res.status || "final",
        category:
          res.category?.[0]?.text ||
          res.category?.[0]?.coding?.[0]?.display ||
          res.category?.[0]?.coding?.[0]?.code ||
          "",
        effectiveDate:
          res.effectiveDateTime?.slice(0, 10) ||
          res.effectivePeriod?.start?.slice(0, 10) ||
          "",
        issued:
          res.issued?.slice(0, 10) ||
          "",
        performer:
          res.performer?.[0]?.display ||
          res.performer?.[0]?.reference ||
          "",
        resultsInterpreter:
          res.resultsInterpreter?.[0]?.display ||
          res.resultsInterpreter?.[0]?.reference ||
          "",
        result: Array.isArray(res.result)
          ? res.result
              .map((r) => r.display || r.reference)
              .filter(Boolean)
              .join(", ")
          : "",
        conclusion: res.conclusion || "",
        conclusionCode:
          res.conclusionCode?.[0]?.text ||
          res.conclusionCode?.[0]?.coding?.[0]?.display ||
          res.conclusionCode?.[0]?.coding?.[0]?.code ||
          "",
      };

    case "Observation": {
      const display =
        res.code?.text ||
        res.code?.coding?.[0]?.display ||
        "";

      const systolic = Array.isArray(res.component)
        ? res.component.find((c) => {
            const code = c.code?.coding?.[0]?.code;
            const label =
              c.code?.text ||
              c.code?.coding?.[0]?.display ||
              "";
            return code === "8480-6" || label.includes("Systolic");
          })
        : null;

      const diastolic = Array.isArray(res.component)
        ? res.component.find((c) => {
            const code = c.code?.coding?.[0]?.code;
            const label =
              c.code?.text ||
              c.code?.coding?.[0]?.display ||
              "";
            return code === "8462-4" || label.includes("Diastolic");
          })
        : null;

      const match = VITAL_TYPES.find((v) => {
        const code = res.code?.coding?.[0]?.code;
        return v.label === display || v.code === code;
      });

      const vitalType = systolic || diastolic
        ? "Blood Pressure"
        : match
          ? match.label
          : VITAL_TYPES[0].label;

      return {
        display,
        vitalType,
        value:
          res.valueQuantity?.value != null
            ? String(res.valueQuantity.value)
            : "",
        systolic:
          systolic?.valueQuantity?.value != null
            ? String(systolic.valueQuantity.value)
            : "",
        diastolic:
          diastolic?.valueQuantity?.value != null
            ? String(diastolic.valueQuantity.value)
            : "",
        unit:
          res.valueQuantity?.unit ||
          systolic?.valueQuantity?.unit ||
          diastolic?.valueQuantity?.unit ||
          match?.unit ||
          "",
        date:
          res.effectiveDateTime?.slice(0, 10) ||
          res.effectivePeriod?.start?.slice(0, 10) ||
          "",
        notes: res.note?.[0]?.text || "",
      };
    }

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
          ? res.activity
              .map((a) =>
                a.detail?.description ||
                a.detail?.code?.text ||
                a.detail?.code?.coding?.[0]?.display
              )
              .filter(Boolean)
              .join("\n")
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
        secondary: `Status: ${res.status || "unknown"}${
          dosage ? ` · ${dosage}` : ""
        }`,
        date: firstDate(
          res.effectiveDateTime,
          res.effectivePeriod?.start,
          res.dateAsserted,
          res.date
        ),
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

    // ========================= Procedure =========================
    case "Procedure": {
      const reason =
        ccText(res.reasonCode?.[0]) ||
        refText(res.reasonReference?.[0]) ||
        res.reasonReference?.[0]?.display ||
        "";

      const bodySite = ccText(res.bodySite?.[0]);

      return {
        _id,
        primary:
          ccText(res.code) ||
          res.code?.coding?.[0]?.display ||
          res.display ||
          "Procedure",
        secondary: `Status: ${res.status || "unknown"}${
          bodySite ? ` · Site: ${bodySite}` : ""
        }${reason ? ` · ${reason}` : ""}`,
        date: firstDate(
          res.performedDateTime,
          res.performedPeriod?.start,
          res.performedPeriod?.end,
          res.meta?.lastUpdated,
          res.date
        ),
        notes: res.note?.[0]?.text,
      };
    }

    // ========================= DiagnosticReport =========================
    case "DiagnosticReport": {
  const cat =
    ccText(res.category?.[0]) ||
    res.category?.[0]?.coding?.[0]?.display ||
    res.category?.[0]?.coding?.[0]?.code ||
    "";

  const results = Array.isArray(res.result)
    ? res.result.map((r) => r.display || r.reference).filter(Boolean)
    : [];

  const secondaryParts = [`Status: ${res.status || "unknown"}`];

  if (cat) secondaryParts.push(cat);

  if (results.length) {
    secondaryParts.push(
      `${results.length} result${results.length > 1 ? "s" : ""}`
    );
  }

  return {
    _id,
    primary:
      ccText(res.code) ||
      res.code?.coding?.[0]?.display ||
      res.display ||
      "Diagnostic Report",
    secondary: secondaryParts.join(" · "),
    date: firstDate(
      res.effectiveDateTime,
      res.effectivePeriod?.start,
      res.issued,
      res.meta?.lastUpdated,
      res.date
    ),
    notes:
      res.conclusion ||
      results.slice(0, 3).join(", ") ||
      res.note?.[0]?.text,
  };
}

    // ========================= Observation(Vital Signs) =========================
    case "Observation": {
      const label = ccText(res.code) || "Observation";

      let valueStr = "";

      if (Array.isArray(res.component) && res.component.length) {
        const systolic = res.component.find((c) => {
          const code = c.code?.coding?.[0]?.code;
          const text = ccText(c.code);
          return code === "8480-6" || text.includes("Systolic");
        });

        const diastolic = res.component.find((c) => {
          const code = c.code?.coding?.[0]?.code;
          const text = ccText(c.code);
          return code === "8462-4" || text.includes("Diastolic");
        });

        if (
          systolic?.valueQuantity?.value != null ||
          diastolic?.valueQuantity?.value != null
        ) {
          const unit =
            systolic?.valueQuantity?.unit ||
            diastolic?.valueQuantity?.unit ||
            "mm[Hg]";

          valueStr = [
            systolic?.valueQuantity?.value != null
              ? `${systolic.valueQuantity.value}`
              : "",
            diastolic?.valueQuantity?.value != null
              ? `${diastolic.valueQuantity.value}`
              : "",
          ]
            .filter(Boolean)
            .join(" / ");

          if (valueStr) {
            valueStr = `${valueStr} ${unit}`;
          }
        } else {
          valueStr = res.component
            .map((c) => {
              const v = c.valueQuantity?.value;
              const u = c.valueQuantity?.unit || "";
              return v != null ? `${v}${u ? ` ${u}` : ""}` : "";
            })
            .filter(Boolean)
            .join(" / ");
        }
      } else if (res.valueQuantity?.value != null) {
        valueStr = `${res.valueQuantity.value}${
          res.valueQuantity.unit ? ` ${res.valueQuantity.unit}` : ""
        }`;
      } else if (res.valueCodeableConcept) {
        valueStr = ccText(res.valueCodeableConcept);
      } else if (res.valueString) {
        valueStr = String(res.valueString);
      } else if (res.valueBoolean != null) {
        valueStr = String(res.valueBoolean);
      }

      return {
        _id,
        primary: label,
        secondary: valueStr || `Status: ${res.status || "unknown"}`,
        date: firstDate(
          res.effectiveDateTime,
          res.effectivePeriod?.start,
          res.issued,
          res.meta?.lastUpdated,
          res.date
        ),
        notes: res.note?.[0]?.text,
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
