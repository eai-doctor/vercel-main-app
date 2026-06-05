import {
  PersonalHome,
  MedicalProfile,
  HealthConsultation,
  MedicalReportAnalysis,
} from '@/pages/patient';
import { TriageEngine } from '@/pages/public/function';
import { PatientOnlyGuard } from "@/app/RouteGuard";

export const patientRoutes = [
  { path: "/", element: <PersonalHome /> },
  { path: "/signup", element: <PersonalHome /> },
  { path: "/health-consultation", element: <HealthConsultation /> },
  { path: "/medical-profile", element: <PatientOnlyGuard><MedicalProfile /></PatientOnlyGuard> },
  { path: "/triage-engine", element: <PatientOnlyGuard><TriageEngine /></PatientOnlyGuard> },
  { path: "/medical-report-analysis", element: <MedicalReportAnalysis /> },
];
