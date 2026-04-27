import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  Pill,
  ShieldAlert,
  Activity,
  Syringe,
  PillBottle,
  Scissors,
  FileText,
  Flag as FlagIcon,
  ClipboardList,
  Users,
} from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import medicalRecordApi from "@/api/medicalRecordApi";

import { SystemStatus, NavBar } from "@/components";
import { createRecord, updateRecord } from "@/api/medicalRecordApi";
import { getTodayString } from "@/utils/DateUtils";

import { SectionCard, FormModal } from "./components";
import { parseDisplayData, formFromRecord, buildFhirResource } from "./utils";
import { TAB_KEYS, EMPTY_FORMS } from "./constants";

const ICON_CLS = "w-[18px] h-[18px] text-[#2C3B8D]";

const TAB_ICONS = {
  Condition: <Stethoscope className={ICON_CLS} />,
  MedicationRequest: <Pill className={ICON_CLS} />,
  AllergyIntolerance: <ShieldAlert className={ICON_CLS} />,
  Observation: <Activity className={ICON_CLS} />,
  Immunization: <Syringe className={ICON_CLS} />,
  MedicationStatement: <PillBottle className={ICON_CLS} />,
  Procedure: <Scissors className={ICON_CLS} />,
  DiagnosticReport: <FileText className={ICON_CLS} />,
  Flag: <FlagIcon className={ICON_CLS} />,
  CarePlan: <ClipboardList className={ICON_CLS} />,
  FamilyMemberHistory: <Users className={ICON_CLS} />,
};

