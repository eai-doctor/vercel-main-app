import axios from "axios";
import { API_URL } from "@/config/api";

export const labResults = async (patientId, newLabResult) => {
  const response = await await axios.post(
            `${API_URL}/api/patients/${patientId}/lab-results`,
            newLabResult
        );

  return response;
};

export const getPatientByPatientId = async (patientId) => {
  const response = await axios.get(
            `${API_URL}/api/patients/${patientId}`
    );

  return response;
};