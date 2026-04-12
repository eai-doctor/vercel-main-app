// src/api/patientApi.js
import config from "@/config";
import createApi from "./axiosBase";

const patientApi = createApi(config.backendUrl);

export const getPatients = () => {
  return patientApi.get(`/api/patients`);
};

export const getAssignedPatients = (searchTerm = "") => {
  return patientApi.get(`/api/assigned_patients`, {
    params: {
      search: searchTerm.trim() 
    }
  });
};

/**
 * 특정 환자의 상세 데이터 가져오기
 */
export const getPatientDetails = (patientId) => 
  patientApi.get(`/api/patient/${patientId}`);

export default {
  getPatients,
  getAssignedPatients,
  getPatientDetails
};