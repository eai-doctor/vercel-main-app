import config from "@/config";
import createApi from "./axiosBase";

const authApi = createApi(config.authServiceUrl);

export const authLogin = (data) => authApi.post("/api/auth/login", data);
export const authRegister = (data) => authApi.post("/api/auth/register", data);
export const authLogout = () => authApi.post("/api/auth/logout");
export const authRefresh = () => authApi.post(`/api/auth/refresh`);
export const authMe = () => authApi.get(`/api/auth/me`);

export const authVerifyEmail = (data) => authApi.post("/api/auth/verify-email", data);
export const authResendVerification = (data) => authApi.post("/api/auth/resend-verification", data);

export const authConsent = (data) => authApi.post("/api/auth/consent", data);
export const authExportData = () => authApi.get("/api/auth/export");
export const authAccount = () => authApi.get("/api/auth/account");

export const authUpdateProfile = (data) => authApi.put("/api/auth/me", data);

export const authForgotPassword = (data) => authApi.post("/api/auth/forgot-password", data);
export const authResetPassword  = (data) => authApi.post("/api/auth/reset-password", data);
