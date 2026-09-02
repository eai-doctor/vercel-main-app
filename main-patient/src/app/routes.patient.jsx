import PersonalHome from "@/pages/patient/home.jsx";
import MedicalProfile from "@/pages/patient/profile/index.jsx";
import HealthConsultation from "@/pages/patient/health_consultation/index.jsx";
import MedicalReportAnalysis from "@/pages/patient/medical_report_analysis/index.jsx";
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
