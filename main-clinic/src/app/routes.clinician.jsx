import HomePage from "@/pages/clinician/Home.jsx";
import PatientSelector from "@/pages/clinician/PatientSelector.jsx";
import Consultation from "@/pages/clinician/consultation/index.jsx";
import FunctionSelector from "@/pages/clinician/functions/FunctionSelector.jsx";

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
  }
  // {
  //   path: "/prescriptions",
  //   element: <PrescriptionList />,
  // },
  // {
  //   path: "/ehrbase-patients",
  //   element: <EHRbasePatientList />,
  // },
];

