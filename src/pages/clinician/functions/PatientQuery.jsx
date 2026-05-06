import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { SearchIcon } from "@/components/ui/icons";
import { NavBar, SystemStatus } from "@/components";
import { getPatients, getAssignedPatients, getPatientDetails } from "@/api/patientApi";

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
/* Patient Detail Renderer                                              */
/* ------------------------------------------------------------------ */
function DetailValue({ value }) {
  if (value === null || value === undefined) {
    return <span className="text-slate-300 italic">—</span>;
  }
  if (typeof value === 'boolean') {
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}>
        {value ? 'Yes' : 'No'}
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-300 italic">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map((item, i) => (
          <span key={i} className="text-xs px-2 py-0.5 bg-[#eef2ff] text-[#2C3B8D] rounded-full border border-[#c7d2f8]">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </span>
        ))}
      </div>
    );
  }
  if (typeof value === 'object') {
    return (
      <div className="mt-1 pl-3 border-l-2 border-[#c7d2f8] space-y-1.5">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 min-w-[100px] pt-0.5">
              {k.replace(/_/g, ' ')}
            </span>
            <DetailValue value={v} />
          </div>
        ))}
      </div>
    );
  }
  return <span className="text-[13px] text-slate-700">{String(value)}</span>;
}

function PatientDetailsCard({ details }) {
  const topFields = [
    'name', 'full_name', 'first_name', 'last_name',
    'mrn', 'date_of_birth', 'gender', 'email', 'phone',
  ];

  const entries = Object.entries(details);
  const top = entries.filter(([k]) => topFields.includes(k));
  const rest = entries.filter(([k]) => !topFields.includes(k));

  const info = details.patient_identification;
  const fullName = info?.full_name || info?.name ||
    [info?.first_name, info?.last_name].filter(Boolean).join(' ') || '—';
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="p-5 space-y-5">
      {/* Identity row */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-14 h-14 rounded-full bg-[#e6ecff] border-2 border-[#c7d2f8] flex items-center justify-center text-2xl font-bold text-[#2C3B8D] shrink-0">
          {initial}
        </div>
        <div>
          <div className="text-lg font-semibold text-slate-800">{fullName}</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {details.mrn && (
              <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">MRN</span>
                <span className="text-[11px] font-mono font-medium text-slate-700">{details.mrn}</span>
              </span>
            )}
            {details.date_of_birth && (
              <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">DOB</span>
                <span className="text-[11px] font-medium text-slate-700">{details.date_of_birth}</span>
              </span>
            )}
            {details.gender && (
              <span className="px-2.5 py-0.5 bg-[#eef2ff] text-[#2C3B8D] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#c7d2f8]">
                {details.gender}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* All fields */}
      <div className="space-y-1">
        {[...top.filter(([k]) => !['name','full_name','first_name','last_name','mrn','date_of_birth','gender'].includes(k)), ...rest]
          .map(([key, value]) => (
            <div
              key={key}
              className="flex gap-3 py-2.5 [&+&]:border-t [&+&]:border-slate-50"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 min-w-[120px] pt-0.5 shrink-0">
                {key.replace(/_/g, ' ')}
              </span>
              <div className="flex-1 min-w-0">
                <DetailValue value={value} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */
function PatientQuery() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // const response = await getAssignedPatients();
      const response = await getPatients();
      setPatients(response.data.patients || []);
      setError("");
    } catch (err) {
      setError(t('functions:patientQuery.loadError', 'Failed to load patients. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;
    const results = patients.filter(p =>
      p.first_name?.toLowerCase().includes(term) ||
      p.last_name?.toLowerCase().includes(term) ||
      p.mrn?.toLowerCase().includes(term) ||
      p.name?.toLowerCase().includes(term) ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(term)
    );
    setFilteredPatients(results);
    setHasSearched(true);
    setSelectedPatient(null);
    setPatientDetails(null);
  };

  const handleSelectPatient = async (patient) => {
    try {
      setDetailLoading(true);
      setSelectedPatient(patient);
      setPatientDetails(null);
      const response = await getPatientDetails(patient.id);
      setPatientDetails(response.data.patient_data);
      setError("");
    } catch (err) {
      setError(t('functions:patientQuery.detailsError', 'Failed to load patient details.'));
      setPatientDetails(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Search */}
        <SectionCard>
          <SectionHeader icon={SearchIcon} title={t('functions:patientQuery.searchPatients', 'Search Patients')} />
          <div className="p-5">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setHasSearched(false); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('functions:patientQuery.searchPlaceholder', 'Search by name or MRN…')}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="px-5 py-2.5 bg-[#2C3B8D] hover:bg-[#233070] text-white rounded-xl text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('common:buttons.search', 'Search')}
              </button>
            </div>

            {hasSearched && (
              <p className="mt-2 text-xs text-slate-400">
                {filteredPatients.length > 0
                  ? `${filteredPatients.length} patient${filteredPatients.length !== 1 ? 's' : ''} found`
                  : `No patients match "${searchTerm}"`}
              </p>
            )}
          </div>
        </SectionCard>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-5">
            <div>
              <div className="text-sm font-semibold text-red-700">Error</div>
              <div className="text-xs text-red-600 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Results */}
        {filteredPatients.length > 0 && (
          <SectionCard>
            <SectionHeader
              icon={SearchIcon}
              title={t('functions:patientQuery.searchResults', 'Results')}
              badge={filteredPatients.length}
            />
            <div className="p-3 space-y-1">
              {filteredPatients.map(patient => {
                const isSelected = selectedPatient?.id === patient.id;
                const fullName = patient.full_name || patient.name ||
                  [patient.first_name, patient.last_name].filter(Boolean).join(' ');
                const initial = fullName.charAt(0).toUpperCase();

                return (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-[#2C3B8D] bg-[#eef2ff]'
                        : 'border-transparent hover:border-slate-200 hover:bg-[#f5f7ff]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      isSelected ? 'bg-[#2C3B8D] text-white' : 'bg-[#e6ecff] text-[#2C3B8D]'
                    }`}>
                      {isSelected ? '✓' : initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{fullName}</div>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {patient.mrn && (
                          <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">MRN</span>
                            <span className="text-[11px] font-mono font-medium text-slate-700">{patient.mrn}</span>
                          </span>
                        )}
                        {(patient.date_of_birth || patient.birth_date) && (
                          <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">DOB</span>
                            <span className="text-[11px] font-medium text-slate-700">{patient.date_of_birth || patient.birth_date}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-[#2C3B8D]' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* Patient Details */}
        {selectedPatient && (
          <SectionCard>
            <SectionHeader
              icon={() => (
                <svg className="w-[18px] h-[18px] text-[#2C3B8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              title={t('functions:patientQuery.patientDetails', 'Patient Details')}
            />
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : patientDetails ? (
              <PatientDetailsCard details={patientDetails} />
            ) : null}
          </SectionCard>
        )}

        {/* Empty state */}
        {hasSearched && filteredPatients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#e6ecff] flex items-center justify-center mb-4">
              <SearchIcon className="w-7 h-7 text-[#2C3B8D] opacity-40" />
            </div>
            <div className="text-sm font-medium text-slate-500">
              {t('functions:patientQuery.noPatients', 'No patients found')}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Try a different name or MRN
            </div>
          </div>
        )}

        <SystemStatus />
      </main>
    </div>
  );
}

export default PatientQuery;