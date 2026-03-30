import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import config from './config';
import ProfileDropdown from './components/ProfileDropdown';
import { ChartIcon, ClipboardIcon } from './components/icons';

/**
 * EHRbase Patient List Component
 * Displays patients from EHRbase sandbox for demo/testing
 */
const EHRbasePatientList = ({ onSelectPatient }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFullRecord, setShowFullRecord] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch patients from backend (which calls EHRbase service)
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.backendUrl}/api/ehrbase/patients`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPatients(data.patients || []);
      } else {
        throw new Error(data.error || t('functions:ehrbase.fetchError', 'Failed to fetch patients'));
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (patient) => {
    try {
      setLoading(true);

      // Fetch detailed patient data
      const response = await fetch(
        `${config.backendUrl}/api/ehrbase/patients/${patient.ehr_id}`,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error(t('functions:ehrbase.detailsError', 'Failed to fetch patient details'));
      }

      const data = await response.json();

      if (data.success) {
        setSelectedPatient(data);
        setShowFullRecord(false);
        if (onSelectPatient) {
          onSelectPatient(data);
        }
      }
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn && p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ehr_id && p.ehr_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-[#1e293b]">
            {t('functions:ehrbase.title')}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{t('common:home', 'Home')}</span>
            </button>
            <ProfileDropdown />
          </div>
        </div>
        <p className="text-[#475569]">
          <ChartIcon className="w-5 h-5 inline text-[#3b82f6]" /> {t('functions:ehrbase.subtitle')} • {patients.length} {t('functions:ehrbase.patientsAvailable', 'patients available')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder={t('functions:ehrbase.searchPlaceholder', 'Search by name, MRN, or EHR ID...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg shadow-sm focus:outline-none focus:border-[#3b82f6]"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <strong>{t('common:error', 'Error')}:</strong> {error}
          <button
            onClick={fetchPatients}
            className="ml-4 text-sm underline hover:no-underline"
          >
            {t('common:retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !selectedPatient && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto"></div>
          <p className="mt-4 text-[#475569]">{t('functions:ehrbase.loading', 'Loading patients from EHRbase...')}</p>
        </div>
      )}

      {/* Patient List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.ehr_id}
              onClick={() => handlePatientClick(patient)}
              className={`
                bg-white rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-4 cursor-pointer
                transition-all duration-300 hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 hover:border-[rgba(59,130,246,0.3)] border border-transparent
                ${selectedPatient && selectedPatient.ehr_id === patient.ehr_id ? 'ring-4 ring-[#3b82f6]' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg text-[#1e293b]">
                    {patient.name || t('functions:ehrbase.unknownPatient', 'Unknown Patient')}
                  </h3>
                  <p className="text-sm text-[#475569]">MRN: {patient.mrn}</p>
                </div>
                <span className="px-2 py-1 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] text-xs rounded-full">
                  openEHR
                </span>
              </div>

              <div className="text-xs text-[#64748b] truncate">
                EHR ID: {patient.ehr_id}
              </div>

              {selectedPatient && selectedPatient.ehr_id === patient.ehr_id && (
                <div className="mt-3 pt-3 border-t border-[rgba(15,23,42,0.1)]">
                  <p className="text-sm text-[#475569] mb-2 flex items-center gap-1">
                    <ClipboardIcon className="w-4 h-4 inline text-[#3b82f6]" /> {t('functions:ehrbase.compositions', 'Compositions')}: {selectedPatient.compositions_count || 0}
                  </p>
                  <button
                    onClick={() => setShowFullRecord(true)}
                    className="w-full bg-[#3b82f6] text-white py-2 rounded-lg hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
                  >
                    {t('functions:ehrbase.viewFullRecord', 'View Full Record')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPatients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)]">
          <p className="text-[#475569] text-lg">
            {searchQuery
              ? t('functions:ehrbase.noSearchResults', 'No patients found matching your search')
              : t('functions:ehrbase.noPatients', 'No patients available')}
          </p>
        </div>
      )}

      {/* Selected Patient Details */}
      {selectedPatient && (
        <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-[0_25px_50px_rgba(15,23,42,0.15)] p-6 max-w-md border-2 border-[#3b82f6]">
          <button
            onClick={() => {
              setSelectedPatient(null);
              setShowFullRecord(false);
            }}
            className="absolute top-2 right-2 text-[#64748b] hover:text-[#475569]"
          >
            ✕
          </button>

          <h3 className="font-bold text-xl mb-4 text-[#1e293b]">
            {t('functions:ehrbase.patientDetails', 'Patient Details')}
          </h3>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">{t('functions:ehrbase.subjectId', 'Subject ID')}:</span>{' '}
              {selectedPatient.subject_id}
            </div>
            <div>
              <span className="font-semibold">EHR ID:</span>{' '}
              <span className="text-xs font-mono">{selectedPatient.ehr_id}</span>
            </div>
            <div>
              <span className="font-semibold">{t('functions:ehrbase.clinicalData', 'Clinical Data')}:</span>{' '}
              {selectedPatient.compositions_count} {t('functions:ehrbase.compositions', 'compositions')}
            </div>
          </div>

          {selectedPatient.compositions && selectedPatient.compositions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">{t('functions:ehrbase.recentCompositions', 'Recent Compositions')}:</h4>
              <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                {selectedPatient.compositions.slice(0, 5).map((comp) => (
                  <li key={comp.id} className="text-[#475569] truncate">
                    • {comp.name || comp.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedPatient && showFullRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-[0_25px_50px_rgba(15,23,42,0.15)] w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowFullRecord(false)}
              className="absolute top-3 right-3 text-[#64748b] hover:text-[#475569]"
              aria-label={t('common:close', 'Close full record')}
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-[#1e293b] mb-4">
              {t('functions:ehrbase.fullRecord', 'Full Record')}
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">{t('functions:ehrbase.subjectId', 'Subject ID')}:</span>{' '}
                {selectedPatient.subject_id}
              </div>
              <div>
                <span className="font-semibold">EHR ID:</span>{' '}
                <span className="font-mono text-xs">{selectedPatient.ehr_id}</span>
              </div>
              <div>
                <span className="font-semibold">{t('functions:ehrbase.compositions', 'Compositions')}:</span>{' '}
                {selectedPatient.compositions_count || 0}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">{t('functions:ehrbase.compositions', 'Compositions')}</h3>
              {selectedPatient.compositions && selectedPatient.compositions.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {selectedPatient.compositions.map((comp) => (
                    <li key={comp.id} className="border border-[rgba(15,23,42,0.1)] rounded-md p-3">
                      <div className="font-medium text-[#1e293b]">
                        {comp.name || comp.type}
                      </div>
                      <div className="text-xs text-[#64748b] mt-1">
                        ID: <span className="font-mono">{comp.id}</span>
                      </div>
                      <div className="text-xs text-[#64748b]">
                        {t('functions:ehrbase.type', 'Type')}: {comp.type || t('common:unknown', 'Unknown')}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#475569]">{t('functions:ehrbase.noCompositions', 'No compositions found.')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EHRbasePatientList;
