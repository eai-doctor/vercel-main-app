import { 
    AskEboAI,
    // DrugBank,
    FollowUps, 
    PatientQuery,
    SkinCancerDetection,
    RetinalDiseaseDetection,
    MerckManual,
    PubMed, 
    HealthCanadaDrugBank, 
    // OpenEMR, 
    TranscribeDictate, 
} from '@/pages/clinician/functions';
import { TriageEngine } from '@/pages/function';


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
  { path: "/functions/drug-bank", element: <HealthCanadaDrugBank /> },
  // { path: "/functions/openemr", element: <OpenEMR /> },
];