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

const getFHIRPatients = () => 
  medicalApi.get(`/medical-records/fhir/patients`);

const getFHIRRecords = (patientId, type=null) => 
  medicalApi.get(`/medical-records/fhir/patients/${patientId}/records`);

const updateFHIRRRecord = (patient_id, resource_type, record_id, form) =>
  medicalApi.put(`/medical-records/fhir/patients/${patient_id}/records/${resource_type}/${record_id}`, {form});

const deleteFHIRRRecord = (patient_id, resource_type, record_id) => 
  medicalApi.delete(`/medical-records/fhir/patients/${patient_id}/records/${resource_type}/${record_id}`);


const medicalRecordApi = {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  getFHIRPatients,
  getFHIRRecords,
  updateFHIRRRecord,
  deleteFHIRRRecord
};

export default medicalRecordApi;