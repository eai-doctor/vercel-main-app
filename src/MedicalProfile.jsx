import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import ProfileDropdown from "./components/ProfileDropdown";
import { useAuth } from '@/context/AuthContext';
import axios from "axios";
import config from "./config";

const TAB_KEYS = [
  "Condition",
  "MedicationRequest",
  "AllergyIntolerance",
  "Observation",
  "Immunization",
];

const VITAL_TYPES = [
  { label: "Blood Pressure", code: "85354-9", unit: "mmHg" },
  { label: "Heart Rate", code: "8867-4", unit: "bpm" },
  { label: "Body Weight", code: "29463-7", unit: "kg" },
  { label: "Body Height", code: "8302-2", unit: "cm" },
  { label: "Body Temperature", code: "8310-5", unit: "°C" },
  { label: "Oxygen Saturation", code: "2708-6", unit: "%" },
];

const EMPTY_FORMS = {
  Condition: { name: "", status: "active", onsetDate: "", notes: "" },
  MedicationRequest: { name: "", dosage: "", frequency: "", status: "active", startDate: "" },
  AllergyIntolerance: { substance: "", reaction: "", severity: "moderate" },
  Observation: { vitalType: "Blood Pressure", value: "", date: "" },
  Immunization: { vaccine: "", date: "", status: "completed" },
};

function buildFhirResource(tab, form) {
  switch (tab) {
    case "Condition":
      return {
        resourceType: "Condition",
        clinicalStatus: {
          coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: form.status }],
        },
        code: { coding: [{ display: form.name }], text: form.name },
        onsetDateTime: form.onsetDate || undefined,
        note: form.notes ? [{ text: form.notes }] : [],
      };
    case "MedicationRequest":
      return {
        resourceType: "MedicationRequest",
        status: form.status,
        medicationCodeableConcept: { coding: [{ display: form.name }], text: form.name },
        dosageInstruction: [
          {
            text: `${form.dosage} ${form.frequency}`.trim(),
            doseAndRate: form.dosage
              ? [{ doseQuantity: { value: form.dosage } }]
              : [],
            timing: form.frequency
              ? { code: { text: form.frequency } }
              : undefined,
          },
        ],
        authoredOn: form.startDate || undefined,
      };
    case "AllergyIntolerance":
      return {
        resourceType: "AllergyIntolerance",
        code: { coding: [{ display: form.substance }], text: form.substance },
        reaction: form.reaction
          ? [{ manifestation: [{ coding: [{ display: form.reaction }], text: form.reaction }], severity: form.severity }]
          : [],
      };
    case "Observation":
      const vt = VITAL_TYPES.find((v) => v.label === form.vitalType) || VITAL_TYPES[0];
      return {
        resourceType: "Observation",
        category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
        code: { coding: [{ system: "http://loinc.org", code: vt.code, display: vt.label }], text: vt.label },
        valueQuantity: { value: parseFloat(form.value) || form.value, unit: vt.unit },
        effectiveDateTime: form.date || undefined,
      };
    case "Immunization":
      return {
        resourceType: "Immunization",
        status: form.status,
        vaccineCode: { coding: [{ display: form.vaccine }], text: form.vaccine },
        occurrenceDateTime: form.date || undefined,
      };
    default:
      return {};
  }
}

function displayRecord(tab, rec) {
  const res = rec.resource || {};
  switch (tab) {
    case "Condition": {
      const name = res.code?.text || res.code?.coding?.[0]?.display || "Unknown";
      const status = res.clinicalStatus?.coding?.[0]?.code || "active";
      const date = res.onsetDateTime || "";
      const notes = res.note?.[0]?.text || "";
      return { primary: name, secondary: `Status: ${status}`, date, notes };
    }
    case "MedicationRequest": {
      const name = res.medicationCodeableConcept?.text || res.medicationCodeableConcept?.coding?.[0]?.display || "Unknown";
      const dosage = res.dosageInstruction?.[0]?.text || "";
      const date = res.authoredOn || "";
      return { primary: name, secondary: dosage, date };
    }
    case "AllergyIntolerance": {
      const sub = res.code?.text || res.code?.coding?.[0]?.display || "Unknown";
      const reaction = res.reaction?.[0]?.manifestation?.[0]?.text || "";
      const severity = res.reaction?.[0]?.severity || "";
      return { primary: sub, secondary: `${reaction}${severity ? ` (${severity})` : ""}` };
    }
    case "Observation": {
      const name = res.code?.text || res.code?.coding?.[0]?.display || "Vital Sign";
      const val = res.valueQuantity?.value ?? "";
      const unit = res.valueQuantity?.unit || "";
      const date = res.effectiveDateTime || "";
      return { primary: name, secondary: `${val} ${unit}`, date };
    }
    case "Immunization": {
      const vax = res.vaccineCode?.text || res.vaccineCode?.coding?.[0]?.display || "Unknown";
      const date = res.occurrenceDateTime || "";
      const status = res.status || "completed";
      return { primary: vax, secondary: `Status: ${status}`, date };
    }
    default:
      return { primary: "Unknown", secondary: "" };
  }
}

