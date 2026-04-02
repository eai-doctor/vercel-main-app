import {
  PatientHomePage,
  MedicalProfile
} from '@/pages/patient';
import { TriageEngine } from '@/pages/function';
import { PatientOnlyGuard } from "@/app/RouteGuard";

export const patientRoutes = [
  { path: "/", element: <PatientHomePage /> },
  { path: "/medical-profile", element: <PatientOnlyGuard><MedicalProfile /></PatientOnlyGuard> },
  { path: "/triage-engine", element: <PatientOnlyGuard><TriageEngine /></PatientOnlyGuard> },
];
