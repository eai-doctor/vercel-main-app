import axios from "axios";

// 메모리에 토큰을 임시 저장할 변수 (보안을 위해 클로저 내부에 둠)
let accessToken = null;

/**
 * 외부(AuthContext 등)에서 로그인/리프레시 성공 시 
 * 이 함수를 호출하여 토큰을 인터셉터에 공유합니다.
 */
export const setStoredToken = (token) => {
  accessToken = token;
};

const createApi = (baseURL) => {
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true, 
  });

  instance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // [Response Interceptor] 응답을 받았을 때 실행 (선택 사항)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // 401 에러(만료 등) 발생 시 공통 처리 로직을 여기에 넣을 수 있습니다.
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApi;