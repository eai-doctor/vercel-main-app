import config from "@/config";
import createApi from "./axiosBase";

const authApi = createApi(config.authServiceUrl);

export const authLogin = (data) => authApi.post("/login", data);
export const authRegister = (data) => authApi.post("/register", data);
export const authLogout = () => authApi.post("/logout");
export const authRefresh = () => authApi.post(`/refresh`);
export const authMe = () => authApi.get(`/me`);

export const authVerifyEmail = (data) => authApi.post("/verify-email", data);
export const authResendVerification = (data) => authApi.post("/resend-verification", data);

export const authConsent = (data) => authApi.post("/consent", data);
export const authExportData = () => authApi.get("/export");
export const authAccount = () => authApi.get("/account");

export const authUpdateProfile = (data) => authApi.put("/me", data);

export const authForgotPassword = (data) => authApi.post("/pw/forgot-password", data);
export const authResetPassword  = (data) => authApi.post("/pw/reset-password", data);
export const authPatientResetPassword  = (data) => authApi.post("/patient/reset-password", data);

export const authAdminLogin  = (data) => authApi.post("/admin/login", data);
export const authAdminReigster  = (data) => authApi.post("/admin/register", data);

export const authDoctorRegister  = (data) => authApi.post("/doctor/register", data);

