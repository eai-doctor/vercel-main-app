import config from "@/config";
import createApi from "./axiosBase";

const triageApi = createApi(config.backendUrl);

// --- Triage ---
export const triageAssess = (data, languageCode) =>
  triageApi.post("/api/triage", {
    ...data,
    language : languageCode,
    include_evidence: true,
  });

// --- Symptoms autocomplete ---
export const triageGetSymptoms = (query, lang ) =>
  triageApi.get("/api/triage/symptoms", {
    params: { q: query, lang : lang  }, 
  });

const triageEngineApi = {
  triageAssess,
  triageGetSymptoms,
};

export default triageEngineApi;