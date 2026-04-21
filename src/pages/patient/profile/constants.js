export const TAB_KEYS = [
  "Condition",
  "MedicationRequest",
  "AllergyIntolerance",
  "Observation",
  "Immunization",
];

export const VITAL_TYPES = [
  { label: "Blood Pressure", code: "85354-9", unit: "mmHg" },
  { label: "Heart Rate", code: "8867-4", unit: "bpm" },
  { label: "Body Weight", code: "29463-7", unit: "kg" },
  { label: "Body Height", code: "8302-2", unit: "cm" },
  { label: "Body Temperature", code: "8310-5", unit: "°C" },
  { label: "Oxygen Saturation", code: "2708-6", unit: "%" },
];

export const EMPTY_FORMS = {
  Condition: { display: "", status: "active", onsetDate: ""},
  MedicationRequest: { name: "", dosage: "", frequency: "", status: "active", startDate: "" },
  AllergyIntolerance: { substance: "", reaction: "", severity: "moderate" },
  Observation: { vitalType: "Blood Pressure", value: "", date: "" },
  Immunization: { vaccine: "", date: "", status: "completed" },
};