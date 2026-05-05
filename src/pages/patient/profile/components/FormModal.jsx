import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Field, SelectField, CheckboxField } from "./Fields";
import {
  VITAL_TYPES,
  EMPTY_FORMS,
  STATUS_OPTIONS,
  CAREPLAN_INTENTS,
  FAMILY_RELATIONSHIPS,
  ADMIN_GENDER,
} from "../constants";
import { getTodayString } from "@/utils/DateUtils";

export default function FormModal({
  tab,
  initialData,
  originalRecord,
  isSubmitting,
  onClose,
  error,
  t,
  labels,
  handleUpateProfileClicked,
  handleCreateProfileClicked,
  form,
  setForm,
}) {

  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-[#2C3B8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M11 5h2m-1 0v14m7-7H5" />
              </svg>
            </div>
            <h3 className="text-[17px] font-semibold text-slate-800">
              {initialData ? t('common:edit') : t('common:add')} {labels[tab]?.slice(0, -1)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer flex items-center justify-center w-[34px] h-[34px] bg-white hover:bg-slate-100 text-slate-500 rounded-lg transition-all border border-slate-200"
          >
            <X className="w-[15px] h-[15px]" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">
          <form  className="space-y-3.5" id="record-form">
            {/* Condition */}
            {tab === "Condition" && (
              <>
                <Field label={t('common:labels.display')} value={form.display} onChange={(v) => updateForm("display", v)} required />
                <SelectField label={t('common:status')} value={form.status} options={["active", "inactive", "resolved"]} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:date')} value={form.onsetDate || getTodayString()} onChange={(v) => updateForm("onsetDate", v)} type="date" required />
              </>
            )}

            {/* Allergy */}
            {tab === "AllergyIntolerance" && (
              <>
                <Field label={t('common:labels.display')} value={form.display} onChange={(v) => updateForm("display", v)} required placeholder="e.g. Allergy to Penicillin (disorder)" />
                <Field label={t('common:substance')} value={form.substance} onChange={(v) => updateForm("substance", v)} required placeholder="e.g. Penicillin G" />
                <SelectField label={t('common:labels.type')} value={form.type} options={["allergy", "intolerance"]} onChange={(v) => updateForm("type", v)} />
                <SelectField label={t('common:labels.category')} value={form.category} options={["medication", "food", "environment", "biologic"]} onChange={(v) => updateForm("category", v)} />
                <SelectField label={t('common:labels.criticality')} value={form.criticality} options={["low", "high", "unable-to-assess"]} onChange={(v) => updateForm("criticality", v)} />
                <SelectField label={t('common:status')} value={form.status} options={["active", "inactive", "resolved"]} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:date')} value={form.onsetDate || getTodayString()} onChange={(v) => updateForm("onsetDate", v)} type="date" />
              </>
            )}

            {/* Body */}
            {tab === "MedicationRequest" && (
              <>
                <Field label={t('common:labels.medication')} value={form.medication} onChange={(v) => updateForm("medication", v)} required placeholder="e.g. Ibuprofen 100 MG Oral Tablet" />
                <Field label={t('common:labels.dosage')} value={form.dosage} onChange={(v) => updateForm("dosage", v)} placeholder="e.g. Take as needed." />
                <SelectField label={t('common:status')} value={form.status} options={["active", "stopped", "draft", "cancelled", "on-hold", "completed", "ended", "entered-in-error", "unknown"]} onChange={(v) => updateForm("status", v)} />
                <Field
                  label={t('common:date')}
                  value={form.authoredOn || getTodayString()}
                  onChange={(v) => updateForm("authoredOn", v)}
                  type="date"
                />
              </>
            )}

            {/* Medical Statement */}
            {tab === "MedicationStatement" && (
              <>
                <Field label={t('common:labels.medication', 'Medication')} value={form.medication} onChange={(v) => updateForm("medication", v)} required placeholder="e.g. Atorvastatin 20 MG Oral Tablet" />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.MedicationStatement} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:labels.statusReason', 'Status Reason')} value={form.statusReason} onChange={(v) => updateForm("statusReason", v)} placeholder="Reason for status change" />
                <SelectField label={t('common:labels.category', 'Category')} value={form.category} options={["inpatient", "outpatient", "community", "patientspecified"]} onChange={(v) => updateForm("category", v)} />
                <Field label={t('common:labels.dosage', 'Dosage')} value={form.dosage} onChange={(v) => updateForm("dosage", v)} placeholder="e.g. 1 tablet daily" />
                <Field label={t('common:labels.effectiveDate', 'Effective Date')} value={form.effectiveDate || getTodayString()} onChange={(v) => updateForm("effectiveDate", v)} type="date" />
                <Field label={t('common:labels.dateAsserted', 'Date Asserted')} value={form.dateAsserted || getTodayString()} onChange={(v) => updateForm("dateAsserted", v)} type="date" />
                <Field label={t('common:labels.reasonCode', 'Reason')} value={form.reasonCode} onChange={(v) => updateForm("reasonCode", v)} placeholder="Indication / reason" />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {tab === "Observation" && ( //check later
              <>
                <Field label={t('common:labels.display')} value={form.display} onChange={(v) => updateForm("display", v)} required />
                <SelectField label={t('patient:medicalProfile.tabs.vitalSigns')} value={form.vitalType} options={VITAL_TYPES.map((v) => v.label)} onChange={(v) => updateForm("vitalType", v)} />
                <Field label={t('common:value')} value={form.value} onChange={(v) => updateForm("value", v)} required placeholder={`Unit: ${VITAL_TYPES.find(v => v.label === form.vitalType)?.unit}`} />
                <Field label={t('common:labels.unit')} value={form.unit} onChange={(v) => updateForm("unit", v)} />
                <Field label={t('common:system')} value={form.system} onChange={(v) => updateForm("system", v)} />
                <Field label={t('common:date')} value={form.date || getTodayString()} onChange={(v) => updateForm("date", v)} type="date" />
              </>
            )}

            {tab === "Immunization" && (
              <>
                <Field label={t('common:labels.vaccine')} value={form.vaccine} onChange={(v) => updateForm("vaccine", v)} required placeholder="e.g. IPV" />
                <SelectField label={t('common:status')} value={form.status} options={["completed", "entered-in-error", "not-done"]} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:date')} value={form.occurrenceDate || form.occurrenceDateTime || getTodayString()} onChange={(v) => updateForm("occurrenceDate", v)} type="date" />
                <Field label={t('common:labels.lotNumber', 'Lot Number')} value={form.lotNumber} onChange={(v) => updateForm("lotNumber", v)} />
                <Field label={t('common:labels.manufacturer', 'Manufacturer')} value={form.manufacturer} onChange={(v) => updateForm("manufacturer", v)} />
                <Field label={t('common:labels.site', 'Site')} value={form.site} onChange={(v) => updateForm("site", v)} />
                <Field label={t('common:labels.route', 'Route')} value={form.route} onChange={(v) => updateForm("route", v)} />
                <Field label={t('common:labels.doseQuantity', 'Dose Quantity')} value={form.doseQuantity} onChange={(v) => updateForm("doseQuantity", v)} type="number" />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />

              </>
            )}

            {tab === "MedicationStatement" && (
              <>
                <Field label={t('common:labels.medication', 'Medication')} value={form.medication} onChange={(v) => updateForm("medication", v)} required placeholder="e.g. Atorvastatin 20 MG Oral Tablet" />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.MedicationStatement} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:labels.statusReason', 'Status Reason')} value={form.statusReason} onChange={(v) => updateForm("statusReason", v)} placeholder="Reason for status change" />
                <SelectField label={t('common:labels.category', 'Category')} value={form.category} options={["inpatient", "outpatient", "community", "patientspecified"]} onChange={(v) => updateForm("category", v)} />
                <Field label={t('common:labels.dosage', 'Dosage')} value={form.dosage} onChange={(v) => updateForm("dosage", v)} placeholder="e.g. 1 tablet daily" />
                <Field label={t('common:labels.effectiveDate', 'Effective Date')} value={form.effectiveDate || getTodayString()} onChange={(v) => updateForm("effectiveDate", v)} type="date" />
                <Field label={t('common:labels.dateAsserted', 'Date Asserted')} value={form.dateAsserted || getTodayString()} onChange={(v) => updateForm("dateAsserted", v)} type="date" />
                <Field label={t('common:labels.reasonCode', 'Reason')} value={form.reasonCode} onChange={(v) => updateForm("reasonCode", v)} placeholder="Indication / reason" />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {tab === "Procedure" && (
              <>
                <Field label={t('common:labels.display', 'Procedure')} value={form.display} onChange={(v) => updateForm("display", v)} required placeholder="e.g. Appendectomy" />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.Procedure} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:labels.statusReason', 'Status Reason')} value={form.statusReason} onChange={(v) => updateForm("statusReason", v)} />
                <Field label={t('common:labels.category', 'Category')} value={form.category} onChange={(v) => updateForm("category", v)} placeholder="e.g. Surgical procedure" />
                <Field label={t('common:labels.performedDate', 'Performed Date')} value={form.performedDate || getTodayString()} onChange={(v) => updateForm("performedDate", v)} type="date" />
                <Field label={t('common:labels.performer', 'Performer')} value={form.performer} onChange={(v) => updateForm("performer", v)} placeholder="Practitioner name / ref" />
                <Field label={t('common:labels.location', 'Location')} value={form.location} onChange={(v) => updateForm("location", v)} placeholder="Where performed" />
                <Field label={t('common:labels.bodySite', 'Body Site')} value={form.bodySite} onChange={(v) => updateForm("bodySite", v)} />
                <Field label={t('common:labels.reasonCode', 'Reason')} value={form.reasonCode} onChange={(v) => updateForm("reasonCode", v)} />
                <Field label={t('common:labels.outcome', 'Outcome')} value={form.outcome} onChange={(v) => updateForm("outcome", v)} placeholder="e.g. Successful" />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {tab === "DiagnosticReport" && (
              <>
                <Field label={t('common:labels.display', 'Report')} value={form.display} onChange={(v) => updateForm("display", v)} required placeholder="e.g. Complete Blood Count" />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.DiagnosticReport} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:labels.category', 'Category')} value={form.category} onChange={(v) => updateForm("category", v)} placeholder="e.g. Laboratory, Radiology" />
                <Field label={t('common:labels.effectiveDate', 'Effective Date')} value={form.effectiveDate || getTodayString()} onChange={(v) => updateForm("effectiveDate", v)} type="date" />
                <Field label={t('common:labels.issued', 'Issued')} value={form.issued || getTodayString()} onChange={(v) => updateForm("issued", v)} type="date" />
                <Field label={t('common:labels.performer', 'Performer')} value={form.performer} onChange={(v) => updateForm("performer", v)} />
                <Field label={t('common:labels.resultsInterpreter', 'Results Interpreter')} value={form.resultsInterpreter} onChange={(v) => updateForm("resultsInterpreter", v)} />
                <Field label={t('common:labels.result', 'Result')} value={form.result} onChange={(v) => updateForm("result", v)} placeholder="Reference to Observation or summary" multiline />
                <Field label={t('common:labels.conclusion', 'Conclusion')} value={form.conclusion} onChange={(v) => updateForm("conclusion", v)} multiline />
                <Field label={t('common:labels.conclusionCode', 'Conclusion Code')} value={form.conclusionCode} onChange={(v) => updateForm("conclusionCode", v)} />
              </>
            )}

            {tab === "Flag" && (
              <>
                <Field label={t('common:labels.display', 'Flag')} value={form.display} onChange={(v) => updateForm("display", v)} required placeholder="e.g. Fall Risk" />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.Flag} onChange={(v) => updateForm("status", v)} />
                <Field label={t('common:labels.category', 'Category')} value={form.category} onChange={(v) => updateForm("category", v)} placeholder="e.g. Safety, Clinical" />
                <Field label={t('common:labels.periodStart', 'Period Start')} value={form.periodStart || getTodayString()} onChange={(v) => updateForm("periodStart", v)} type="date" />
                <Field label={t('common:labels.periodEnd', 'Period End')} value={form.periodEnd} onChange={(v) => updateForm("periodEnd", v)} type="date" />
                <Field label={t('common:labels.author', 'Author')} value={form.author} onChange={(v) => updateForm("author", v)} placeholder="Practitioner / Patient ref" />
                <Field label={t('common:labels.encounter', 'Encounter')} value={form.encounter} onChange={(v) => updateForm("encounter", v)} />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {tab === "CarePlan" && (
              <>
                <Field label={t('common:labels.title', 'Title')} value={form.title} onChange={(v) => updateForm("title", v)} required placeholder="e.g. Hypertension Management" />
                <Field label={t('common:labels.description', 'Description')} value={form.description} onChange={(v) => updateForm("description", v)} multiline />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.CarePlan} onChange={(v) => updateForm("status", v)} />
                <SelectField label={t('common:labels.intent', 'Intent')} value={form.intent} options={CAREPLAN_INTENTS} onChange={(v) => updateForm("intent", v)} />
                <Field label={t('common:labels.category', 'Category')} value={form.category} onChange={(v) => updateForm("category", v)} placeholder="e.g. Assessment, Discharge" />
                <Field label={t('common:labels.periodStart', 'Period Start')} value={form.periodStart || getTodayString()} onChange={(v) => updateForm("periodStart", v)} type="date" />
                <Field label={t('common:labels.periodEnd', 'Period End')} value={form.periodEnd} onChange={(v) => updateForm("periodEnd", v)} type="date" />
                <Field label={t('common:labels.author', 'Author')} value={form.author} onChange={(v) => updateForm("author", v)} />
                <Field label={t('common:labels.addresses', 'Addresses (Conditions)')} value={form.addresses} onChange={(v) => updateForm("addresses", v)} placeholder="Comma-separated condition refs" />
                <Field label={t('common:labels.activity', 'Activity')} value={form.activity} onChange={(v) => updateForm("activity", v)} multiline placeholder="Plan activities / actions" />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {tab === "FamilyMemberHistory" && (
              <>
                <Field label={t('common:labels.name', 'Name')} value={form.name} onChange={(v) => updateForm("name", v)} placeholder="Family member name (optional)" />
                <SelectField label={t('common:labels.relationship', 'Relationship')} value={form.relationship} options={FAMILY_RELATIONSHIPS} onChange={(v) => updateForm("relationship", v)} />
                <SelectField label={t('common:status')} value={form.status} options={STATUS_OPTIONS.FamilyMemberHistory} onChange={(v) => updateForm("status", v)} />
                <SelectField label={t('common:labels.sex', 'Sex')} value={form.sex} options={ADMIN_GENDER} onChange={(v) => updateForm("sex", v)} />
                <Field label={t('common:labels.bornDate', 'Born Date')} value={form.bornDate} onChange={(v) => updateForm("bornDate", v)} type="date" />
                <Field label={t('common:labels.age', 'Age')} value={form.age} onChange={(v) => updateForm("age", v)} type="number" placeholder="Age in years" />
                <CheckboxField label={t('common:labels.deceased', 'Deceased')} value={form.deceasedBoolean} onChange={(v) => updateForm("deceasedBoolean", v)} />
                {form.deceasedBoolean && (
                  <Field label={t('common:labels.deceasedDate', 'Deceased Date')} value={form.deceasedDate} onChange={(v) => updateForm("deceasedDate", v)} type="date" />
                )}
                <Field label={t('common:labels.condition', 'Condition')} value={form.condition} onChange={(v) => updateForm("condition", v)} placeholder="e.g. Diabetes mellitus type 2" />
                <Field label={t('common:labels.reasonCode', 'Reason')} value={form.reasonCode} onChange={(v) => updateForm("reasonCode", v)} />
                <Field label={t('common:date')} value={form.date || getTodayString()} onChange={(v) => updateForm("date", v)} type="date" />
                <Field label={t('common:labels.notes', 'Notes')} value={form.notes} onChange={(v) => updateForm("notes", v)} multiline />
              </>
            )}

            {/* Error Message */}
            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t('common:cancel')}
          </button>
          <button
            type="button"
            onClick={() => originalRecord ? handleUpateProfileClicked(originalRecord, form, tab) : handleCreateProfileClicked(form, tab)}
            form="record-form"
            disabled={isSubmitting}
            className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium bg-[#2C3B8D] hover:bg-[#233070] text-white transition-colors disabled:opacity-70 flex items-center gap-2 min-w-[130px] justify-center"
          >
            {isSubmitting && (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {initialData ? t('common:saveChanges') : t('common:addRecord')}
          </button>
        </div>
      </div>
    </div>
  );
}
