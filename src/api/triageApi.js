import config from "@/config";
import createApi from "./axiosBase";

const triageApi = createApi(config.backendUrl);

// --- Triage ---
export const triageAssess = (data) =>
  triageApi.post("/api/triage", {
    ...data,
    include_evidence: true,
  });

// --- Symptoms autocomplete ---
export const triageGetSymptoms = (query) =>
  triageApi.get("/api/triage/symptoms", {
    params: { q: query },
  });

const triageEngineApi = {
  triageAssess,
  triageGetSymptoms,
};

export default triageEngineApi;