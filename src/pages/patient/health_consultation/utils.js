// src/pages/health_consultation/utils.js

export const getStoredMessageCount = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('free_msg') || '{}');
    const today = new Date().toDateString();
    
    if (stored.date !== today) return 0;
    return stored.count || 0;
  } catch (error) {
    console.error("Failed to parse free_msg from localStorage", error);
    return 0;
  }
};

export const incrementMessageCount = () => {
  const today = new Date().toDateString();
  const currentCount = getStoredMessageCount();
  const nextCount = currentCount + 1;
  
  localStorage.setItem('free_msg', JSON.stringify({ 
    date: today, 
    count: nextCount 
  }));
  
  return nextCount;
};

export const extractSymptomLabel = (symptom) => {
  if (typeof symptom === 'string') return symptom;
  const label = symptom.symptom || symptom.name || '';
  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};