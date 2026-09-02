// src/api/patientApi.js
import config from "@/config";
import createApi from "./axiosBase";

const patientApi = createApi(config.backendUrl);

export const getPatients = async (lang = "en") => {
  const response = await patientApi.get(`/patient/list/${lang}`);
  if (import.meta.env.DEV) {
    const data = response.data;
    console.info("Patient list response", {
      keys: data && typeof data === "object" ? Object.keys(data) : [],
      count: Array.isArray(data?.patients) ? data.patients.length : Array.isArray(data) ? data.length : null,
    });
  }
  return response;
};

export const getAssignedPatients = (searchTerm = "") => {
  return patientApi.get(`/patient/assigned_patients`, {
    params: {
      search: searchTerm.trim() 
    }
  });
};

export const getPatientDetails = (patientId, lang) => 
  patientApi.get(`/patient/get/${lang}/${patientId}`);

export default {
  getPatients,
  getAssignedPatients,
  getPatientDetails
};
