// 033026 saebyeok - config.js
function getEnv(name, fallback) {
  const value = import.meta.env[name];

  if (!value) {
    if (import.meta.env.DEV && fallback) {
      console.warn(`[config] Using fallback for ${name}: ${fallback}`);
      return fallback.replace(/\/$/, "");
    }

    throw new Error(`Missing environment variable: ${name}`);
  }

  return value.replace(/\/$/, "");
}

const config = {
  // Core APIs
  backendUrl: getEnv("VITE_BACKEND_URL", "http://localhost:5001"),
  authServiceUrl: getEnv("VITE_AUTH_SERVICE_URL", "http://localhost:7860"),

  // Microservices
  transcriptionServiceUrl: getEnv("VITE_TRANSCRIPTION_SERVICE_URL", "http://localhost:5004"),
  emailServiceUrl: getEnv("VITE_EMAIL_SERVICE_URL", "http://localhost:5002"),
  smsServiceUrl: getEnv("VITE_SMS_SERVICE_URL", "http://localhost:5003"),
  chatboxServiceUrl: getEnv("VITE_CHATBOX_SERVICE_URL", "http://localhost:5005"),

  // External services
  merckServiceUrl: getEnv(
    "VITE_MERCK_SERVICE_URL",
    "https://jiming-chen-merck-manual.hf.space"
  ),
  openEmrUrl: getEnv(
    "VITE_OPENEMR_URL",
    "https://jiming-chen-openemr-space.hf.space"
  ),
  dpdServiceUrl: getEnv("VITE_DPD_SERVICE_URL", "http://localhost:8010"),

  // Feature flags
  enableTranscription: import.meta.env.VITE_ENABLE_TRANSCRIPTION !== "false",
  enableEmail: import.meta.env.VITE_ENABLE_EMAIL !== "false",
  enableSms: import.meta.env.VITE_ENABLE_SMS !== "false",
};

export default config;