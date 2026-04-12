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
      
export const askAboAi = (userMessage, chatHistory ) =>
  api.post("/api/chat", {
          message: userMessage,
          patient_summary: "",
          chat_history: chatHistory,
          mode: 'clinician'
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": ""
          }
        });

export const sendMessage = (textToSend, patientSummary, messages) =>
  api.post( `/api/chat`,
        {
          message: textToSend,
          patient_summary: patientSummary || '',
          chat_history: messages,
          mode: 'clinician'
        });

export const sendPatientMessage = (data, chatHeaders) =>
  api.post( `/api/chat`, data, { headers: chatHeaders });
      
export const getConsultationSummaries = () => 
  backApi.get('/api/consultation-summaries/symptoms')

export const generateConsultationSummaries = (cleanMessages) => 
  backApi.post('/api/consultation-summaries/generate', {
        messages: cleanMessages,
      })

export const saveConsultationSummaries = (chatSummary, cleanMessages, summaryModelUsed) =>
  backApi.post('/api/consultation-summaries/save',{
        summary: chatSummary,
        messages: cleanMessages,
        model_used: summaryModelUsed,
      })
  
export const uploadLabReport = () =>
  backApi.post(`/api/lab-report/upload`,formData,{ headers: uploadHeaders })


const chatApi = {
    getSuggestions,
    askAboAi,
    sendMessage,
    sendPatientMessage,
    getConsultationSummaries,
    generateConsultationSummaries,
    saveConsultationSummaries,
    uploadLabReport
};

export default chatApi;
