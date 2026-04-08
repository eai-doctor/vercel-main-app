import config from "@/config";
import createApi from "./axiosBase";

const api = createApi(config.backendUrl);

export const recordConsultationStream = (formData) =>
  api.post("/api/record-consultation-stream", formData, {
    headers: { 'Content-Type': undefined }  
  });

// --- Consultation Summary ---
export const generateConsultationSummary = (patient_info, consultation_data) =>
  api.post("/api/generate-consultation-summary", {
    patient_info,
    consultation_data,
  });

// --- Prescription Management ---
export const generatePrescription = (patientData, patientMedicalData) =>
  api.post("/api/generate-prescription", { 
    patient_data: patientData
  });

export const savePrescription = (patientId, prescriptionId, editedPrescription) =>
  api.post("/api/save-prescription", {
    patient_id: patientId,
    prescription_id : prescriptionId,
    prescription: editedPrescription,
  }, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

export const updatePrescription = (patientId, prescriptionId, editedPrescription) =>
  api.post("/api/update-prescription", {
    patient_id: patientId,
    prescription_id : prescriptionId,
    prescription: editedPrescription,
  }, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

// --- Consultation Lifecycle ---
export const endConsultation = (patientEmail, aiSummary, patient_identification) =>
  api.post("/api/end-consultation", {
    patient_email: patientEmail,
    consultation_summary: aiSummary,
    patient_info: patient_identification
  });

// --- Preferences & Settings ---
export const updatePreferences = (patientId, language, reportComponents, practiceApproach) =>
  api.patch("/api/update-preferences", {
    patientId,
    language,
    report_components: reportComponents,
    practice_approach: practiceApproach
  });

// --- Advanced Analysis (FHIR & PDF) ---
export const getInferFHIR = (patientData) =>
  api.post("/api/mixehr/infer-fhir", {
    patient_data: patientData,
    iterations: 10,
    top_k: 5
  });

export const extractLabPdf = (base64) =>
  api.post("/api/analyze-lab-pdf", {
    pdf_data: base64,
  });

export const uploadReport = (formData) =>
  api.post("/api/upload-report", formData, {
    headers: { 'Content-Type': undefined }  
  });

const consultationApi = {
  generateConsultationSummary,
  generatePrescription,
  savePrescription,
  updatePrescription,
  endConsultation,
  updatePreferences,
  getInferFHIR,
  extractLabPdf,
  uploadReport
};

export default consultationApi;