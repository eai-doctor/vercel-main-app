import config from "@/config";
import createApi from "./axiosBase";

const backApi = createApi(config.backendUrl);
const api = createApi("https://vercel-chat-alpha.vercel.app");

export const getSuggestions =(patientSummary) =>
  api.post(`/api/chat/suggestions`,
        {
          patient_summary: patientSummary || '',
          mode: 'clinician'
        }
      )

export const sendMessage = (textToSend, patientSummary, messages) =>
  api.post( `/api/chat`,
        {
          message: textToSend,
          patient_summary: patientSummary || '',
          chat_history: messages,
          mode: 'clinician'
        });
      
export const getConsultationSummaries = () => 
  backApi.get('/api/consultation-summaries/symptoms')

export const uploadLabReport = () =>
  backApi.post(`/api/lab-report/upload`,formData,{ headers: uploadHeaders })


const chatApi = {
    getSuggestions,
    sendMessage,
    getConsultationSummaries,
    uploadLabReport
};

export default chatApi;
