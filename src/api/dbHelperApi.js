import config from "@/config";
import createApi from "./axiosBase";

const api = createApi(config.backendUrl);

export const saveDemoRequest = (name, email, phone, clinic_name, role, note) =>
  api.post( `/demo-request/save`,
        {
          name:name,
          email:email,
          phone:phone,
          clinic_name:clinic_name,
          role:role,
          note:note
        });

export const listDemoRequests =() =>
  api.get(`/demo-request/list`);

const dbHelperApi = {
  saveDemoRequest,
  listDemoRequests
};

export default dbHelperApi;