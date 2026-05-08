// src/pages/health_consultation/constants.js
export const AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1
  }
};

export const FREE_MESSAGE_LIMIT = 5;

export const getTabs = (t) => [
  { id: 'chat',    label: t('tab.chat', 'Chat') },
  { id: 'record',  label: t('tab.record', 'Recording') },
  { id: 'history', label: t('tab.history', 'History') },
];

export const getSuggestions = (t) => [
  t('suggestions.discussConsultation'),
  t('suggestions.prepareAppointment'),
  t('suggestions.monitorSymptoms'),
  t('suggestions.askDoctor')
];

export const SYMPTOM_SEVERITY_CLASSES = {
  mild: 'bg-green-100 text-green-700',
  moderate: 'bg-amber-100 text-amber-700',
  severe: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
  default: 'bg-[#eef2ff] text-[#2C3B8D]'
};