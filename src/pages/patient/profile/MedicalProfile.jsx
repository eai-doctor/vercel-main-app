import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import medicalRecordApi from "@/api/medicalRecordApi";
import { TAB_KEYS } from "./constants";
import { buildFhirResource, formFromRecord, parseDisplayData } from "./utils";

import { RecordCard, FormModal } from "./components";
import { Button } from "@/components/ui"
import { SystemStatus, NavBar } from "@/components";

export default function MedicalProfile() {
  const { t } = useTranslation(['patient', 'common']);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("Condition");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const userId = user?.user_id || user?.id;

  const tabLabels = useMemo(() => ({
    Condition: t('patient:medicalProfile.tabs.conditions'),
    MedicationRequest: t('patient:medicalProfile.tabs.medications'),
    AllergyIntolerance: t('patient:medicalProfile.tabs.allergies'),
    Observation: t('patient:medicalProfile.tabs.vitalSigns'),
    Immunization: t('patient:medicalProfile.tabs.immunizations'),
  }), [t]);

  const cacheRef = useRef({});

  const fetchRecords = useCallback(async () => {
    if (!userId) return;
    setError(null);

    const cacheKey = `${userId}-${activeTab}`;

    if (cacheRef.current[cacheKey]) {
      setRecords(cacheRef.current[cacheKey]);
      return;
    }

    setLoading(true);

    try {
      const res = await medicalRecordApi.getRecords(userId, activeTab);
      const data = res.data.records || [];

      cacheRef.current[cacheKey] = data;
      setRecords(data);

    } catch (err) {
      setError(t('common:errors.failToLoad'));
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab, t]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSave = async (formData) => {
    try {
      const resource = buildFhirResource(activeTab, formData);
      if (editingRecord) {
        await medicalRecordApi.updateRecord(userId, editingRecord._id, { resource });
      } else {
        await medicalRecordApi.createRecord(userId, { resource_type: activeTab, resource });
      }
      setShowModal(false);
      fetchRecords();
    } catch (err) { setError(t('common:error')); }
  };

  async function handleDelete(rec) {
    if (!rec?._id) {
      console.error("Invalid record");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    try {
      const res = await medicalRecordApi.deleteRecord( userId, rec._id, activeTab );

      if (res.statusText !== "OK") {
        throw new Error(err.error || "Failed to delete record");
      }

      // 성공 처리
      window.alert("Record successfully deleted");
      setRecords(prev => prev.filter(r => r._id !== rec._id));

      const cacheKey = `${userId}-${activeTab}`;
      if (cacheRef.current[cacheKey]) {
        cacheRef.current[cacheKey] =
          cacheRef.current[cacheKey].filter(r => r._id !== rec._id);
      }

    } catch (error) {
      console.error("Delete failed:", error.message);
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* 상단 네비게이션 */}
      <NavBar />

      {/* 헤더 섹션 (이미지 스타일 반영) */}
      <header className="max-w-4xl mx-auto pt-16 pb-8 text-center px-6">
        <h1 className="text-[40px] font-bold text-[#1e293b] leading-tight mb-4">
          {t('patient:medicalProfile.title')}
        </h1>
      </header>

      <main className="max-w-5xl mx-auto px-6">
        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TAB_KEYS.map((key) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "outline"}
              onClick={() => setActiveTab(key)}
              className={`rounded-full px-6 transition-all ${
                activeTab === key ? "text-white shadow-md scale-105 bg-[#1f2a63]" : "bg-white text-slate-500"
              }`}
            >
              {tabLabels[key]}
            </Button>
          ))}
        </div>

        {/* 섹션 헤더 및 추가 버튼 */}
        <div className="flex justify-between items-end mb-6 px-2 hidden">
          <h2 className="text-xl font-bold text-slate-800">{tabLabels[activeTab]}</h2>
          <Button 
            onClick={() => { setEditingRecord(null); setShowModal(true); }}
              className="bg-[#2C3B8D] hover:bg-[#1f2a63] text-white"
          >
            <span className="text-lg font-bold">+</span>
            {t('common:add')}
          </Button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* 컨텐츠 영역 */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-[32px] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-40 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-2xl">Empty</div>
            <p className="text-slate-400 font-medium">{t('common:noRecords', 'No records found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((rec) => (
              <RecordCard
                key={rec._id}
                data={parseDisplayData(activeTab, rec)}
                onEdit={() => { setEditingRecord(rec); setShowModal(true); }}
                onDelete={() => handleDelete(rec)}
                t={t}
              />
            ))}
          </div>
        )}
      </main>

      <SystemStatus />

      {showModal && (
        <FormModal
          tab={activeTab}
          initialData={editingRecord ? formFromRecord(activeTab, editingRecord) : null}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          t={t}
          labels={tabLabels}
        />
      )}
    </div>
  );
}