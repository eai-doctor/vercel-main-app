import { useState, useEffect, useCallback } from 'react';
import { TAB_KEYS } from '@/constants/fhir';

export const useHealthRecords = (t, fhirPatientId, userId, setError, setLoading,  cacheRef, medicalRecordApi, handleCloseModal) => {
  const [recordsByTab, setRecordsByTab] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upsertFirstById = (records = [], record) => {
  const id = record.id || record._id;
  if (!id) return [record, ...records];

  return [
    record,
    ...records.filter((item) => (item.id || item._id) !== id),
  ];
};

  const fetchAllRecords = useCallback(async () => {
    if (!fhirPatientId) return;
    setError(null);
    setLoading(true);

    try {
      const cacheKey = `${fhirPatientId}-FHIR_ALL`;
      let byTab;


      if (cacheRef.current[cacheKey]) {
        byTab = cacheRef.current[cacheKey];
      } else {
        const res = await medicalRecordApi.getFHIRRecords(fhirPatientId);
        const records = res?.data?.records || {};

        byTab = {};
        TAB_KEYS.forEach((tab) => {
          const list = Array.isArray(records[tab]) ? records[tab] : [];
          byTab[tab] = list;
        });

        cacheRef.current[cacheKey] = byTab;
      }

      setRecordsByTab(byTab);
    } catch (err) {
      setError(t('common:errors.failToLoad'));
    } finally {
      setLoading(false);
    }
  }, [fhirPatientId]);

  useEffect(() => {
      fetchAllRecords();
  }, [fetchAllRecords]);

  const handleUpateProfileClicked = async (originalRecord, form, tab) => {
    if (!fhirPatientId || fhirPatientId === "undefined") {
      setIsSubmitting(false);
      window.alert(t('common:errors.failedToUpdate', { resource: 'profile' }));
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const cacheKey = `${fhirPatientId}-FHIR_ALL`;

      //update google fhir
      const res = await medicalRecordApi.updateFHIRRRecord(fhirPatientId, tab, originalRecord.id, form, originalRecord);

      if(res.status == 200){
        const data = res.data;
        const updatedResource = data.record;

        //reflect update without refreshing
        setRecordsByTab((prev) => ({
          ...prev,
          [tab]: (prev[tab] || []).map((record) => {
            const recordId = record?.resource?.id || record?.id;
            return recordId === updatedResource.id ? updatedResource : record;
          }),
        }));

        const bucket = cacheRef.current[cacheKey];
        if (bucket && Array.isArray(bucket[tab])) {
          bucket[tab] = bucket[tab].map((record) =>
            record.id === updatedResource.id ? { ...record, ...form } : record
          );
        }

        handleCloseModal();
        // setForm(getInitialForm(editingTab));
      }

      
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Unknown error";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProfileClicked = async (form, tab) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const cacheKey = `${fhirPatientId}-FHIR_ALL`;
      const response = await medicalRecordApi.createFHIRRRecord(fhirPatientId, tab, form);
      if (response.status === 200) {
        const newRecord = response.data.resource || response.data;
        setRecordsByTab((prev) => {
          const next = {
            ...prev,
            [tab]: upsertFirstById(prev[tab] || [], newRecord.record),
          };

          cacheRef.current[cacheKey] = next;

          return next;
        });

        handleCloseModal();
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message || "Unknown error";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteProfileClicked = async (tab, rec) => {
      console.log(tab, rec);
      if (!rec._id && !rec.id) {
        console.error("Invalid record");
        return;
      }

      const confirmed = window.confirm(
        t('common:confirmDelete', 'Are you sure you want to delete this record?')
      );
      if (!confirmed) return;
  
      try { 
        const recId = rec._id || rec.id;
        const res = await medicalRecordApi.deleteFHIRRRecord(fhirPatientId, tab, recId);
        
        if(res.status == 200){
          window.alert(t('common:deletedSuccessfully', 'Record successfully deleted'));
    
          setRecordsByTab((prev) => ({
            ...prev,
            [tab]: (prev[tab] || []).filter((r) => r.id !== recId),
          }));
    
          const cacheKey = `${fhirPatientId}-FHIR_ALL`;
          const bucket = cacheRef.current[cacheKey];
          if (bucket && Array.isArray(bucket[tab])) {
            bucket[tab] = bucket[tab].filter((r) => r.id !== recId);
          }
        }
        
      } catch (error) {
        console.error("Delete failed:", error.message);
        alert(error.message);
      }
    }

  return { recordsByTab, setRecordsByTab, handleUpateProfileClicked, handleCreateProfileClicked, handleDeleteProfileClicked, isSubmitting };
};