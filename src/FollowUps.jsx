import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import Header from "./components/Header";
import config from "./config";
import { WarningIcon, MailIcon, ChatIcon, CheckCircleIcon, XCircleIcon, LightbulbIcon, SearchIcon } from "./components/icons";

const API_URL = config.backendUrl;

export default function FollowUps() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);

  // State management
  const [selectedMethod, setSelectedMethod] = useState('email'); // 'email' or 'sms'
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [contactOverrides, setContactOverrides] = useState({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [showEditContact, setShowEditContact] = useState({});

  // Load patients and templates on mount
  useEffect(() => {
    fetchPatients();
    loadTemplates();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients`);
      setPatients(response.data.patients || []);
      setError('');
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(t('functions:followUps.loadError', 'Failed to load patient list. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/message-templates`);
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      // Don't set error state for template loading failure
    }
  };

  // Client-side filtering (same as PatientSelector)
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.trim().toLowerCase();
    if (!searchLower) return false;
    return (
      patient.first_name.toLowerCase().includes(searchLower) ||
      patient.last_name.toLowerCase().includes(searchLower) ||
      patient.full_name.toLowerCase().includes(searchLower) ||
      (patient.mrn && patient.mrn.toLowerCase().includes(searchLower))
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
      // Deselect
      setSelectedPatients(selectedPatients.filter(p => p.id !== patient.id));
      const newOverrides = { ...contactOverrides };
      delete newOverrides[patient.id];
      setContactOverrides(newOverrides);
    } else {
      // Select
      setSelectedPatients([...selectedPatients, patient]);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomMessage(template.content || '');
    setCustomSubject(template.subject || '');
  };

  const updateContactOverride = (patientId, field, value) => {
    setContactOverrides({
      ...contactOverrides,
      [patientId]: {
        ...contactOverrides[patientId],
        [field]: value
      }
    });
  };

  const interpolateMessage = (message, patient) => {
    const overrides = contactOverrides[patient.id] || {};
    const patientName = `${patient.first_name} ${patient.last_name}`;

    return message
      .replace(/{patient_name}/g, patientName)
      .replace(/{doctor_name}/g, 'Dr. Smith')  // Could be made configurable
      .replace(/{clinic_name}/g, 'Medical Clinic')  // Could be made configurable
      .replace(/{date}/g, overrides.date || new Date().toLocaleDateString())
      .replace(/{time}/g, overrides.time || '');
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

    // Validate contact information
    for (const patient of selectedPatients) {
      const overrides = contactOverrides[patient.id] || {};

      if (selectedMethod === 'email') {
        const email = overrides.email || patient.email;
        if (!email) {
          setError(t('functions:followUps.missingEmail', { name: patient.full_name, defaultValue: `Missing email for ${patient.full_name}. Please add an email address.` }));
          return false;
        }
        // Basic email validation
        if (!email.includes('@')) {
          setError(t('functions:followUps.invalidEmail', { name: patient.full_name, defaultValue: `Invalid email for ${patient.full_name}` }));
          return false;
        }
      } else {
        const phone = overrides.phone || patient.phone;
        if (!phone) {
          setError(t('functions:followUps.missingPhone', { name: patient.full_name, defaultValue: `Missing phone number for ${patient.full_name}` }));
          return false;
        }
      }
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateRecipients()) {
      return;
    }

    setIsSending(true);
    setError('');
    setSendResults(null);

    try {
      // Prepare recipients
      const recipients = selectedPatients.map(patient => {
        const overrides = contactOverrides[patient.id] || {};
        const message = interpolateMessage(customMessage, patient);

        const recipient = {
          patient_id: patient.id,
          patient_name: patient.full_name,
          message: message
        };

        if (selectedMethod === 'email') {
          recipient.email = overrides.email || patient.email;
          recipient.subject = interpolateMessage(customSubject || 'Message from Your Clinic', patient);
          recipient.body = message;  // For email, use 'body' instead of 'message'
        } else {
          recipient.phone = overrides.phone || patient.phone;
        }

        return recipient;
      });

      const response = await axios.post(`${API_URL}/api/send-followup`, {
        method: selectedMethod,
        recipients: recipients
      });

      setSendResults(response.data);

      // Clear form on success
      if (response.data.success) {
        setTimeout(() => {
          setSelectedPatients([]);
          setContactOverrides({});
          setCustomMessage('');
          setCustomSubject('');
          setSelectedTemplate(null);
        }, 3000);
      }

    } catch (err) {
      console.error('Error sending messages:', err);
      setError(err.response?.data?.error || t('functions:followUps.sendError', 'Failed to send messages'));
    } finally {
      setIsSending(false);
    }
  };

  const toggleEditContact = (patientId) => {
    setShowEditContact({
      ...showEditContact,
      [patientId]: !showEditContact[patientId]
    });
  };

  // Loading state
  if (loading && patients.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          title={t('functions:followUps.title')}
          subtitle={t('functions:followUps.subtitle')}
          showBackButton={true}
          backRoute="/function-libraries"
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin inline-block w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full mb-4"></div>
            <div className="text-2xl font-semibold text-[#475569]">{t('functions:followUps.loadingPatients', 'Loading patients...')}</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && patients.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          title={t('functions:followUps.title')}
          subtitle={t('functions:followUps.subtitle')}
          showBackButton={true}
          backRoute="/function-libraries"
        />
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 max-w-md text-center">
            <div className="text-5xl mb-4"><WarningIcon className="w-12 h-12 text-red-500 mx-auto" /></div>
            <div className="text-xl font-bold text-red-700 mb-2">{t('common:errors.generic', 'Error')}</div>
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={fetchPatients}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              {t('functions:followUps.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:followUps.title')}
        subtitle={t('functions:followUps.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Communication Method Toggle */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-6 border border-[rgba(15,23,42,0.1)]">
          <h2 className="text-xl font-bold text-[#1e293b] mb-4">{t('functions:followUps.communicationMethod', 'Communication Method')}</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedMethod('email')}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                selectedMethod === 'email'
                  ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(15,23,42,0.1)] btn-glow'
                  : 'bg-[#f8fafc] text-[#475569] border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MailIcon className="w-6 h-6" />
                <span>{t('functions:followUps.email', 'Email')}</span>
              </div>
            </button>
            {/* SMS button hidden until feature is developed */}
            {/* <button
              onClick={() => setSelectedMethod('sms')}
              className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${
                selectedMethod === 'sms'
                  ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(15,23,42,0.1)] btn-glow'
                  : 'bg-[#f8fafc] text-[#475569] border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ChatIcon className="w-6 h-6" />
                <span>{t('functions:followUps.sms', 'SMS')}</span>
              </div>
            </button> */}
          </div>
        </div>

        {/* Patient Search */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-6 border border-[rgba(15,23,42,0.1)]">
          <h2 className="text-xl font-bold text-[#1e293b] mb-4">{t('functions:followUps.searchPatients', 'Search Patients')}</h2>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder={t('functions:patientQuery.searchPlaceholder', 'Search by name or MRN...')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasSearched(false);
                if (searchError && e.target.value.trim()) {
                  setSearchError('');
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg font-semibold btn-glow hover:opacity-90 transition-all"
            >
              {t('common:buttons.search')}
            </button>
          </div>

          {/* Search Error or Info */}
          {searchError ? (
            <div className="mt-3 text-sm text-red-600 font-medium">{searchError}</div>
          ) : (
            <div className="mt-3 text-sm text-[#475569]">
              {hasSearched
                ? t('functions:followUps.foundPatients', { count: filteredPatients.length, defaultValue: `Found ${filteredPatients.length} patient${filteredPatients.length !== 1 ? 's' : ''}` })
                : t('functions:followUps.searchHint', 'Enter a patient name or MRN above and click Search to load matching records.')}
            </div>
          )}

          {/* Search Results */}
          {hasSearched && filteredPatients.length > 0 && (
            <div className="mt-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPatients.find(p => p.id === patient.id)
                        ? 'border-[#3b82f6] bg-[rgba(59,130,246,0.08)]'
                        : 'border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedPatients.find(p => p.id === patient.id)
                            ? 'bg-[#3b82f6] text-white'
                            : 'bg-[#e2e8f0] text-[#475569]'
                        }`}>
                          {selectedPatients.find(p => p.id === patient.id) ? '✓' : patient.first_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1e293b]">{patient.full_name}</div>
                          <div className="text-sm text-[#475569]">
                            MRN: {patient.mrn || 'N/A'} | {patient.gender} | DOB: {patient.birth_date}
                          </div>
                          <div className="text-sm text-[#64748b]">
                            {selectedMethod === 'email'
                              ? `Email: ${patient.email || 'Not available'}`
                              : `Phone: ${patient.phone || 'Not available'}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {hasSearched && filteredPatients.length === 0 && (
            <div className="mt-4 p-8 bg-[#f8fafc] rounded-lg text-center">
              <div className="mb-3"><SearchIcon className="w-8 h-8 text-[#3b82f6] mx-auto" /></div>
              <div className="text-lg font-semibold text-[#1e293b] mb-1">{t('functions:patientQuery.noPatients', 'No patients found')}</div>
              <div className="text-sm text-[#475569]">
                {t('functions:followUps.noMatch', { term: searchTerm.trim(), defaultValue: `No patients match "${searchTerm.trim()}"` })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Patients */}
        {selectedPatients.length > 0 && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-6 border border-[rgba(15,23,42,0.1)]">
            <h2 className="text-xl font-bold text-[#1e293b] mb-4">
              {t('functions:followUps.selectedPatients', 'Selected Patients')} ({selectedPatients.length})
            </h2>
            <div className="space-y-3">
              {selectedPatients.map((patient) => {
                const overrides = contactOverrides[patient.id] || {};
                const isEditing = showEditContact[patient.id];

                return (
                  <div key={patient.id} className="p-4 bg-[rgba(59,130,246,0.08)] rounded-lg border border-[rgba(59,130,246,0.2)]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-[#1e293b]">{patient.full_name}</div>

                        {!isEditing ? (
                          <div className="text-sm text-[#475569] mt-1">
                            {selectedMethod === 'email'
                              ? `Email: ${overrides.email || patient.email || 'Not set'}`
                              : `Phone: ${overrides.phone || patient.phone || 'Not set'}`
                            }
                          </div>
                        ) : (
                          <div className="mt-2">
                            {selectedMethod === 'email' ? (
                              <input
                                type="email"
                                placeholder={t('functions:followUps.enterEmail', 'Enter email address')}
                                value={overrides.email || patient.email || ''}
                                onChange={(e) => updateContactOverride(patient.id, 'email', e.target.value)}
                                className="w-full px-3 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
                              />
                            ) : (
                              <input
                                type="tel"
                                placeholder={t('functions:followUps.enterPhone', 'Enter phone number (+1234567890)')}
                                value={overrides.phone || patient.phone || ''}
                                onChange={(e) => updateContactOverride(patient.id, 'phone', e.target.value)}
                                className="w-full px-3 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleEditContact(patient.id)}
                          className="px-3 py-1 bg-[rgba(59,130,246,0.1)] text-[#3b82f6] rounded-lg text-sm hover:bg-[rgba(59,130,246,0.2)] transition"
                        >
                          {isEditing ? t('functions:followUps.done', 'Done') : t('functions:followUps.edit', 'Edit')}
                        </button>
                        <button
                          onClick={() => handleSelectPatient(patient)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition"
                        >
                          {t('functions:followUps.remove', 'Remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Template & Editor */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-6 border border-[rgba(15,23,42,0.1)]">
          <h2 className="text-xl font-bold text-[#1e293b] mb-4">{t('functions:followUps.message', 'Message')}</h2>

          {/* Template Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#475569] mb-2">
              {t('functions:followUps.selectTemplate', 'Select Template (Optional)')}
            </label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) handleTemplateSelect(template);
              }}
              className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
            >
              <option value="">-- {t('functions:followUps.selectATemplate', 'Select a template')} --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject (Email only) */}
          {selectedMethod === 'email' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#475569] mb-2">
                {t('functions:followUps.emailSubject', 'Email Subject')}
              </label>
              <input
                type="text"
                placeholder={t('functions:followUps.enterEmailSubject', 'Enter email subject')}
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
          )}

          {/* Message Body */}
          <div>
            <label className="block text-sm font-semibold text-[#475569] mb-2">
              {t('functions:followUps.messageContent', 'Message Content')}
            </label>
            <textarea
              placeholder={t('functions:followUps.messagePlaceholder', 'Enter your message here... You can use {patient_name}, {doctor_name}, {clinic_name}, {date}, {time}')}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] font-mono text-sm transition-colors"
            />
            <div className="mt-2 text-xs text-[#64748b]">
              {t('functions:followUps.availableVariables', 'Available variables')}: {'{patient_name}'}, {'{doctor_name}'}, {'{clinic_name}'}, {'{date}'}, {'{time}'}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <WarningIcon className="w-6 h-6 text-red-500" />
              <div>
                <div className="font-semibold text-red-800">{t('common:errors.generic', 'Error')}</div>
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Send Results */}
        {sendResults && (
          <div className={`border-2 rounded-lg p-6 mb-6 ${
            sendResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3 mb-4">
              {sendResults.success ? <CheckCircleIcon className="w-8 h-8 text-green-600" /> : <XCircleIcon className="w-8 h-8 text-red-600" />}
              <div>
                <div className={`font-bold text-lg ${sendResults.success ? 'text-green-800' : 'text-red-800'}`}>
                  {sendResults.success ? t('functions:followUps.sendSuccess', 'Messages Sent Successfully!') : t('functions:followUps.sendPartialFail', 'Some Messages Failed')}
                </div>
                <div className={`text-sm ${sendResults.success ? 'text-green-700' : 'text-red-700'}`}>
                  Success: {sendResults.success_count} | Failed: {sendResults.failure_count}
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            {sendResults.results && sendResults.results.length > 0 && (
              <div className="mt-4 space-y-2">
                {sendResults.results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      result.success ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {result.to || result.email || result.phone}
                      </span>
                      <span className={`text-xs ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.success ? '✓ Sent' : `✗ ${result.message || result.error}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Send Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSend}
            disabled={isSending || selectedPatients.length === 0 || !customMessage.trim()}
            className="px-12 py-4 bg-[#3b82f6] text-white rounded-lg font-bold text-lg shadow-[0_10px_30px_rgba(15,23,42,0.12)] btn-glow hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('functions:followUps.sending', 'Sending...')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {selectedMethod === 'email' ? <MailIcon className="w-6 h-6" /> : <ChatIcon className="w-6 h-6" />}
                <span>{t('functions:followUps.sendTo', { count: selectedPatients.length, defaultValue: `Send to ${selectedPatients.length} Patient${selectedPatients.length !== 1 ? 's' : ''}` })}</span>
              </div>
            )}
          </button>
        </div>

        {/* Help/Instructions */}
        {selectedPatients.length === 0 && (
          <div className="mt-8 bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-lg p-6">
            <h3 className="font-semibold text-[#1e293b] mb-3 flex items-center">
              <LightbulbIcon className="w-6 h-6 text-[#3b82f6] mr-2" />
              {t('functions:followUps.howToUse', 'How to Use')}
            </h3>
            <ol className="text-[#475569] text-sm space-y-2 list-decimal list-inside">
              <li>{t('functions:followUps.step1', 'Choose your communication method (Email or SMS)')}</li>
              <li>{t('functions:followUps.step2', 'Search for patients by name or MRN')}</li>
              <li>{t('functions:followUps.step3', 'Select one or more patients from the search results')}</li>
              <li>{t('functions:followUps.step4', 'Edit contact information if needed')}</li>
              <li>{t('functions:followUps.step5', 'Choose a message template or write a custom message')}</li>
              <li>{t('functions:followUps.step6', 'Review and send your messages')}</li>
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}