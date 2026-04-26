import createApi from "./axiosBase";
import config from "@/config";

// common api path
const medicalApi = createApi(config.backendUrl);

const getRecords = (userId, type) => 
  medicalApi.get(`/medical-records/${userId}`, { params: { type } });

export const createRecord = (userId, resourceType, form) =>
  medicalApi.post(`/medical-records/${userId}`, {
    resource_type: resourceType,
    form,
  });

export const updateRecord = (userId, recordId, resourceType, form) =>
  medicalApi.put(`/medical-records/${userId}/${recordId}`, {
    resource_type: resourceType,
    form,
  });


const deleteRecord = (userId, recordId, type) => 
  medicalApi.delete(`/medical-records/${userId}/${recordId}`, { params: { type } });

const medicalRecordApi = {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
};

export default medicalRecordApi;