export default function MedicalProfile() {
  const { t } = useTranslation(['patient', 'common']);
  const { user } = useAuth();

  const [recordsByTab, setRecordsByTab] = useState({});
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingTab, setEditingTab] = useState(TAB_KEYS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const userId = user?.user_id || user?.id;
  const fhirPatientId = user?.fhir_patient_id;

  const tabLabels = useMemo(() => ({
    Condition: t('patient:medicalProfile.tabs.conditions'),
    MedicationRequest: t('patient:medicalProfile.tabs.medications'),
    AllergyIntolerance: t('patient:medicalProfile.tabs.allergies'),
    Observation: t('patient:medicalProfile.tabs.vitalSigns'),
    Immunization: t('patient:medicalProfile.tabs.immunizations'),
    MedicationStatement: t('patient:medicalProfile.tabs.medicationStatements', 'Medication Statements'),
    Procedure: t('patient:medicalProfile.tabs.procedures', 'Procedures'),
    DiagnosticReport: t('patient:medicalProfile.tabs.diagnosticReports', 'Diagnostic Reports'),
    Flag: t('patient:medicalProfile.tabs.flags', 'Flags'),
    CarePlan: t('patient:medicalProfile.tabs.carePlans', 'Care Plans'),
    FamilyMemberHistory: t('patient:medicalProfile.tabs.familyHistory', 'Family History'),
  }), [t]);

  const cacheRef = useRef({});

  const getInitialForm = (tab, data = null) => {
    const base = data || EMPTY_FORMS[tab] || {};
    return {
      ...base,
      onsetDate: base.onsetDate || getTodayString(),
      date: base.date || getTodayString(),
    };
  };

  const [form, setForm] = useState(() => getInitialForm(TAB_KEYS[0]));

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
          // Normalize FHIR `id` -> `_id` so existing edit/delete code keeps working
          byTab[tab] = list.map((r) => ({ ...r, _id: r._id || r.id }));
        });

        cacheRef.current[cacheKey] = byTab;
      }

      setRecordsByTab(byTab);
    } catch (err) {
      setError(t('common:errors.failToLoad'));
    } finally {
      setLoading(false);
    }
  }, [fhirPatientId, t]);

  useEffect(() => {
    fetchAllRecords();
  }, [fetchAllRecords]);

  const initialData = editingRecord
    ? (recordsByTab[editingTab] || []).find((r) => r._id === editingRecord._id)
    : null;

  const handleOpenAdd = (tab) => {
    setEditingTab(tab);
    setEditingRecord(null);
    setForm(getInitialForm(tab));
    setError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (tab, rec) => {
    setEditingTab(tab);
    setEditingRecord(rec);
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setError(null);
  };

  async function handleDelete(tab, rec) {
    if (!rec?._id) {
      console.error("Invalid record");
      return;
    }
    const confirmed = window.confirm(
      t('common:confirmDelete', 'Are you sure you want to delete this record?')
    );
    if (!confirmed) return;

    try { 
      await medicalRecordApi.deleteFHIRRRecord(fhirPatientId, editingTab, rec._id);
      window.alert(t('common:deletedSuccessfully', 'Record successfully deleted'));

      setRecordsByTab((prev) => ({
        ...prev,
        [tab]: (prev[tab] || []).filter((r) => r._id !== rec._id),
      }));

      const cacheKey = `${fhirPatientId}-FHIR_ALL`;
      const bucket = cacheRef.current[cacheKey];
      if (bucket && Array.isArray(bucket[tab])) {
        bucket[tab] = bucket[tab].filter((r) => r._id !== rec._id);
      }
    } catch (error) {
      console.error("Delete failed:", error.message);
      alert(error.message);
    }
  }


  // async function handleDelete(tab, rec) {
  //   if (!rec?._id) {
  //     console.error("Invalid record");
  //     return;
  //   }
  //   const confirmed = window.confirm(
  //     t('common:confirmDelete', 'Are you sure you want to delete this record?')
  //   );
  //   if (!confirmed) return;

  //   try {
  //     await medicalRecordApi.deleteRecord(fhirPatientId, rec._id, tab);
  //     window.alert(t('common:deletedSuccessfully', 'Record successfully deleted'));

  //     setRecordsByTab((prev) => ({
  //       ...prev,
  //       [tab]: (prev[tab] || []).filter((r) => r._id !== rec._id),
  //     }));

  //     const cacheKey = `${fhirPatientId}-FHIR_ALL`;
  //     const bucket = cacheRef.current[cacheKey];
  //     if (bucket && Array.isArray(bucket[tab])) {
  //       bucket[tab] = bucket[tab].filter((r) => r._id !== rec._id);
  //     }
  //   } catch (error) {
  //     console.error("Delete failed:", error.message);
  //     alert(error.message);
  //   }
  // }

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);

      if (!fhirPatientId || fhirPatientId === "undefined") {
        setError("User ID is missing. Please refresh and try again.");
        setIsSubmitting(false);
        return;
      }

      try {
        const cacheKey = `${fhirPatientId}-FHIR_ALL`;

        if (initialData) {
          await medicalRecordApi.updateFHIRRRecord(fhirPatientId , editingTab, initialData.id, form);
          console.log(initialData, form);
          setRecordsByTab((prev) => ({
            ...prev,
            [editingTab]: (prev[editingTab] || []).map((record) => record._id === initialData._id ? { ...record, ...buildFhirResource(editingTab,form) } : record),
          }));

          const bucket = cacheRef.current[cacheKey];
          if (bucket && Array.isArray(bucket[editingTab])) {
            bucket[editingTab] = bucket[editingTab].map((record) =>
              record._id === initialData._id ? { ...record, ...form } : record
            );
          }
          handleCloseModal();
          setForm(getInitialForm(editingTab));
          console.log(recordsByTab);
        } else {
          const response = await createRecord(userId, editingTab, form);
          if (response.status === 201) {
            const newRecord = { _id: response.data.id, ...form };
            setRecordsByTab((prev) => ({
              ...prev,
              [editingTab]: [newRecord, ...(prev[editingTab] || [])],
            }));
            const bucket = cacheRef.current[cacheKey];
            if (bucket) {
              bucket[editingTab] = [newRecord, ...(bucket[editingTab] || [])];
            }
            handleCloseModal();
            setForm(getInitialForm(editingTab));
          }
        }
      } catch (err) {
        const message = err.response?.data?.error || err.message || "Unknown error";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setIsSubmitting(true);

  //   if (!userId || userId === "undefined") {
  //     setError("User ID is missing. Please refresh and try again.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const cacheKey = `${userId}-FHIR_ALL`;

  //     if (initialData) {
  //       await updateRecord(userId, initialData._id, editingTab, form);
  //       setRecordsByTab((prev) => ({
  //         ...prev,
  //         [editingTab]: (prev[editingTab] || []).map((record) =>
  //           record._id === initialData._id ? { ...record, ...form } : record
  //         ),
  //       }));
  //       const bucket = cacheRef.current[cacheKey];
  //       if (bucket && Array.isArray(bucket[editingTab])) {
  //         bucket[editingTab] = bucket[editingTab].map((record) =>
  //           record._id === initialData._id ? { ...record, ...form } : record
  //         );
  //       }
  //       handleCloseModal();
  //       setForm(getInitialForm(editingTab));
  //     } else {
  //       const response = await createRecord(userId, editingTab, form);
  //       if (response.status === 201) {
  //         const newRecord = { _id: response.data.id, ...form };
  //         setRecordsByTab((prev) => ({
  //           ...prev,
  //           [editingTab]: [newRecord, ...(prev[editingTab] || [])],
  //         }));
  //         const bucket = cacheRef.current[cacheKey];
  //         if (bucket) {
  //           bucket[editingTab] = [newRecord, ...(bucket[editingTab] || [])];
  //         }
  //         handleCloseModal();
  //         setForm(getInitialForm(editingTab));
  //       }
  //     }
  //   } catch (err) {
  //     const message = err.response?.data?.error || err.message || "Unknown error";
  //     setError(message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const isInitialLoading = loading && Object.keys(recordsByTab).length === 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <NavBar />

      {/* Page title */}
      <header className="max-w-5xl mx-auto pt-10 pb-6 px-6">
        <h1 className="text-[24px] font-bold text-slate-900">
          {t('patient:medicalProfile.title')}
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          {t('patient:medicalProfile.subtitle', 'Manage your medical records')}
        </p>
      </header>


      <main className="max-w-5xl mx-auto px-6">
        {isInitialLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#2C3B8D] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {TAB_KEYS.map((tab) => {
              const rawRecords = recordsByTab[tab] || [];
              const parsed = rawRecords.map((rec) => parseDisplayData(tab, rec));
              return (
                <SectionCard
                  key={tab}
                  icon={TAB_ICONS[tab]}
                  title={tabLabels[tab]}
                  records={parsed}
                  onAdd={() => handleOpenAdd(tab)}
                  onEdit={(rec) => handleOpenEdit(tab, rec)}
                  onDelete={(rec) => handleDelete(tab, rec)}
                  t={t}
                />
              );
            })}
          </div>
        )}

        {/* Page-level Error */}
        {error && !showModal && (
          <div className="max-w-md mx-auto mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm border border-red-100">
            {error}
          </div>
        )}
      </main>

      <SystemStatus />

      {showModal && (
        <FormModal
          tab={editingTab}
          initialData={formFromRecord(editingTab, initialData)}
          isSubmitting={isSubmitting}
          onClose={handleCloseModal}
          error={error}
          labels={tabLabels}
          handleSubmit={handleSubmit}
          form={form}
          setForm={setForm}
          t={t}
        />
      )}
    </div>
  );
}
