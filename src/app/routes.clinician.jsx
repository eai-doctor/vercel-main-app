import {
    HomePage,
    PatientSelector,
    Consultation
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
  // {
  //   path: "/function-libraries",
  //   element: <FunctionLibraries />,
  // },
  // {
  //   path: "/prescriptions",
  //   element: <PrescriptionList />,
  // },
  // {
  //   path: "/ehrbase-patients",
  //   element: <EHRbasePatientList />,
  // },
];

