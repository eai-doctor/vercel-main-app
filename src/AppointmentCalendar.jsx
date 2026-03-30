import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Header from "./components/Header";
import config from "./config";
import {
  CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon,
  UserIcon, WarningIcon,
} from "./components/icons";

const API_URL = config.backendUrl;

const STATUS_STYLES = {
  pending:  { bg: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-800",  badge: "bg-amber-100 text-amber-800"  },
  accepted: { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-800",  badge: "bg-green-100 text-green-800"  },
  declined: { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-800",    badge: "bg-red-100 text-red-800"    },
};

const TIMES = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function pad2(n) { return String(n).padStart(2, '0'); }
function toDateStr(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export default function AppointmentCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Decline modal state
  const [declineModal, setDeclineModal] = useState(null); // appt object or null
  const [declineReason, setDeclineReason] = useState('');
  const [altSlots, setAltSlots] = useState([{ date: '', time: '' }]);
  const [actionLoading, setActionLoading] = useState(null); // appt id

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/appointments`);
      setAppointments(res.data.appointments || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Map date string -> appointments[]
  const byDate = {};
  appointments.forEach(a => {
    if (!byDate[a.preferred_date]) byDate[a.preferred_date] = [];
    byDate[a.preferred_date].push(a);
  });

  const calDays = buildCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const selectedDateStr = selectedDay ? toDateStr(viewYear, viewMonth, selectedDay) : null;
  const dayAppointments = selectedDateStr ? (byDate[selectedDateStr] || []) : [];

  // Count pending across all
  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  async function handleAccept(appt) {
    setActionLoading(appt._id);
    try {
      await axios.put(`${API_URL}/api/appointments/${appt._id}/accept`);
      setAppointments(prev =>
        prev.map(a => a._id === appt._id ? { ...a, status: 'accepted' } : a)
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept appointment');
    } finally {
      setActionLoading(null);
    }
  }

  function openDecline(appt) {
    setDeclineModal(appt);
    setDeclineReason('');
    setAltSlots([{ date: '', time: '' }]);
  }

  async function handleDeclineSubmit() {
    if (!declineModal) return;
    setActionLoading(declineModal._id);
    try {
      const validSlots = altSlots.filter(s => s.date && s.time);
      await axios.put(`${API_URL}/api/appointments/${declineModal._id}/decline`, {
        reason: declineReason,
        alternative_slots: validSlots,
      });
      setAppointments(prev =>
        prev.map(a => a._id === declineModal._id
          ? { ...a, status: 'declined', declined_reason: declineReason, alternative_slots: validSlots }
          : a
        )
      );
      setDeclineModal(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to decline appointment');
    } finally {
      setActionLoading(null);
    }
  }

  function updateAltSlot(idx, field, value) {
    setAltSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  }
  function addAltSlot() {
    if (altSlots.length < 3) setAltSlots(prev => [...prev, { date: '', time: '' }]);
  }
  function removeAltSlot(idx) {
    setAltSlots(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Appointment Calendar"
        subtitle="Manage patient appointment requests"
        showBackButton
        backRoute="/function-libraries"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total', count: appointments.length, color: 'text-[#1e293b]' },
            { label: 'Pending', count: pendingCount, color: 'text-amber-600' },
            { label: 'Confirmed', count: appointments.filter(a => a.status === 'accepted').length, color: 'text-green-600' },
          ].map(({ label, count, color }) => (
            <div key={label} className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-4 text-center">
              <div className={`text-3xl font-bold ${color}`}>{count}</div>
              <div className="text-sm text-[#64748b] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <WarningIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
            <button onClick={fetchAppointments} className="ml-auto text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ---- Calendar ---- */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors"
              >
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-[#1e293b]">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 rounded-lg hover:bg-[rgba(15,23,42,0.04)] transition-colors"
              >
                <svg className="w-5 h-5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-[#94a3b8] py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((day, idx) => {
                if (!day) return <div key={`blank-${idx}`} />;
                const dateStr = toDateStr(viewYear, viewMonth, day);
                const dayAppts = byDate[dateStr] || [];
                const isToday =
                  day === today.getDate() &&
                  viewMonth === today.getMonth() &&
                  viewYear === today.getFullYear();
                const isSelected = selectedDay === day;
                const hasPending = dayAppts.some(a => a.status === 'pending');

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-start pt-1 transition-all text-sm font-medium
                      ${isSelected
                        ? 'bg-[#3b82f6] text-white shadow-md'
                        : isToday
                          ? 'bg-[rgba(59,130,246,0.12)] text-[#3b82f6]'
                          : 'hover:bg-[rgba(15,23,42,0.04)] text-[#1e293b]'
                      }`}
                  >
                    <span>{day}</span>
                    {/* Appointment dots */}
                    {dayAppts.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayAppts.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' :
                              a.status === 'accepted' ? 'bg-green-500' :
                              a.status === 'declined' ? 'bg-red-400' :
                              'bg-amber-400'
                            }`}
                          />
                        ))}
                        {dayAppts.length > 3 && (
                          <span className={`text-[9px] leading-none ${isSelected ? 'text-white' : 'text-[#94a3b8]'}`}>
                            +{dayAppts.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Pending badge */}
                    {hasPending && !isSelected && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-[#64748b]">
              {[
                { color: 'bg-amber-400', label: 'Pending' },
                { color: 'bg-green-500', label: 'Confirmed' },
                { color: 'bg-red-400',   label: 'Declined' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ---- Day detail / list ---- */}
          <div className="lg:col-span-2">
            {selectedDay ? (
              <div className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-6 h-full">
                <h3 className="text-base font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#3b82f6]" />
                  {MONTHS[viewMonth]} {selectedDay}, {viewYear}
                  <span className="ml-auto text-sm text-[#64748b] font-normal">
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                  </span>
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : dayAppointments.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8] text-sm">
                    No appointments on this day
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[60vh]">
                    {dayAppointments
                      .sort((a, b) => a.preferred_time.localeCompare(b.preferred_time))
                      .map(appt => (
                        <AppointmentCard
                          key={appt._id}
                          appt={appt}
                          actionLoading={actionLoading}
                          onAccept={handleAccept}
                          onDecline={openDecline}
                        />
                      ))}
                  </div>
                )}
              </div>
            ) : (
              /* Show all pending when no day selected */
              <div className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.08)] p-6">
                <h3 className="text-base font-bold text-[#1e293b] mb-4 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-amber-500" />
                  Pending Requests
                  {pendingCount > 0 && (
                    <span className="ml-auto bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingCount === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8] text-sm">
                    No pending requests — click a calendar day to view appointments
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[60vh]">
                    {appointments
                      .filter(a => a.status === 'pending')
                      .sort((a, b) => a.preferred_date.localeCompare(b.preferred_date))
                      .map(appt => (
                        <AppointmentCard
                          key={appt._id}
                          appt={appt}
                          actionLoading={actionLoading}
                          onAccept={handleAccept}
                          onDecline={openDecline}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Decline modal */}
      {declineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#1e293b] mb-1">Decline Appointment</h3>
            <p className="text-sm text-[#475569] mb-4">
              {declineModal.patient_name} — {declineModal.preferred_date} at {declineModal.preferred_time}
            </p>

            <label className="block text-sm font-semibold text-[#475569] mb-1">
              Reason (shown to patient)
            </label>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              placeholder="e.g. Not available on this date"
              rows={2}
              className="w-full px-3 py-2 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] mb-4"
            />

            <label className="block text-sm font-semibold text-[#475569] mb-2">
              Suggest alternative time slots (optional, up to 3)
            </label>
            <div className="space-y-2 mb-3">
              {altSlots.map((slot, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={slot.date}
                    onChange={e => updateAltSlot(idx, 'date', e.target.value)}
                    className="flex-1 px-3 py-2 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                  <select
                    value={slot.time}
                    onChange={e => updateAltSlot(idx, 'time', e.target.value)}
                    className="w-32 px-3 py-2 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm focus:outline-none focus:border-[#3b82f6] bg-white"
                  >
                    <option value="">Time</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    onClick={() => removeAltSlot(idx)}
                    className="text-red-400 hover:text-red-600 text-lg leading-none"
                  >×</button>
                </div>
              ))}
            </div>
            {altSlots.some(s => (s.date && !s.time) || (!s.date && s.time)) && (
              <p className="text-xs text-amber-600 mb-2">
                Incomplete slots (missing date or time) will not be sent.
              </p>
            )}
            {altSlots.length < 3 && (
              <button
                type="button"
                onClick={addAltSlot}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium mb-4"
              >
                + Add another slot
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeclineModal(null)}
                className="flex-1 py-2 border border-[rgba(15,23,42,0.15)] rounded-lg text-sm font-semibold text-[#475569] hover:bg-[rgba(15,23,42,0.04)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                disabled={actionLoading === declineModal._id}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === declineModal._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : <XCircleIcon className="w-4 h-4" />}
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appt, actionLoading, onAccept, onDecline }) {
  const s = STATUS_STYLES[appt.status] || STATUS_STYLES.pending;
  const isLoading = actionLoading === appt._id;

  return (
    <div className={`rounded-lg border p-4 ${s.bg} ${s.border}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <UserIcon className="w-4 h-4 text-[#64748b] flex-shrink-0" />
          <span className="font-semibold text-[#1e293b] text-sm truncate">{appt.patient_name}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>
          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#475569] mb-1">
        <ClockIcon className="w-3.5 h-3.5" />
        {appt.preferred_date} at {appt.preferred_time}
      </div>

      <p className="text-xs text-[#475569] line-clamp-2 mb-2">{appt.reason}</p>

      {appt.status === 'declined' && appt.declined_reason && (
        <p className="text-xs text-red-700 italic mb-2">
          Reason: {appt.declined_reason}
        </p>
      )}

      {/* Action buttons for pending */}
      {appt.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(appt)}
            disabled={isLoading}
            className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            {isLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
            Accept
          </button>
          <button
            onClick={() => onDecline(appt)}
            disabled={isLoading}
            className="flex-1 py-1.5 bg-white border border-red-300 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
          >
            <XCircleIcon className="w-3.5 h-3.5" />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
