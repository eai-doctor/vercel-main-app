import axios from "axios";

const createApi = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      // if (err.response?.status === 401) {
      //   window.location.href = "/";
      // }
      return Promise.reject(err);
    }
  );

  return instance;
};

export default createApi;