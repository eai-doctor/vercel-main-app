import createApi from "./axiosBase";
import config from "@/config";

// common api path
const medicalApi = createApi(config.backendUrl);

const getRecords = (userId, type) => 
  medicalApi.get(`/medical-record/${userId}`, { params: { type } });

export const createRecord = (userId, resourceType, form) =>
  medicalApi.post(`/medical-record/${userId}`, {
    resource_type: resourceType,
    form,
  });

export const updateRecord = (userId, recordId, resourceType, form) =>
  medicalApi.put(`/medical-record/${userId}/${recordId}`, {
    resource_type: resourceType,
    form,
  });


const deleteRecord = (userId, recordId, type) => 
  medicalApi.delete(`/medical-record/${userId}/${recordId}`, { params: { type } });

const getFHIRPatients = () => 
  medicalApi.get(`/fhir/patients`);

const getFHIRRecords = (patientId, type=null) => 
  medicalApi.get(`/fhir/patients/${patientId}/records`);

const createFHIRRRecord = (patient_id, resource_type, form) =>
  medicalApi.post(`/fhir/create/${patient_id}/records/${resource_type}`, {form});

const updateFHIRRRecord = (patient_id, resource_type, record_id, form, original) =>
  medicalApi.put(`/fhir/update/${patient_id}/records/${resource_type}/${record_id}`, {form, original});

const deleteFHIRRRecord = (patient_id, resource_type, record_id) => 
  medicalApi.delete(`/fhir/delete/${patient_id}/records/${resource_type}/${record_id}`);


const medicalRecordApi = {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  getFHIRPatients,
  getFHIRRecords,
  createFHIRRRecord,
  updateFHIRRRecord,
  deleteFHIRRRecord
};

export default medicalRecordApi;