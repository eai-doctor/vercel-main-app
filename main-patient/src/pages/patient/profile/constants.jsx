export { VITAL_TYPES, EMPTY_FORMS } from "@/constants/healthRecords.jsx";
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


