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

export const getChatHistory =(userId) =>
  backApi.get(`/chat/${userId}`);
      
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

export const saveMessage = (message, response, user_id) =>
  backApi.post( `/chat/save`,
        {
          message: message,
          response: response,
          user_id: user_id,
        });


export const sendPatientMessage = (data, chatHeaders) =>
  api.post( `/api/chat`, data, { headers: chatHeaders });
      
export const getConsultationSummaries = () => 
  backApi.get('/consultation-summarie/symptoms')

export const generateConsultationSummaries = (cleanMessages) => 
  backApi.post('/consultation-summarie/generate', {
        messages: cleanMessages,
      })

export const saveConsultationSummaries = (chatSummary, cleanMessages, summaryModelUsed) =>
  backApi.post('/consultation-summarie/save',{
        summary: chatSummary,
        messages: cleanMessages,
        model_used: summaryModelUsed,
      })
  
export const uploadLabReport = (formData, uploadHeaders) =>
  api.post(`/lab-report/upload`,formData,{ headers: uploadHeaders })


const chatApi = {
    getSuggestions,
    getChatHistory,
    askAboAi,
    sendMessage,
    saveMessage,
    sendPatientMessage,
    getConsultationSummaries,
    generateConsultationSummaries,
    saveConsultationSummaries,
    uploadLabReport
};

export default chatApi;
