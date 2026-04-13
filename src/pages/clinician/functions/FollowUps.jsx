import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { NavBar, SystemStatus } from "@/components";
import {
  WarningIcon,
  MailIcon,
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  UserIcon,
  LightbulbIcon,
} from "@/components/ui/icons";

import { getPatients,getAssignedPatients } from "@/api/patientApi";
import functionApi from "@/api/functionApi";

/* ------------------------------------------------------------------ */
/* Section Header (Encounters 패턴)                                     */
/* ------------------------------------------------------------------ */
function SectionHeader({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
      <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-[#2C3B8D]" />
      </div>
      <h2 className="text-[17px] font-semibold text-slate-800">{title}</h2>
      {badge != null && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
          {badge}
        </span>
      )}
    </div>
  );
}

function SectionCard({ children }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step Indicator (How to Use 대체)                                     */
/* ------------------------------------------------------------------ */
const STEPS = [
  { id: 1, label: 'Search Patient' },
  { id: 2, label: 'Select Patient' },
  { id: 3, label: 'Write Message' },
  { id: 4, label: 'Send' },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between relative">
        {/* connector line */}
        <div className="absolute top-[18px] left-0 right-0 h-px bg-slate-200 z-0" />
        <div
          className="absolute top-[18px] left-0 h-px bg-[#2C3B8D] z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const done = currentStep > step.id;
          const active = currentStep === step.id;
          return (
            <div key={step.id} className="flex flex-col items-center z-10 flex-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                done
                  ? 'bg-[#2C3B8D] border-[#2C3B8D] text-white'
                  : active
                  ? 'bg-white border-[#2C3B8D] text-[#2C3B8D] shadow-md'
                  : 'bg-white border-slate-200 text-slate-300'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.id}
              </div>
              <span className={`mt-2 text-[11px] font-medium text-center leading-tight transition-colors duration-300 ${
                active ? 'text-[#2C3B8D]' : done ? 'text-slate-500' : 'text-slate-300'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HTML Email Formatter                                                 */
/* ------------------------------------------------------------------ */
function formatEmailBody(plainText, patientName, clinicName = 'Medical Clinic') {
  const paragraphs = plainText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p style="margin:0 0 14px 0;line-height:1.7;color:#374151;">${line}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:#2C3B8D;padding:28px 36px;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#a5b4fc;letter-spacing:1.5px;text-transform:uppercase;">
              ${clinicName}
            </p>
            <p style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">
              Message for ${patientName}
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 36px 24px;">
            ${paragraphs}
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 36px;">
            <div style="height:1px;background:#e5e7eb;"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px 28px;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              This message was sent on behalf of <strong style="color:#6b7280;">${clinicName}</strong>.<br/>
              If you have questions, please contact your clinic directly.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */
export default function FollowUps() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);

  const selectedMethod = 'email';

  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [contactOverrides, setContactOverrides] = useState({});

  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showEditContact, setShowEditContact] = useState({});

  /* current step 계산 */
  const currentStep = (() => {
    if (selectedPatients.length > 0 && customMessage.trim()) return 4;
    if (selectedPatients.length > 0) return 3;
    if (hasSearched) return 2;
    return 1;
  })();

  useEffect(() => {
    fetchPatients();
    loadTemplates();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // const response = await getAssignedPatients();
      const response = await getPatients();
      setPatients(response.data.patients || []);
      setError('');
    } catch (err) {
      setError(t('functions:followUps.loadError', 'Failed to load patient list. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await functionApi.getMessageTemplates();
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return false;
    return (
      patient.first_name?.toLowerCase().includes(s) ||
      patient.last_name?.toLowerCase().includes(s) ||
      patient.full_name?.toLowerCase().includes(s) ||
      patient.name?.toLowerCase().includes(s) ||
      patient.mrn?.toLowerCase().includes(s)
    );
  });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchError(t('functions:followUps.searchError', 'Please enter a patient name or MRN to search'));
      setHasSearched(false);
      return;
    }
    setSearchError('');
    setHasSearched(true);
  };

  const handleSelectPatient = (patient) => {
    if (selectedPatients.find(p => p.id === patient.id)) {
      setSelectedPatients(selectedPatients.filter(p => p.id !== patient.id));
      const next = { ...contactOverrides };
      delete next[patient.id];
      setContactOverrides(next);
    } else {
      setSelectedPatients([...selectedPatients, patient]);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomMessage(template.content || '');
    setCustomSubject(template.subject || '');
  };

  const updateContactOverride = (patientId, field, value) => {
    setContactOverrides(prev => ({
      ...prev,
      [patientId]: { ...prev[patientId], [field]: value },
    }));
  };

  const interpolateMessage = (message, patient) => {
    const overrides = contactOverrides[patient.id] || {};
    const patientName = patient.full_name || patient.name ||
      [patient.first_name, patient.last_name].filter(Boolean).join(' ');
    return message
      .replace(/{patient_name}/g, patientName)
      .replace(/{doctor_name}/g, overrides.doctor_name || 'Dr. Smith')
      .replace(/{clinic_name}/g, overrides.clinic_name || 'Medical Clinic')
      .replace(/{date}/g, overrides.date || new Date().toLocaleDateString('en-CA'))
      .replace(/{time}/g, overrides.time || '')
      .replace(/{mrn}/g, patient.mrn || '')
      .replace(/{date_of_birth}/g, patient.date_of_birth || '')
      .replace(/{email}/g, overrides.email || patient.email || '');
  };

  const validateRecipients = () => {
    if (selectedPatients.length === 0) {
      setError(t('functions:followUps.selectPatientError', 'Please select at least one patient'));
      return false;
    }
    if (!customMessage.trim()) {
      setError(t('functions:followUps.messageError', 'Please enter a message or select a template'));
      return false;
    }
    for (const patient of selectedPatients) {
      const overrides = contactOverrides[patient.id] || {};
      const email = overrides.email || patient.email;
      if (!email || !email.includes('@')) {
        setError(`Missing or invalid email for ${patient.full_name || patient.name}.`);
        return false;
      }
    }
    return true;
  };

  const handleSend = async () => {
    if (!validateRecipients()) return;
    setIsSending(true);
    setError('');
    setSendResults(null);

    try {
      const recipients = selectedPatients.map(patient => {
        const overrides = contactOverrides[patient.id] || {};
        const plainText = interpolateMessage(customMessage, patient);
        const patientName = patient.full_name || patient.name ||
          [patient.first_name, patient.last_name].filter(Boolean).join(' ');
        const clinicName = overrides.clinic_name || 'Medical Clinic';

        return {
          patient_id: patient.id,
          patient_name: patientName,
          message: plainText,
          email: overrides.email || patient.email,
          subject: interpolateMessage(customSubject || 'Message from Your Clinic', patient),
          // 3. HTML 이메일 포맷 적용
          body: formatEmailBody(plainText, patientName, clinicName),
        };
      });

      const response = await functionApi.sendFollowup(selectedMethod, recipients);
      setSendResults(response.data);

      if (response.data.success) {
        setTimeout(() => {
          setSelectedPatients([]);
          setContactOverrides({});
          setCustomMessage('');
          setCustomSubject('');
          setSelectedTemplate(null);
          setSendResults(null);
        }, 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('functions:followUps.sendError', 'Failed to send messages'));
    } finally {
      setIsSending(false);
    }
  };

  const toggleEditContact = (patientId) => {
    setShowEditContact(prev => ({ ...prev, [patientId]: !prev[patientId] }));
  };

  /* ---------------------------------------------------------------- */
  /* Loading / Error states                                            */
  /* ---------------------------------------------------------------- */
  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header
          title={t('functions:followUps.title')}
          subtitle={t('functions:followUps.subtitle')}
          showBackButton
          backRoute="/function-libraries"
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-[#2C3B8D] border-t-transparent rounded-full mb-4" />
            <div className="text-lg font-medium text-slate-500">
              {t('functions:followUps.loadingPatients', 'Loading patients...')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header
          title={t('functions:followUps.title')}
          subtitle={t('functions:followUps.subtitle')}
          showBackButton
          backRoute="/function-libraries"
        />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md text-center">
            <WarningIcon className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <div className="text-base font-semibold text-slate-800 mb-1">{t('common:errors.generic', 'Error')}</div>
            <div className="text-sm text-slate-500 mb-4">{error}</div>
            <button onClick={fetchPatients} className="px-5 py-2 bg-[#2C3B8D] text-white rounded-xl text-sm font-medium hover:bg-[#233070] transition">
              {t('functions:followUps.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Main Render                                                       */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* 1. Step Indicator (How to Use 대체) */}
        <StepIndicator currentStep={currentStep} />

        {/* ── Patient Search ── */}
        <SectionCard>
          <SectionHeader icon={SearchIcon} title={t('functions:followUps.searchPatients', 'Search Patients')} />
          <div className="p-5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('functions:patientQuery.searchPlaceholder', 'Search by name or MRN...')}
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setHasSearched(false);
                  if (searchError && e.target.value.trim()) setSearchError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] transition-colors"
              />
              <button
                onClick={handleSearch}
                className="px-5 py-2.5 bg-[#2C3B8D] hover:bg-[#233070] text-white rounded-xl text-sm font-semibold transition"
              >
                {t('common:buttons.search', 'Search')}
              </button>
            </div>

            {searchError ? (
              <p className="mt-2 text-xs text-red-500 font-medium">{searchError}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-400">
                {hasSearched
                  ? `${filteredPatients.length} patient${filteredPatients.length !== 1 ? 's' : ''} found`
                  : t('functions:followUps.searchHint', 'Enter a name or MRN and press Search.')}
              </p>
            )}

            {/* Results */}
            {hasSearched && filteredPatients.length > 0 && (
              <div className="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredPatients.map(patient => {
                  const isSelected = !!selectedPatients.find(p => p.id === patient.id);
                  const initial = (patient.first_name || patient.name || '?').charAt(0).toUpperCase();
                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-[#2C3B8D] bg-[#eef2ff]'
                          : 'border-slate-200 bg-white hover:border-[#2C3B8D] hover:bg-[#f5f7ff]'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected ? 'bg-[#2C3B8D] text-white' : 'bg-[#e6ecff] text-[#2C3B8D]'
                      }`}>
                        {isSelected ? '✓' : initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {patient.full_name || patient.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {[
                            { label: 'MRN', value: patient.mrn },
                            { label: 'DOB', value: patient.date_of_birth },
                            { label: 'Email', value: patient.email },
                          ].map(({ label, value }) => value && (
                            <span key={label} className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
                              <span className="text-[11px] font-medium text-slate-700">{value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {hasSearched && filteredPatients.length === 0 && (
              <div className="mt-4 py-8 text-center bg-[#f5f7ff] rounded-xl border border-slate-100">
                <SearchIcon className="w-7 h-7 text-[#2C3B8D] mx-auto mb-2 opacity-40" />
                <div className="text-sm font-medium text-slate-500">
                  {t('functions:patientQuery.noPatients', 'No patients found')}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Selected Patients ── */}
        {selectedPatients.length > 0 && (
          <SectionCard>
            <SectionHeader
              icon={UserIcon}
              title={t('functions:followUps.selectedPatients', 'Selected Patients')}
              badge={selectedPatients.length}
            />
            <div className="p-5 space-y-3">
              {selectedPatients.map(patient => {
                const overrides = contactOverrides[patient.id] || {};
                const isEditing = showEditContact[patient.id];
                return (
                  <div key={patient.id} className="px-4 py-3 bg-[#eef2ff] border border-[#c7d2f8] rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">
                          {patient.full_name || patient.name}
                        </div>
                        {!isEditing ? (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {`Email: ${overrides.email || patient.email || '—'}`}
                          </div>
                        ) : (
                          <div className="mt-2">
                            <input
                              type="email"
                              placeholder="Enter email address"
                              value={overrides.email ?? patient.email ?? ''}
                              onChange={e => updateContactOverride(patient.id, 'email', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#2C3B8D]"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => toggleEditContact(patient.id)}
                          className="px-2.5 py-1 text-[#2C3B8D] bg-white border border-[#c7d2f8] rounded-lg text-xs font-medium hover:bg-[#f5f7ff] transition"
                        >
                          {isEditing ? t('functions:followUps.done', 'Done') : t('functions:followUps.edit', 'Edit')}
                        </button>
                        <button
                          onClick={() => handleSelectPatient(patient)}
                          className="px-2.5 py-1 text-red-600 bg-white border border-red-100 rounded-lg text-xs font-medium hover:bg-red-50 transition"
                        >
                          {t('functions:followUps.remove', 'Remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* ── Message ── */}
        <SectionCard>
          <SectionHeader icon={MailIcon} title={t('functions:followUps.message', 'Message')} />
          <div className="p-5 space-y-4">

            {/* Template selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                {t('functions:followUps.selectTemplate', 'Template')}
              </label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={e => {
                  const tmpl = templates.find(t => t.id === e.target.value);
                  if (tmpl) handleTemplateSelect(tmpl);
                }}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] bg-white transition-colors"
              >
                <option value="">— {t('functions:followUps.selectATemplate', 'Select a template')} —</option>
                {templates.map(tmpl => (
                  <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                {t('functions:followUps.emailSubject', 'Subject')}
              </label>
              <input
                type="text"
                placeholder={t('functions:followUps.enterEmailSubject', 'Enter email subject')}
                value={customSubject}
                onChange={e => setCustomSubject(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] transition-colors"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                {t('functions:followUps.messageContent', 'Message')}
              </label>
              <textarea
                placeholder={t('functions:followUps.messagePlaceholder', 'Write your message… use {patient_name}, {doctor_name}, {clinic_name}, {date}, {time}')}
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] font-mono transition-colors resize-none"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                {t('functions:followUps.availableVariables', 'Variables')}:{' '}
                {['{patient_name}', '{doctor_name}', '{clinic_name}', '{date}', '{time}'].map(v => (
                  <code key={v} className="mx-0.5 px-1 py-0.5 bg-slate-100 rounded text-[10px] text-slate-500">{v}</code>
                ))}
              </p>
            </div>

            {/* Live preview */}
            {selectedPatients.length > 0 && customMessage && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                  Preview — {selectedPatients[0].full_name || selectedPatients[0].name}
                </label>
                <div className="px-4 py-3 bg-[#f5f7ff] border border-[#c7d2f8] rounded-xl text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {interpolateMessage(customMessage, selectedPatients[0])}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-5">
            <WarningIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-red-700">{t('common:errors.generic', 'Error')}</div>
              <div className="text-xs text-red-600 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* ── Send Results ── */}
        {sendResults && (
          <div className={`rounded-xl border p-5 mb-5 ${
            sendResults.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {sendResults.success
                ? <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                : <XCircleIcon className="w-6 h-6 text-red-400" />}
              <div>
                <div className={`text-sm font-semibold ${sendResults.success ? 'text-emerald-800' : 'text-red-700'}`}>
                  {sendResults.success
                    ? t('functions:followUps.sendSuccess', 'Messages sent successfully!')
                    : t('functions:followUps.sendPartialFail', 'Some messages failed')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Success: {sendResults.success_count} · Failed: {sendResults.failure_count}
                </div>
              </div>
            </div>
            {sendResults.results?.length > 0 && (
              <div className="space-y-1.5">
                {sendResults.results.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                    r.success ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}>
                    <span>{r.to || r.email || r.phone}</span>
                    <span>{r.success ? '✓ Sent' : `✗ ${r.message || r.error}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Send Button ── */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSend}
            disabled={isSending || selectedPatients.length === 0 || !customMessage.trim()}
            className="flex items-center gap-2 px-10 py-3.5 bg-[#2C3B8D] hover:bg-[#233070] text-white rounded-2xl font-semibold text-sm shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('functions:followUps.sending', 'Sending...')}
              </>
            ) : (
              <>
                <MailIcon className="w-4 h-4" />
                {`Send to ${selectedPatients.length} Patient${selectedPatients.length !== 1 ? 's' : ''}`}
              </>
            )}
          </button>
        </div>

        <SystemStatus />
      </main>
    </div>
  );
}