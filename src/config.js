// Frontend Configuration
// Centralized configuration for API endpoints and service URLs

const config = {
  // Main backend API (remove trailing slash to avoid double slashes)
  // 260304 saebyeok temporary change the address from http://localhost:5001 to http://localhost:8080
  // (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '')
  backendUrl: (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001').replace(/\/$/, ''),
   // backendUrl: 'http://localhost:5001',

  // Microservices (remove trailing slashes)
  transcriptionServiceUrl: (import.meta.env.VITE_TRANSCRIPTION_SERVICE_URL || 'http://localhost:5004').replace(/\/$/, ''),
  emailServiceUrl: (import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:5002').replace(/\/$/, ''),
  smsServiceUrl: (import.meta.env.VITE_SMS_SERVICE_URL || 'http://localhost:5003').replace(/\/$/, ''),
  chatboxServiceUrl: (import.meta.env.VITE_CHATBOX_SERVICE_URL || 'http://localhost:5005').replace(/\/$/, ''),

  // Auth service
  // 260303 saebyeok temporary change the address from http://localhost:5007 to http://localhost:7860
  authServiceUrl: (import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:5007').replace(/\/$/, ''),
    // authServiceUrl: 'http://localhost:7860',

  // API Keys for microservices (needed for direct frontend calls)
  chatboxApiKey: import.meta.env.VITE_CHATBOX_API_KEY || 'dev-key-change-in-production',
  transcriptionApiKey: import.meta.env.VITE_TRANSCRIPTION_API_KEY || 'dev-key-change-in-production',

  // Merck Manual Service (HF Spaces)
  merckServiceUrl: (import.meta.env.VITE_MERCK_SERVICE_URL || 'https://jiming-chen-merck-manual.hf.space').replace(/\/$/, ''),
  merckApiKey: import.meta.env.VITE_MERCK_API_KEY || 'dev-merck-key',

  // Health Canada DPD Drug Bank
  dpdServiceUrl: (import.meta.env.VITE_DPD_SERVICE_URL || 'http://localhost:8010').replace(/\/$/, ''),

  // OpenEMR (HF Spaces)
  openEmrUrl: (import.meta.env.VITE_OPENEMR_URL || 'https://jiming-chen-openemr-space.hf.space').replace(/\/$/, ''),

  // Feature flags
  enableTranscription: import.meta.env.VITE_ENABLE_TRANSCRIPTION !== 'false',
  enableEmail: import.meta.env.VITE_ENABLE_EMAIL !== 'false',
  enableSms: import.meta.env.VITE_ENABLE_SMS !== 'false',
};

export default config;
