import { useState, useEffect } from 'react';
import chatApi from '@/api/chatApi';

export const useChatHistory = (isAuthenticated, isPatient, loading, userId) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isPatient || loading) return;

    const fetchChatHistory = async () => {
      setIsChatHistoryLoading(true);
      try {
        const response = await chatApi.getChatHistory(userId || 'PORTAL-USER');
        if (response.data.success) {
          setChatHistory(response.data.histories || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsChatHistoryLoading(false);
      }
    };

    fetchChatHistory();
  }, [isAuthenticated, isPatient, loading, userId]);

  const groupedHistory = chatHistory.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString('en-CA');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const historyDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  return { chatHistory, isChatHistoryLoading, groupedHistory, historyDates };
};