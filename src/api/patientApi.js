// src/api/patientApi.js
import config from "@/config";
import createApi from "./axiosBase";

const patientApi = createApi(config.backendUrl);

export const getPatients = (lang = "en") => {
  return patientApi.get(`/patient/list/${lang}`);
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