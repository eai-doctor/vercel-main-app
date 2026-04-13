// utils/sensitiveConditions.js
const SENSITIVE_PREFIXES = [
  'F',      // mental health
  'Z72',    // lifestyle habits
  'A50', 'A51', 'A52', 'A53', 'A54',  // sexual disease
  'Z11',    // HIV diagnose
  'F11', 'F12', 'F13', 'F14', 'F15', 'F16', 'F18', 'F19',  // drug related
];

export const isSensitiveDiagnosis = (icdCode) => {
  if (!icdCode) return false;
  return SENSITIVE_PREFIXES.some(prefix => icdCode.startsWith(prefix));
};