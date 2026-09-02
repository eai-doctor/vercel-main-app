export const PORTAL_ROLE = "clinician";
export const PORTAL_HOME = "/clinics";
export const LOGIN_PATH = "/clinic-join?mode=login";
export const acceptsRole = role => ["clinician", "admin"].includes(role);
export const OTHER_PORTAL_URL = import.meta.env.VITE_PATIENT_APP_URL || (import.meta.env.DEV ? "http://127.0.0.1:5182" : "");
