function getBase(path, localFallback) {
  if (import.meta.env.DEV) {
    return localFallback.replace(/\/$/, "");
  }
  return path.replace(/\/$/, "");
}

function getBase(path, envVar, localFallback) {
  if (import.meta.env.DEV) {
    return localFallback.replace(/\/$/, "");
  }
  if (envVar) {
    return envVar.replace(/\/$/, "");
  }
  return path.replace(/\/$/, "");
}

const config = {
  backendUrl: getBase("/api/backend", import.meta.env.VITE_BACKEND_URL, "http://localhost:5001"),
  authServiceUrl: getBase("/api/auth", import.meta.env.VITE_AUTH_URL, "http://localhost:7860"),
  dpdServiceUrl: getBase("/api/dpd", import.meta.env.VITE_DPD_URL, "http://localhost:8010"),
  swintinyServiceUrl: getBase("/api/swintiny", import.meta.env.VITE_SWINTINY_URL, "http://localhost:5030"),
  clipVitb16ServiceUrl: getBase("/api/clip-vitb16", import.meta.env.VITE_CLIP_URL, "http://localhost:5020"),

  transcriptionServiceUrl: getBase("/api/transcription", null, "http://localhost:5004"),
  smsServiceUrl: getBase("/api/sms", null, "http://localhost:5003"),
  chatboxServiceUrl: getBase("/api/chatbox", null, "http://localhost:5005"),

  merckServiceUrl: import.meta.env.VITE_MERCK_SERVICE_URL || "https://jiming-chen-merck-manual.hf.space",
  openEmrUrl: import.meta.env.VITE_OPENEMR_URL || "https://jiming-chen-openemr-space.hf.space",

  enableTranscription: import.meta.env.VITE_ENABLE_TRANSCRIPTION !== "false",
  enableEmail: import.meta.env.VITE_ENABLE_EMAIL !== "false",
  enableSms: import.meta.env.VITE_ENABLE_SMS !== "false",
};

export default config;