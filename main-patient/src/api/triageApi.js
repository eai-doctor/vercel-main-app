import config from "@/config";
import createApi from "./axiosBase";

const triageApi = createApi(config.backendUrl);

// --- Triage ---
export const triageAssess = (data, languageCode) =>
  triageApi.post("/triage/perform", {
    ...data,
    language : languageCode,
    include_evidence: true,
  });

// --- CTAS schema ---
export const triageGetSchema = () =>
  triageApi.get("/triage/schema");

const triageEngineApi = {
  triageAssess,
  triageGetSchema,
};

export default triageEngineApi;
