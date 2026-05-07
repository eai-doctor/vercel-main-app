import config from "@/config";
import createApi from "./axiosBase";

const api = createApi(config.backendUrl);

export const recordConsultationStream = (formData) =>
  api.post("/consultation/record-consultation-stream", formData, {
    withCredentials: true,
    headers: { 'Content-Type': undefined },
    responseType: 'text'
  });

// --- Consultation Summary ---
export const generateConsultationSummary = (patient_info, consultation_data) =>
  api.post("/consultation/generate-consultation-summary", {
    patient_info,
    consultation_data,
  });

// --- Prescription Management ---
export const generatePrescription = (patientData, patientMedicalData) =>
  api.post("/prescription/generate", { 
    patient_data: patientData
  });

export const savePrescription = (patientId, prescriptionId, editedPrescription) =>
  api.post("/prescription/save", {
    patient_id: patientId,
    prescription_id : prescriptionId,
    prescription: editedPrescription,
  }, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

export const updatePrescription = (patientId, prescriptionId, editedPrescription) =>
  api.post("/prescription/update", {
    patient_id: patientId,
    prescription_id : prescriptionId,
    prescription: editedPrescription,
  }, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });

// --- Consultation Lifecycle ---
export const endConsultation = (patientEmail, aiSummary, patient_identification) =>
  api.post("/consultation/end-consultation", {
    patient_email: patientEmail,
    consultation_summary: aiSummary,
    patient_info: patient_identification
  });

// --- Preferences & Settings ---
export const updatePreferences = (patientId, language, reportComponents, practiceApproach) =>
  api.patch("/update-preferences", {
    patientId,
    language,
    report_components: reportComponents,
    practice_approach: practiceApproach
  });

// --- Advanced Analysis (FHIR & PDF) ---
export const getInferFHIR = (patientData) =>
  api.post("/mixehr/infer-fhir", {
    patient_data: patientData,
    iterations: 10,
    top_k: 5
  });

export const extractLabPdf = (base64) =>
  api.post("/analyze-lab-pdf", {
    pdf_data: base64,
  });

export const uploadReport = (formData) =>
  api.post("/upload-report", formData, {
    headers: { 'Content-Type': undefined }  
  });

export const getSoap = (payload, forceRegenerate = false) =>
  api.post(`/soap/get-note`, { patient_data: payload, force_regenerate: forceRegenerate });

export const saveConsultationToRecord = (mrn, findings) =>
  api.post(`/api/patients/${mrn}/update-from-consultation`, findings);

const consultationApi = {
  generateConsultationSummary,
  generatePrescription,
  savePrescription,
  updatePrescription,
  endConsultation,
  updatePreferences,
  getInferFHIR,
  extractLabPdf,
  uploadReport,
  getSoap,
  saveConsultationToRecord,
  recordConsultationStream
};

export default consultationApi;