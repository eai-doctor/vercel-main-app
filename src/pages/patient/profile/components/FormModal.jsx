import React, { useState } from "react";
import { Field, SelectField } from "./Fields";
import { VITAL_TYPES, EMPTY_FORMS } from "../constants";

export default function FormModal({ tab, initialData, onSave, onClose, t, labels }) {
  const [form, setForm] = useState(initialData || EMPTY_FORMS[tab]);
  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#1e293b] mb-6">
            {initialData ? t('common:edit') : t('common:add')} {labels[tab]?.slice(0, -1)}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 탭별 조건부 렌더링 */}
            {tab === "Condition" && (
              <>
                <Field label={t('common:name')} value={form.name} onChange={(v) => updateForm("name", v)} required />
                <SelectField label={t('common:status')} value={form.status} options={["active", "inactive", "resolved"]} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:date')} value={form.onsetDate} onChange={(v) => updateForm("onsetDate", v)} type="date" />
                <Field label={t('common:notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {tab === "Observation" && (
              <>
                <SelectField label={t('patient:medicalProfile.tabs.vitalSigns')} value={form.vitalType} options={VITAL_TYPES.map((v) => v.label)} onChange={(v) => updateForm("vitalType", v)} />
                <Field label={t('common:value')} value={form.value} onChange={(v) => updateForm("value", v)} required placeholder={`Unit: ${VITAL_TYPES.find(v => v.label === form.vitalType)?.unit}`} />
                <Field label={t('common:date')} value={form.date} onChange={(v) => updateForm("date", v)} type="date" />
              </>
            )}

            {/* 나머지 탭(MedicationRequest, AllergyIntolerance, Immunization)도 같은 패턴으로 추가 */}

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#1e293b]">
                {t('common:cancel')}
              </button>
              <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-200">
                {initialData ? t('common:saveChanges') : t('common:addRecord')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}