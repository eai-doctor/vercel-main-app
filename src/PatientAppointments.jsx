import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { LoginModal } from "@/features/modal";
import { ProfileDropdown, LanguageSwitcher } from "@/components";
import {
  CalendarIcon, ClockIcon, UserIcon, CheckCircleIcon,
  XCircleIcon, ClipboardListIcon, WarningIcon,
} from "./components/icons";
import config from "./config";

const API_URL = config.backendUrl;

const STATUS_STYLES = {
  pending:  { badge: "bg-amber-100 text-amber-800",  icon: ClockIcon,         label: "Pending"   },
  accepted: { badge: "bg-green-100 text-green-800",  icon: CheckCircleIcon,   label: "Confirmed" },
  declined: { badge: "bg-red-100 text-red-800",      icon: XCircleIcon,       label: "Declined"  },
};

const TIMES = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
];

export default function PatientAppointments() {
  const navigate = useNavigate();
const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'request'
  const [appointments, setAppointments] = useState([]);
  const [clinicians, setClinicians] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [error, setError] = useState('');

  // Request form state
  const [form, setForm] = useState({
    clinician_id: '',
    preferred_date: '',
    preferred_time: '',
    reason: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cancel state
  const [cancellingId, setCancellingId] = useState(null);

  // Rebook modal state — opened when patient clicks a clinician-suggested slot
  const [rebookModal, setRebookModal] = useState(null); // { slot: {date,time}, appt: originalAppt }
  const [rebookNotes, setRebookNotes] = useState('');
  const [rebookSubmitting, setRebookSubmitting] = useState(false);
  const [rebookSuccess, setRebookSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingAppts(true);
    setError('');
    try {
      const [apptRes, clinRes] = await Promise.all([
        axios.get(`${API_URL}/api/appointments`),
        axios.get(`${API_URL}/api/clinicians`),
      ]);
      setAppointments(apptRes.data.appointments || []);
      setClinicians(clinRes.data.clinicians || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoadingAppts(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openRebookModal(slot, appt) {
    setRebookNotes('');
    setRebookSuccess(false);
    setRebookModal({ slot, appt });
  }

  async function handleRebookConfirm() {
    if (!rebookModal) return;
    setRebookSubmitting(true);
    try {
      const { slot, appt } = rebookModal;
      const res = await axios.post(`${API_URL}/api/appointments`, {
        clinician_id: appt.clinician_id,
        preferred_date: slot.date,
        preferred_time: slot.time,
        reason: appt.reason,
        notes: rebookNotes,
      });
      setAppointments(prev => [...prev, res.data.appointment]);
      setRebookSuccess(true);
      setTimeout(() => setRebookModal(null), 1800);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setRebookSubmitting(false);
    }
  }

  function handleFormChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setSubmitSuccess(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clinician_id || !form.preferred_date || !form.preferred_time || !form.reason.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/appointments`, form);
      setAppointments(prev => [...prev, res.data.appointment]);
      setSubmitSuccess(true);
      setForm({ clinician_id: '', preferred_date: '', preferred_time: '', reason: '', notes: '' });
      setTimeout(() => setActiveTab('list'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(appt) {
    if (!window.confirm(`Cancel appointment request for ${appt.preferred_date} at ${appt.preferred_time}?`)) return;
    setCancellingId(appt._id);
    try {
      await axios.delete(`${API_URL}/api/appointments/${appt._id}`);
      setAppointments(prev => prev.filter(a => a._id !== appt._id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  }

  // Sort: upcoming first, then past
  const today = new Date().toISOString().split('T')[0];
  const sorted = [...appointments].sort((a, b) => {
    const aUpcoming = a.preferred_date >= today;
    const bUpcoming = b.preferred_date >= today;
    if (aUpcoming && !bUpcoming) return -1;
    if (!aUpcoming && bUpcoming) return 1;
    return a.preferred_date.localeCompare(b.preferred_date);
  });

  const upcoming = sorted.filter(a => a.preferred_date >= today);
  const past = sorted.filter(a => a.preferred_date < today);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <CalendarIcon className="w-16 h-16 text-[#3b82f6]" />
        <h2 className="text-2xl font-bold text-[#1e293b]">Sign in to view appointments</h2>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-3 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition-colors"
        >
          Sign In
        </button>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => { setShowLoginModal(false); fetchData(); }}
          defaultRole="patient"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] z-50" />

      {/* Header */}
      <header className="mt-[3px] bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/personal')}
              className="p-2 rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors text-[#475569]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#1e293b]">My Appointments</h1>
              <p className="text-xs text-[#64748b]">Request and track your clinic appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#f1f5f9] rounded-xl p-1 mb-6">
          {[
            { key: 'list',    label: 'My Appointments', icon: ClipboardListIcon },
            { key: 'request', label: 'Request Appointment', icon: CalendarIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setError(''); setSubmitSuccess(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-white text-[#1e293b] shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
            <WarningIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </div>
        )}

        {/* ---- My Appointments tab ---- */}
        {activeTab === 'list' && (
          <div>
            {loadingAppts ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                <CalendarIcon className="w-12 h-12 text-[#cbd5e1] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1e293b] mb-1">No appointments yet</h3>
                <p className="text-sm text-[#64748b] mb-4">Request an appointment with your doctor to get started.</p>
                <button
                  onClick={() => setActiveTab('request')}
                  className="px-6 py-2.5 bg-[#3b82f6] text-white rounded-lg font-semibold text-sm hover:bg-[#2563eb] transition-colors"
                >
                  Request an Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {upcoming.length > 0 && (
                  <Section title="Upcoming" count={upcoming.length}>
                    {upcoming.map(appt => (
                      <PatientApptCard
                        key={appt._id}
                        appt={appt}
                        cancellingId={cancellingId}
                        onCancel={handleCancel}
                        onRebook={(slot) => openRebookModal(slot, appt)}
                      />
                    ))}
                  </Section>
                )}
                {past.length > 0 && (
                  <Section title="Past" count={past.length} muted>
                    {past.map(appt => (
                      <PatientApptCard
                        key={appt._id}
                        appt={appt}
                        cancellingId={cancellingId}
                        onCancel={handleCancel}
                        onRebook={(slot) => openRebookModal(slot, appt)}
                      />
                    ))}
                  </Section>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---- Request Appointment tab ---- */}
        {activeTab === 'request' && (
          <div className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-6">
            <h2 className="text-lg font-bold text-[#1e293b] mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#3b82f6]" />
              Request an Appointment
            </h2>

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-700 text-sm font-medium">
                  Request submitted! You'll receive an SMS confirmation once your doctor reviews it.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Doctor */}
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1.5">
                  Doctor <span className="text-red-500">*</span>
                </label>
                {loadingAppts ? (
                  <div className="h-11 bg-[#f8fafc] rounded-lg border border-[rgba(15,23,42,0.1)] animate-pulse" />
                ) : clinicians.length === 0 ? (
                  <p className="text-sm text-[#94a3b8]">No doctors available at this time.</p>
                ) : (
                  <select
                    value={form.clinician_id}
                    onChange={e => handleFormChange('clinician_id', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] bg-white"
                  >
                    <option value="">Select a doctor...</option>
                    {clinicians.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#475569] mb-1.5">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.preferred_date}
                    min={today}
                    onChange={e => handleFormChange('preferred_date', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#475569] mb-1.5">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.preferred_time}
                    onChange={e => handleFormChange('preferred_time', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] bg-white"
                  >
                    <option value="">Select a time...</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1.5">
                  Reason for Visit <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={e => handleFormChange('reason', e.target.value)}
                  placeholder="Briefly describe why you'd like to see the doctor..."
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] resize-none"
                />
              </div>

              {/* Optional notes */}
              <div>
                <label className="block text-sm font-semibold text-[#475569] mb-1.5">
                  Additional Notes <span className="text-[#94a3b8] font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => handleFormChange('notes', e.target.value)}
                  placeholder="Any additional information for the doctor..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="flex-1 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[rgba(15,23,42,0.04)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#3b82f6] text-white rounded-lg text-sm font-semibold hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : <CalendarIcon className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* ---- Rebook Confirmation Modal ---- */}
      {rebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up">

            {rebookSuccess ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[#1e293b] mb-1">Request Sent!</h3>
                <p className="text-sm text-[#64748b]">
                  Your appointment request for {rebookModal.slot.date} at {rebookModal.slot.time} has been submitted.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-[#1e293b]">Confirm Appointment</h3>
                    <p className="text-xs text-[#64748b] mt-0.5">Suggested by your doctor</p>
                  </div>
                  <button
                    onClick={() => setRebookModal(null)}
                    className="text-[#94a3b8] hover:text-[#475569] text-2xl leading-none mt-0.5"
                  >×</button>
                </div>

                {/* Appointment details card */}
                <div className="bg-[#f8fafc] border border-[rgba(15,23,42,0.08)] rounded-xl p-4 mb-5 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[rgba(59,130,246,0.1)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Doctor</p>
                      <p className="text-sm font-semibold text-[#1e293b]">{rebookModal.appt.clinician_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[rgba(59,130,246,0.1)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Date & Time</p>
                      <p className="text-sm font-semibold text-[#1e293b]">
                        {new Date(rebookModal.slot.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })} at {rebookModal.slot.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-[rgba(59,130,246,0.1)] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ClipboardListIcon className="w-4 h-4 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wide">Reason</p>
                      <p className="text-sm text-[#475569]">{rebookModal.appt.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-[#475569] mb-1.5">
                    Additional Notes <span className="text-[#94a3b8] font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={rebookNotes}
                    onChange={e => setRebookNotes(e.target.value)}
                    placeholder="Any extra information for the doctor..."
                    rows={3}
                    className="w-full px-3 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setRebookModal(null)}
                    className="flex-1 py-2.5 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[rgba(15,23,42,0.04)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRebookConfirm}
                    disabled={rebookSubmitting}
                    className="flex-1 py-2.5 bg-[#3b82f6] text-white rounded-lg text-sm font-semibold hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {rebookSubmitting
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <CheckCircleIcon className="w-4 h-4" />
                    }
                    {rebookSubmitting ? 'Sending...' : 'Confirm Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, muted, children }) {
  return (
    <div>
      <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${muted ? 'text-[#94a3b8]' : 'text-[#1e293b]'}`}>
        {title}
        <span className={`px-1.5 py-0.5 rounded-full text-xs ${muted ? 'bg-[rgba(15,23,42,0.05)] text-[#94a3b8]' : 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6]'}`}>
          {count}
        </span>
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PatientApptCard({ appt, cancellingId, onCancel, onRebook }) {
  const s = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  const Icon = s.icon;
  const isPast = appt.preferred_date < new Date().toISOString().split('T')[0];

  return (
    <div className={`bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_2px_8px_rgba(15,23,42,0.06)] p-5 ${isPast ? 'opacity-70' : ''}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserIcon className="w-4 h-4 text-[#64748b]" />
            <span className="font-semibold text-[#1e293b] text-sm">{appt.clinician_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <ClockIcon className="w-3.5 h-3.5" />
            {appt.preferred_date} at {appt.preferred_time}
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${s.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          {s.label}
        </span>
      </div>

      <p className="text-sm text-[#475569] mb-3 line-clamp-2">{appt.reason}</p>

      {/* Declined details */}
      {appt.status === 'declined' && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3 space-y-2">
          {appt.declined_reason && (
            <p className="text-xs text-red-700">
              <span className="font-semibold">Reason: </span>{appt.declined_reason}
            </p>
          )}
          {appt.alternative_slots?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-700 mb-1.5">Suggested alternative times:</p>
              <div className="flex flex-wrap gap-2">
                {appt.alternative_slots.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => onRebook(slot)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#3b82f6] text-[#3b82f6] rounded-lg text-xs font-medium hover:bg-[rgba(59,130,246,0.08)] transition-colors"
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {slot.date} at {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accepted confirmation */}
      {appt.status === 'accepted' && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
          <p className="text-xs text-green-700 flex items-center gap-1.5">
            <CheckCircleIcon className="w-4 h-4" />
            Your appointment is confirmed. Please arrive 10 minutes early.
          </p>
        </div>
      )}

      {/* Cancel button (only pending + not past) */}
      {appt.status === 'pending' && !isPast && (
        <button
          onClick={() => onCancel(appt)}
          disabled={cancellingId === appt._id}
          className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
        >
          {cancellingId === appt._id
            ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
            : <XCircleIcon className="w-3.5 h-3.5" />
          }
          Cancel request
        </button>
      )}
    </div>
  );
}
