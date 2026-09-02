import { useState, useCallback } from 'react';
import chatApi from '@/api/chatApi';

export function useSymptomChat() {
  const [open, setOpen] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [chatLogs, setChatLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const openSymptom = useCallback(async (symptom) => {
    if (!symptom?.consultation_ids?.length) return;
    setSelectedSymptom(symptom);
    setOpen(true);
    setIsLoading(true);
    setChatLogs([]);
    setExpandedId(null);

    try {
      const res = await chatApi.getChatLogs(symptom.consultation_ids);
      if (res.status === 200) {
        const logs = res.data.chat_logs || [];
        setChatLogs(logs);
        if (logs.length > 0) setExpandedId(logs[0].consultation_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSelectedSymptom(null);
    setChatLogs([]);
    setExpandedId(null);
  }, []);

  return {
    open, selectedSymptom, chatLogs,
    isLoading, expandedId, setExpandedId,
    openSymptom, close,
  };
}