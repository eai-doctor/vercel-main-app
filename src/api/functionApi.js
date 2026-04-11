import config from "@/config";
import createApi from "./axiosBase";

const api = createApi(config.backendUrl);
const durgbankApi = createApi(config.dpdServiceUrl);
const swintinyApi = createApi(config.swintinyServiceUrl);

// --- FollowUps ---
export const getMessageTemplates = () =>
  api.get("/api/message-templates");

export const sendFollowup = (selectedMethod, recipients ) =>
  api.post("/api/send-followup", {
        method: selectedMethod,
        recipients: recipients
  });


export const getMerk = (searchTerm) => 
  api.get(`/api/merck`, { params: { searchTerm : searchTerm }});

export const getPubMed = (keywords, filters) => 
  api.post(`/api/pubmed/search`, {
        keywords,
        filters,
        max_results: 50,
      });

export const fetchPubMed = ( pmids ) =>
   api.post(`/api/pubmed/fetch`, { pmids });

export const getDrugBank = ( body ) =>
  durgbankApi.post(`/dpd/lookup`, body);

export const predictSwintiny = (formData) => {
  return swintinyApi.post("/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const functionApi = {
  getMessageTemplates,
  sendFollowup,
  getMerk,
  getPubMed,
  fetchPubMed,
  getDrugBank,
  predictSwintiny
};

export default functionApi;