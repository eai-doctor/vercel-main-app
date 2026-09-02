import AskEboAI from "@/pages/clinician/functions/AskEboAI.jsx";
import FollowUps from "@/pages/clinician/functions/FollowUps.jsx";
import PatientQuery from "@/pages/clinician/functions/PatientQuery.jsx";
import SkinCancerDetection from "@/pages/clinician/functions/SkinCancerDetection.jsx";
import RetinalDiseaseDetection from "@/pages/clinician/functions/RetinalDiseaseDetection.jsx";
import MerckManual from "@/pages/clinician/functions/MerckManual.jsx";
import PubMed from "@/pages/clinician/functions/PubMed.jsx";
import HealthCanadaDrugBank from "@/pages/clinician/functions/HealthCanadaDrugBank.jsx";
import TranscribeDictate from "@/pages/clinician/functions/transcribe/index.jsx";
import { TriageEngine } from '@/pages/public/function';


export const functionRoutes = [
  { path: "/functions/transcribe", element: <TranscribeDictate /> },
  { path: "/functions/ask-ebo-ai", element: <AskEboAI /> },
  { path: "/functions/followups", element: <FollowUps /> },
  { path: "/functions/patient-query", element: <PatientQuery /> },
  { path: "/functions/skin-cancer-detection", element: <SkinCancerDetection /> },
  { path: "/functions/retinal-disease-detection", element: <RetinalDiseaseDetection /> },
  { path: "/functions/triage-engine", element: <TriageEngine /> },
  { path: "/functions/merck-manual", element: <MerckManual /> },
  { path: "/functions/pubmed", element: <PubMed /> },
  { path: "/functions/drug-bank", element: <HealthCanadaDrugBank /> },
  // { path: "/functions/openemr", element: <OpenEMR /> },
];