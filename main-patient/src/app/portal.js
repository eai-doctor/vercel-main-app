export const PORTAL_ROLE = "patient";
export const PORTAL_HOME = "/";
export const LOGIN_PATH = "/login";
export const acceptsRole = role => role === "patient";
export const OTHER_PORTAL_URL = import.meta.env.VITE_CLINICIAN_APP_URL || (import.meta.env.DEV ? "http://127.0.0.1:5181" : "");
