// src/api/patientApi.js
import config from "@/config";
import createApi from "./axiosBase";

const patientApi = createApi(config.backendUrl);

export const getPatients = () => {
  return patientApi.get(`/patient/list`);
};

export const getAssignedPatients = (searchTerm = "") => {
  return patientApi.get(`/patient/assigned_patients`, {
    params: {
      search: searchTerm.trim() 
    }
  });
};

export const getPatientDetails = (patientId) => 
  patientApi.get(`/patient/get/${patientId}`);

export default {
  getPatients,
  getAssignedPatients,
  getPatientDetails
};