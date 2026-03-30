import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "./config";
import Header from "./components/Header";
import { SearchIcon } from "./components/icons";

function PatientQuery() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = config.backendUrl;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/patients`);
      setPatients(response.data.patients || []);
      setError("");
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(t('functions:patientQuery.loadError', 'Failed to load patients. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = patients.filter(
      (p) =>
        p.first_name?.toLowerCase().includes(term) ||
        p.last_name?.toLowerCase().includes(term) ||
        p.mrn?.toLowerCase().includes(term) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(term)
    );
    setFilteredPatients(results);
  };

  const handleSelectPatient = async (patient) => {
    try {
      setLoading(true);
      setSelectedPatient(patient);
      const response = await axios.get(`${API_URL}/api/patients/${patient.id}`);
      setPatientDetails(response.data.patient_data);
      setError("");
    } catch (err) {
      console.error("Error loading patient details:", err);
      setError(t('functions:patientQuery.detailsError', 'Failed to load patient details.'));
      setPatientDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:patientQuery.title')}
        subtitle={t('functions:patientQuery.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-4">{t('functions:patientQuery.searchPatients', 'Search Patients')}</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('functions:patientQuery.searchPlaceholder')}
              className="flex-1 border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg font-semibold hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300"
            >
              {t('common:buttons.search')}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {filteredPatients.length > 0 && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6 mb-6">
            <h3 className="text-xl font-bold text-[#1e293b] mb-4">
              {t('functions:patientQuery.searchResults')} ({filteredPatients.length})
            </h3>
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedPatient?.id === patient.id
                      ? "border-[#3b82f6] bg-[rgba(59,130,246,0.08)]"
                      : "border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] hover:bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#1e293b]">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-sm text-[#475569]">MRN: {patient.mrn}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#3b82f6]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Patient Details */}
        {patientDetails && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6">
            <h3 className="text-xl font-bold text-[#1e293b] mb-4">{t('functions:patientQuery.patientDetails')}</h3>
            <div className="bg-[#f8fafc] rounded-lg p-4 border border-[rgba(15,23,42,0.1)]">
              <pre className="whitespace-pre-wrap text-sm text-[#1e293b] font-mono overflow-x-auto">
                {JSON.stringify(patientDetails, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPatients.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="mb-4"><SearchIcon className="w-16 h-16 text-[#64748b] mx-auto" /></div>
            <p className="text-[#475569]">{t('functions:patientQuery.noPatients')} "{searchTerm}"</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default PatientQuery;