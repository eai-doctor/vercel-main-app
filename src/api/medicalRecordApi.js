import createApi from "./axiosBase";
import config from "@/config";

// common api path
const medicalApi = createApi(config.backendUrl);

const getRecords = (userId, type) => 
  medicalApi.get(`/api/medical-records/${userId}`, { params: { type } });

/**
 * 의료 기록 추가
 * @param {string} userId - 사용자 ID
 * @param {object} data - { resource_type, resource }
 */
const createRecord = (userId, data) => 
  medicalApi.post(`/api/medical-records/${userId}`, data);

/**
 * 의료 기록 수정
 * @param {string} userId - 사용자 ID
 * @param {string} recordId - 기록의 고유 ID (_id)
 * @param {object} data - { resource }
 */
const updateRecord = (userId, recordId, data) => 
  medicalApi.put(`/api/medical-records/${userId}/${recordId}`, data);

/**
 * 의료 기록 삭제
 * @param {string} userId - 사용자 ID
 * @param {string} recordId - 기록의 고유 ID (_id)
 */
const deleteRecord = (userId, recordId, type) => 
  medicalApi.delete(`/api/medical-records/${userId}/${recordId}`, { params: { type } });

const medicalRecordApi = {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
};

export default medicalRecordApi;