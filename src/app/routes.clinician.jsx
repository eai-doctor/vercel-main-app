import {
    HomePage,
    PatientSelector,
    Consultation,
    FunctionSelector
} from '@/pages/clinician'

export const clinicianRoutes = [
  {
    path: "/clinics",
    element: <HomePage />,
  },
  {
    path: "/patients",
    element: <PatientSelector />,
  },
  {
    path: "/consultation",
    element: <Consultation />,
  },
  // {
  //   path: "/consultation-direct",
  //   element: <InitialConsultationUI />,
  // },
  {
    path: "/functions",
    element: <FunctionSelector />,
  },
  // {
  //   path: "/prescriptions",
  //   element: <PrescriptionList />,
  // },
  // {
  //   path: "/ehrbase-patients",
  //   element: <EHRbasePatientList />,
  // },
];

