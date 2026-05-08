import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import medicalRecordApi from "@/api/medicalRecordApi";

import { SystemStatus, NavBar } from "@/components";
import { getTodayString } from "@/utils/DateUtils";

import { SectionCard, FormModal } from "./components";
import { parseDisplayData, formFromRecord } from "./utils";
import { TAB_ICONS, EMPTY_FORMS } from "./constants";
import { useHealthRecords } from "./hooks/useHealthRecords";
import { TAB_KEYS } from "@/constants/fhir";

export default function MedicalProfile() {
  const { t } = useTranslation(['patient', 'common']);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingTab, setEditingTab] = useState(TAB_KEYS[0]);

  const [error, setError] = useState(null);

  const userId = user?.user_id || user?.id;
  const fhirPatientId = user?.fhir_patient_id;

  const tabLabels = useMemo(() => ({
    Condition: t('patient:medicalProfile.tabs.conditions'),
    Encounter: t('patient:medicalProfile.tabs.encounters'),
    Observation: t('patient:medicalProfile.tabs.vitalSigns'),
    AllergyIntolerance: t('patient:medicalProfile.tabs.allergies'),
    MedicationStatement: t('patient:medicalProfile.tabs.medicationStatements', 'Medication Statements'),
    MedicationRequest: t('patient:medicalProfile.tabs.medications'),
    Immunization: t('patient:medicalProfile.tabs.immunizations'),
    Procedure: t('patient:medicalProfile.tabs.procedures', 'Procedures'),
    DiagnosticReport: t('patient:medicalProfile.tabs.diagnosticReports', 'Diagnostic Reports'),
    CarePlan: t('patient:medicalProfile.tabs.carePlans', 'Care Plans'),
    Flag: t('patient:medicalProfile.tabs.flags', 'Flags'),
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

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setError(null);
  };

  const {
      recordsByTab,
      handleUpateProfileClicked,
      handleCreateProfileClicked,
      handleDeleteProfileClicked,
      isSubmitting
    } = useHealthRecords(t, fhirPatientId, userId, setError, setLoading, cacheRef, medicalRecordApi, handleCloseModal);


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
    setForm(rec.form);
    setError(null);
    setShowModal(true);
  };


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
              const parsed = rawRecords.map((rec) => {
                const original = rec?.resource || rec;

                return {
                  ...parseDisplayData(tab, original),
                  original,
                  form: formFromRecord(tab, original),
                }
              });
              return (
                <SectionCard
                  key={tab}
                  icon={TAB_ICONS[tab]}
                  title={tabLabels[tab]}
                  records={parsed}
                  onAdd={() => handleOpenAdd(tab)}
                  onEdit={(rec) => handleOpenEdit(tab, rec)}
                  onDelete={(rec) => handleDeleteProfileClicked(tab, rec)}
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
          initialData={editingRecord ? editingRecord.form : null}
          originalRecord={editingRecord ? editingRecord.original : null}
          isSubmitting={isSubmitting}
          onClose={handleCloseModal}
          error={error}
          labels={tabLabels}
          handleUpateProfileClicked={handleUpateProfileClicked}
          handleCreateProfileClicked={handleCreateProfileClicked}
          form={form}
          setForm={setForm}
          t={t}
        />
      )}
    </div>
  );
}
