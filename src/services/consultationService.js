import axios from "axios";
import { API_URL } from "@/config/api";

export const generateConsultationSummary = async (patient_info, consultation_data) => {

  const response = await axios.post(`${API_URL}/api/generate-consultation-summary`, {
      patient_info : patient_info,
      consultation_data : consultation_data
    });

  return response.data;
};

export const generatePrescription = async (patientData) => {
  const response = await axios.post(
    `${API_URL}/api/generate-prescription`,
    { patient_data: patientData }
  );

  return response.data;
};

export const savePrescription = async (editedPrescription, patientInfo) => {

  const response = await axios.post(
    `${API_URL}/api/save-prescription`, {
        patient_id : patientInfo.patient_id,
        prescription: editedPrescription,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

  return response.data;
};

export const endConsultation = async (patientEmail, aiSummary, patient_identification) => {

  const response = await axios.post(
    `${API_URL}/api/end-consultation`, {
        patient_email: patientEmail,
        consultation_summary: aiSummary,
        patient_info: patient_identification
      }
  );

  return response.data;
};

export const updatePreferences = async (patientId, language, reportComponents, practiceApproach) => {

  const response = await axios.patch(
    `${API_URL}/api/update-preferences`, {
        patientId : patientId,
        language : language,
        report_components : reportComponents,
        practice_approach : practiceApproach
      });


  return response.data;
};

export const getInferFHIR = async (patientData) => {
  const response = await axios.post(`${API_URL}/api/mixehr/infer-fhir`, {
            patient_data: patientData,
            iterations: 10,
            top_k: 5
          });
  return response.data;
};

export const extractLabPdf = async (base64) => {
  const response = await axios.post(`${API_URL}/api/analyze-lab-pdf`, {
      pdf_data: base64,
      // prompt: "Extract the following information from this lab report: date, test category, test name, result value, unit, reference range, and any relevant notes. Return the data in JSON format."
  });
  return response.data;
};