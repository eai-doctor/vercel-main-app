// config.js

function getBase(path, localFallback) {
  // 개발 환경
  if (import.meta.env.DEV) {
    return localFallback.replace(/\/$/, "");
  }

  // 배포 환경 (Vercel rewrite 사용)
  return path.replace(/\/$/, "");
}

const config = {
  // Core APIs
  backendUrl: getBase("/api/backend", "http://localhost:5001"),
  authServiceUrl: getBase("/api/auth", "http://localhost:7860"),

  // Microservices
  transcriptionServiceUrl: getBase("/api/transcription", "http://localhost:5004"),
  smsServiceUrl: getBase("/api/sms", "http://localhost:5003"),
  chatboxServiceUrl: getBase("/api/chatbox", "http://localhost:5005"),
  swintinyServiceUrl: getBase("/api/chatbox", "http://localhost:5030"),
  dpdServiceUrl: getBase("/api/dpd", "http://localhost:8010"),

  // External services (그대로 유지)
  merckServiceUrl:
    import.meta.env.VITE_MERCK_SERVICE_URL ||
    "https://jiming-chen-merck-manual.hf.space",

  openEmrUrl:
    import.meta.env.VITE_OPENEMR_URL ||
    "https://jiming-chen-openemr-space.hf.space",


  // Feature flags
  enableTranscription: import.meta.env.VITE_ENABLE_TRANSCRIPTION !== "false",
  enableEmail: import.meta.env.VITE_ENABLE_EMAIL !== "false",
  enableSms: import.meta.env.VITE_ENABLE_SMS !== "false",
};

export default config;