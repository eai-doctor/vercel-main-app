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

            {tab === "MedicationRequest" && (
  <>
    <Field
      label={t('common:medication')}
      value={form.medication}
      onChange={(v) => updateForm("medication", v)}
      required
      placeholder="e.g. Ibuprofen 100 MG Oral Tablet"
    />
    <Field
      label={t('common:dosage')}
      value={form.dosage}
      onChange={(v) => updateForm("dosage", v)}
      placeholder="e.g. Take as needed."
    />
    <SelectField
      label={t('common:status')}
      value={form.status}
      options={["active", "stopped", "cancelled", "completed"]}
      onChange={(v) => updateForm("status", v)}
    />
    <Field
      label={t('common:date')}
      value={form.date}
      onChange={(v) => updateForm("date", v)}
      type="date"
    />
  </>
)}

{tab === "AllergyIntolerance" && (
  <>
    <Field
      label={t('common:display')}
      value={form.display}
      onChange={(v) => updateForm("display", v)}
      required
      placeholder="e.g. Allergy to Penicillin (disorder)"
    />
    <Field
      label={t('common:substance')}
      value={form.substance}
      onChange={(v) => updateForm("substance", v)}
      required
      placeholder="e.g. Penicillin G"
    />
    <SelectField
      label={t('common:type')}
      value={form.type}
      options={["allergy", "intolerance"]}
      onChange={(v) => updateForm("type", v)}
    />
    <SelectField
      label={t('common:category')}
      value={form.category}
      options={["medication", "food", "environment", "biologic"]}
      onChange={(v) => updateForm("category", v)}
    />
    <SelectField
      label={t('common:criticality')}
      value={form.criticality}
      options={["low", "high", "unable-to-assess"]}
      onChange={(v) => updateForm("criticality", v)}
    />
    <SelectField
      label={t('common:status')}
      value={form.status}
      options={["active", "inactive", "resolved"]}
      onChange={(v) => updateForm("status", v)}
    />
    <Field
      label={t('common:date')}
      value={form.date}
      onChange={(v) => updateForm("date", v)}
      type="date"
    />
  </>
)}

{tab === "Immunization" && (
  <>
    <Field
      label={t('common:vaccine')}
      value={form.vaccine}
      onChange={(v) => updateForm("vaccine", v)}
      required
      placeholder="e.g. IPV"
    />
    <SelectField
      label={t('common:status')}
      value={form.status}
      options={["completed", "not-done"]}
      onChange={(v) => updateForm("status", v)}
    />
    <Field
      label={t('common:date')}
      value={form.date}
      onChange={(v) => updateForm("date", v)}
      type="date"
    />
  </>
)}

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