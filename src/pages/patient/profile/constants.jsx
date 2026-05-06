import {
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  Syringe,
  PillBottle,
  Scissors,
  FileText,
  Flag as FlagIcon,
  ClipboardList,
  Users,
} from "lucide-react";

const ICON_CLS = "w-[18px] h-[18px] text-[#2C3B8D]";

// TAB
export const TAB_KEYS = [
    "Condition",
    "AllergyIntolerance",
    "MedicationStatement",
    "MedicationRequest",
    "Immunization",
    "Procedure",
    "DiagnosticReport",
    "Observation",
    "CarePlan",
    "Flag",
    "FamilyMemberHistory",
];

export const TAB_ICONS = {
  Condition: <Stethoscope className={ICON_CLS} />,
  MedicationRequest: <Pill className={ICON_CLS} />,
  AllergyIntolerance: <ShieldAlert className={ICON_CLS} />,
  Observation: <Activity className={ICON_CLS} />,
  Immunization: <Syringe className={ICON_CLS} />,
  MedicationStatement: <PillBottle className={ICON_CLS} />,
  Procedure: <Scissors className={ICON_CLS} />,
  DiagnosticReport: <FileText className={ICON_CLS} />,
  Flag: <FlagIcon className={ICON_CLS} />,
  CarePlan: <ClipboardList className={ICON_CLS} />,
  FamilyMemberHistory: <Users className={ICON_CLS} />,
};

export const VITAL_TYPES = [
  { label: "Heart Rate", code: "8867-4", unit: "/min" },
  { label: "Respiratory Rate", code: "9279-1", unit: "/min" },
  { label: "Oxygen Saturation", code: "2708-6", unit: "%" },
  { label: "Body Temperature", code: "8310-5", unit: "Cel" },
  { label: "Body Height", code: "8302-2", unit: "cm" },
  { label: "Body Weight", code: "29463-7", unit: "kg" },
  { label: "Body Mass Index", code: "39156-5", unit: "kg/m2" },
  { label: "Head Circumference", code: "9843-4", unit: "cm" },
  { label: "Blood Pressure", code: "85354-9", unit: "mm[Hg]" },
];


// FHIR ValueSet shortcuts used by select inputs across new tabs
export const STATUS_OPTIONS = {
  MedicationStatement: [
    "active",
    "completed",
    "entered-in-error",
    "intended",
    "stopped",
    "on-hold",
    "unknown",
    "not-taken",
  ],
  Procedure: [
    "preparation",
    "in-progress",
    "not-done",
    "on-hold",
    "stopped",
    "completed",
    "entered-in-error",
    "unknown",
  ],
  DiagnosticReport: [
    "registered",
    "partial",
    "preliminary",
    "final",
    "amended",
    "corrected",
    "appended",
    "cancelled",
    "entered-in-error",
    "unknown",
  ],
  Flag: ["active", "inactive", "entered-in-error"],
  CarePlan: [
    "draft",
    "active",
    "on-hold",
    "revoked",
    "completed",
    "entered-in-error",
    "unknown",
  ],
  FamilyMemberHistory: [
    "partial",
    "completed",
    "entered-in-error",
    "health-unknown",
  ],
};

export const CAREPLAN_INTENTS = [
  "proposal",
  "plan",
  "order",
  "option",
  "directive",
];

// Common HL7 v3 RoleCode shortcuts used for FamilyMemberHistory.relationship
export const FAMILY_RELATIONSHIPS = [
  "MTH", // mother
  "FTH", // father
  "SIB", // sibling
  "BRO", // brother
  "SIS", // sister
  "DAU", // daughter
  "SON", // son
  "GRMTH", // grandmother
  "GRFTH", // grandfather
  "AUNT",
  "UNCLE",
  "COUSN",
  "SPS", // spouse
];

export const ADMIN_GENDER = ["male", "female", "other", "unknown"];

export const EMPTY_FORMS = {
  Condition: { display: "", status: "active", onsetDate: "" },
  MedicationRequest: {
    medication: "",
    dosage: "",
    frequency: "",
    status: "active",
    date: "",
  },
  AllergyIntolerance: {
    display: "",
    substance: "",
    type: "allergy",
    category: "medication",
    criticality: "low",
    status: "active",
    date: "",
  },
  Observation: {
    display: "",
    vitalType: "Blood Pressure",
    value: "",
    unit: "",
    system: "",
    date: "",
  },
  Immunization: { vaccine: "", date: "", status: "completed" },
  MedicationStatement: {
    medication: "",
    status: "active",
    statusReason: "",
    category: "outpatient",
    effectiveDate: "",
    dateAsserted: "",
    reasonCode: "",
    dosage: "",
    notes: "",
  },
  Procedure: {
    display: "",
    status: "completed",
    statusReason: "",
    category: "",
    performedDate: "",
    performer: "",
    location: "",
    reasonCode: "",
    bodySite: "",
    outcome: "",
    notes: "",
  },
  DiagnosticReport: {
    display: "",
    status: "final",
    category: "",
    effectiveDate: "",
    issued: "",
    performer: "",
    resultsInterpreter: "",
    result: "",
    conclusion: "",
    conclusionCode: "",
  },
  Flag: {
    display: "",
    status: "active",
    category: "",
    periodStart: "",
    periodEnd: "",
    author: "",
    encounter: "",
    notes: "",
  },
  CarePlan: {
    title: "",
    description: "",
    status: "active",
    intent: "plan",
    category: "",
    periodStart: "",
    periodEnd: "",
    author: "",
    addresses: "",
    activity: "",
    notes: "",
  },
  FamilyMemberHistory: {
    name: "",
    relationship: "MTH",
    status: "completed",
    sex: "unknown",
    bornDate: "",
    age: "",
    deceasedBoolean: false,
    deceasedDate: "",
    condition: "",
    reasonCode: "",
    notes: "",
    date: "",
  },
};