function RecordCard({ tab, rec, onEdit, onDelete, t }) {
  const d = displayRecord(tab, rec);
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-4 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] hover:border-[rgba(59,130,246,0.4)] transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#1e293b] truncate">{d.primary}</h4>
          {d.secondary && <p className="text-sm text-[#475569] mt-1">{d.secondary}</p>}
          {d.date && <p className="text-xs text-[#94a3b8] mt-1">{d.date}</p>}
          {d.notes && <p className="text-xs text-[#475569] mt-1 italic">{d.notes}</p>}
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <button onClick={() => onEdit(rec)} className="text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium">{t('common:edit', 'Edit')}</button>
          <button onClick={() => onDelete(rec)} className="text-red-400 hover:text-red-600 text-sm font-medium">{t('common:delete', 'Delete')}</button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ tab, initial, onSave, onClose, t, tabLabels }) {
  const [form, setForm] = useState(initial || EMPTY_FORMS[tab]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-[#1e293b] mb-4">
            {initial ? t('common:edit', 'Edit') : t('common:add', 'Add')} {tabLabels[tab]?.slice(0, -1) || t('common:record', 'Record')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "Condition" && (
              <>
                <Field label={t('common:name', 'Condition Name')} value={form.name} onChange={(v) => set("name", v)} required />
                <SelectField label={t('common:status', 'Status')} value={form.status} options={["active", "inactive", "resolved"]} onChange={(v) => set("status", v)} />
                <Field label={t('common:date', 'Onset Date')} value={form.onsetDate} onChange={(v) => set("onsetDate", v)} type="date" />
                <Field label={t('common:notes', 'Notes')} value={form.notes} onChange={(v) => set("notes", v)} multiline />
              </>
            )}
            {tab === "MedicationRequest" && (
              <>
                <Field label={t('common:name', 'Medication Name')} value={form.name} onChange={(v) => set("name", v)} required />
                <Field label={t('common:dosage', 'Dosage')} value={form.dosage} onChange={(v) => set("dosage", v)} placeholder="e.g. 10mg" />
                <Field label={t('common:frequency', 'Frequency')} value={form.frequency} onChange={(v) => set("frequency", v)} placeholder="e.g. once daily" />
                <SelectField label={t('common:status', 'Status')} value={form.status} options={["active", "stopped", "completed"]} onChange={(v) => set("status", v)} />
                <Field label={t('common:date', 'Start Date')} value={form.startDate} onChange={(v) => set("startDate", v)} type="date" />
              </>
            )}
            {tab === "AllergyIntolerance" && (
              <>
                <Field label={t('common:substance', 'Substance')} value={form.substance} onChange={(v) => set("substance", v)} required />
                <Field label={t('common:reaction', 'Reaction')} value={form.reaction} onChange={(v) => set("reaction", v)} placeholder="e.g. rash, hives" />
                <SelectField label={t('common:severity', 'Severity')} value={form.severity} options={["mild", "moderate", "severe"]} onChange={(v) => set("severity", v)} />
              </>
            )}
            {tab === "Observation" && (
              <>
                <SelectField label={t('patient:medicalProfile.tabs.vitalSigns')} value={form.vitalType} options={VITAL_TYPES.map((v) => v.label)} onChange={(v) => set("vitalType", v)} />
                <Field label={t('common:value', 'Value')} value={form.value} onChange={(v) => set("value", v)} required placeholder={`e.g. ${VITAL_TYPES.find((v) => v.label === form.vitalType)?.unit || ""}`} />
                <Field label={t('common:date', 'Date')} value={form.date} onChange={(v) => set("date", v)} type="date" />
              </>
            )}
            {tab === "Immunization" && (
              <>
                <Field label={t('common:name', 'Vaccine Name')} value={form.vaccine} onChange={(v) => set("vaccine", v)} required />
                <Field label={t('common:date', 'Date')} value={form.date} onChange={(v) => set("date", v)} type="date" />
                <SelectField label={t('common:status', 'Status')} value={form.status} options={["completed", "not-done"]} onChange={(v) => set("status", v)} />
              </>
            )}
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#475569] hover:text-[#1e293b]">
                {t('common:cancel', 'Cancel')}
              </button>
              <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
                {initial ? t('common:saveChanges', 'Save Changes') : t('common:addRecord', 'Add Record')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder, multiline }) {
  const cls = "w-full px-3 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:ring-2 focus:ring-[rgba(59,130,246,0.4)] focus:border-[#3b82f6] text-sm";
  return (
    <div>
      <label className="block text-sm font-medium text-[#475569] mb-1">{label}</label>
      {multiline ? (
        <textarea className={cls} value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} />
      )}
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#475569] mb-1">{label}</label>
      <select
        className="w-full px-3 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:ring-2 focus:ring-[rgba(59,130,246,0.4)] focus:border-[#3b82f6] text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}

function formFromRecord(tab, rec) {
  const res = rec.resource || {};
  switch (tab) {
    case "Condition":
      return {
        name: res.code?.text || res.code?.coding?.[0]?.display || "",
        status: res.clinicalStatus?.coding?.[0]?.code || "active",
        onsetDate: res.onsetDateTime || "",
        notes: res.note?.[0]?.text || "",
      };
    case "MedicationRequest":
      return {
        name: res.medicationCodeableConcept?.text || res.medicationCodeableConcept?.coding?.[0]?.display || "",
        dosage: res.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || "",
        frequency: res.dosageInstruction?.[0]?.timing?.code?.text || "",
        status: res.status || "active",
        startDate: res.authoredOn || "",
      };
    case "AllergyIntolerance":
      return {
        substance: res.code?.text || res.code?.coding?.[0]?.display || "",
        reaction: res.reaction?.[0]?.manifestation?.[0]?.text || "",
        severity: res.reaction?.[0]?.severity || "moderate",
      };
    case "Observation": {
      const display = res.code?.coding?.[0]?.display || "";
      const match = VITAL_TYPES.find((v) => v.label === display);
      return {
        vitalType: match ? match.label : VITAL_TYPES[0].label,
        value: res.valueQuantity?.value != null ? String(res.valueQuantity.value) : "",
        date: res.effectiveDateTime || "",
      };
    }
    case "Immunization":
      return {
        vaccine: res.vaccineCode?.text || res.vaccineCode?.coding?.[0]?.display || "",
        date: res.occurrenceDateTime || "",
        status: res.status || "completed",
      };
    default:
      return EMPTY_FORMS[tab];
  }
}

export default function MedicalProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(['patient', 'common']);

  const [activeTab, setActiveTab] = useState("Condition");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [error, setError] = useState("");

  // Translated tab labels mapping
  const TAB_LABELS = {
    Condition: t('patient:medicalProfile.tabs.conditions'),
    MedicationRequest: t('patient:medicalProfile.tabs.medications'),
    AllergyIntolerance: t('patient:medicalProfile.tabs.allergies'),
    Observation: t('patient:medicalProfile.tabs.vitalSigns'),
    Immunization: t('patient:medicalProfile.tabs.immunizations'),
  };

  const userId = user?.user_id || user?.id;
  const apiBase = `${config.backendUrl}/api/medical-records/${userId}`;

  const fetchRecords = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${apiBase}?type=${activeTab}`);
      setRecords(res.data.records || []);
    } catch (err) {
      setError(t('common:error', 'Failed to load records'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, activeTab, userId, t]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleAdd = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  const handleEdit = (rec) => {
    setEditingRecord(rec);
    setShowModal(true);
  };

  const handleDelete = async (rec) => {
    if (!window.confirm(t('common:confirmDelete', 'Delete this record?'))) return;
    try {
      await axios.delete(`${apiBase}/${rec._id}`);
      fetchRecords();
    } catch (err) {
      setError(t('common:error', 'Failed to delete record'));
    }
  };

  const handleSave = async (formData) => {
    setError("");
    try {
      const resource = buildFhirResource(activeTab, formData);
      if (editingRecord) {
        await axios.put(`${apiBase}/${editingRecord._id}`, { resource });
      } else {
        await axios.post(apiBase, { resource_type: activeTab, resource });
      }
      setShowModal(false);
      setEditingRecord(null);
      fetchRecords();
    } catch (err) {
      setError(t('common:error', 'Failed to save record'));
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] z-50" />
      {/* Header */}
      <header className="mt-[3px] bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient">
                {t('patient:medicalProfile.title')}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{t('patient:medicalProfile.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/personal")}
                className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#3b82f6] transition-colors"
              >
                &larr; {t('common:back', 'Back')}
              </button>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] mb-6 overflow-x-auto">
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white shadow-sm"
                  : "text-[#475569] hover:text-[#1e293b] hover:bg-[#f8fafc]"
              }`}
            >
              {TAB_LABELS[key]}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Add Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1e293b]">
            {TAB_LABELS[activeTab]}
          </h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
          >
            + {t('common:add', 'Add')}
          </button>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)]">
            <p className="text-[#94a3b8] text-lg mb-2">{t('common:noRecords', 'No {{type}} yet', { type: TAB_LABELS[activeTab]?.toLowerCase() })}</p>
            <p className="text-[#94a3b8] text-sm">{t('common:clickAdd', 'Click "+ Add" to add your first record')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <RecordCard
                key={rec._id}
                tab={activeTab}
                rec={rec}
                onEdit={handleEdit}
                onDelete={handleDelete}
                t={t}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <FormModal
          tab={activeTab}
          initial={editingRecord ? formFromRecord(activeTab, editingRecord) : null}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingRecord(null); }}
          t={t}
          tabLabels={TAB_LABELS}
        />
      )}
    </div>
  );
}
