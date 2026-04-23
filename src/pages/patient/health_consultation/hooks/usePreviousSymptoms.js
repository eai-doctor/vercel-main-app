import { useState, useEffect, useCallback } from 'react';
import chatApi from '@/api/chatApi';

export const usePreviousSymptoms = (isAuthenticated, isPatient, loading) => {
  const [previousSymptoms, setPreviousSymptoms] = useState([]);
  const [isSymptomsLoading, setIsSymptomsLoading] = useState(false);

  const fetchSymptoms = useCallback(async () => {
    if (!isAuthenticated || !isPatient || loading) return;

    setIsSymptomsLoading(true);
    try {
      const response = await chatApi.getConsultationSummaries();
      if (response.data.success) {
        setPreviousSymptoms(response.data.symptoms || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSymptomsLoading(false);
    }
  }, [isAuthenticated, isPatient, loading]);

  useEffect(() => {
    fetchSymptoms();
  }, [fetchSymptoms]);

  return { previousSymptoms, isSymptomsLoading, refetch: fetchSymptoms };
};