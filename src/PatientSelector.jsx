/*
  260305 Saebyeok
  This page is only accessible to clinicians.
  It allows clinicians to search for and select a patient from their assigned patient list.
*/
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import config from "./config";
import ProfileDropdown from "./components/ProfileDropdown";
import { UsersIcon, SearchIcon, ClipboardIcon, WarningIcon } from "./components/icons";
import { useAuth } from "@/context/AuthContext";

const API_URL = config.backendUrl;

export default function PatientSelector({ onSelectPatient }) {
  const { t } = useTranslation(['clinic', 'common']);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const { user } = useAuth();
  const clinicianId = user?.user_id || user?.id;
  
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    // check if clinician ID is available
    if(!clinicianId){
      window.alert("No clinician ID found. Please log in again.");
      navigate(-1);
      return;  
    }else{
      try{
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/assigned_patients/${clinicianId}`);
        setPatients(response.data.patients || []);
        setError(null);
      }catch(err){
        console.error("Error fetching patients:", err);
        setError(t('clinic:patientSelector.loadError'));
      }finally{
        setLoading(false);
      }
    }

  };



  const handleSelectPatient = async (patient) => {
    try {
      setSelectedPatient(patient);
      setLoading(true);

      // Fetch full patient data
      const response = await axios.get(`${API_URL}/api/patients/${patient.id}`);
      const patientData = response.data.patient_data;
      
      // Pass patient data to parent component
      onSelectPatient(patientData, patient);
    } catch (err) {
      console.error("Error loading patient data:", err);
      alert(`Failed to load patient data: ${err.message}`);
      setSelectedPatient(null);
    } finally {
      setLoading(false);
    }
  };

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
      setSearchError(t('clinic:patientSelector.searchPrompt'));
      setHasSearched(false);
      return;
    }
    setSearchError("");
    setHasSearched(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-8 max-w-md text-center">
          <div className="flex justify-center mb-4"><WarningIcon className="w-5 h-5 text-red-500" /></div>
          <div className="text-xl font-bold text-red-700 mb-2">{t('common:errors.error')}</div>
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchPatients}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            {t('common:buttons.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[rgba(59,130,246,0.08)] backdrop-blur-sm rounded-xl flex items-center justify-center">
                <UsersIcon className="w-12 h-12 text-[#3b82f6]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {t('clinic:patientSelector.title')}
              </h1>
              <p className="text-blue-100 text-sm mt-1">{t('clinic:patientSelector.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Home Button */}
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold transition-all flex items-center space-x-2 border border-white/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{t('common:header.home')}</span>
            </button>
            <ProfileDropdown variant="dark" />
          </div>
        </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-3 md:space-y-0">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-[#64748b]" />
              </div>
              <input
                type="text"
                placeholder={t('clinic:patientSelector.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHasSearched(false);
                  if (searchError && e.target.value.trim()) {
                    setSearchError("");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-[rgba(15,23,42,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white font-semibold rounded-xl shadow hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition"
            >
              {t('common:buttons.search')}
            </button>
          </div>
          {searchError ? (
            <div className="mt-3 text-sm text-red-600 font-medium">{searchError}</div>
          ) : (
            <div className="mt-3 text-sm text-[#475569]">
              {hasSearched
                ? t('clinic:patientSelector.foundPatients', { count: filteredPatients.length })
                : t('clinic:patientSelector.enterSearchPrompt')}
            </div>
          )}
        </div>

        {/* Patient List */}
        {hasSearched ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_25px_50px_rgba(15,23,42,0.15)] transition-all duration-300 p-6 text-left transform hover:-translate-y-1 border-2 border-transparent hover:border-[rgba(59,130,246,0.4)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-[#1e293b]">
                        {patient.first_name} {patient.last_name}
                      </div>
                      {patient.mrn && (
                        <div className="text-sm text-[#64748b]">
                          MRN: {patient.mrn}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-[#475569]">
                  {patient.gender && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[#64748b]">{t('clinic:patientSelector.gender')}:</span>
                      <span className="font-medium capitalize">{patient.gender}</span>
                    </div>
                  )}
                  {patient.birth_date && (
                    <div className="flex items-center space-x-2">
                      <span className="text-[#64748b]">{t('clinic:patientSelector.dob')}:</span>
                      <span className="font-medium">{new Date(patient.birth_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[rgba(15,23,42,0.1)]">
                  <div className="text-[#3b82f6] font-semibold text-sm flex items-center justify-between">
                    <span>{t('clinic:patientSelector.viewRecords')}</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-12 text-center">
            <div className="flex justify-center mb-4"><ClipboardIcon className="w-16 h-16 text-[#3b82f6]" /></div>
            <div className="text-2xl font-bold text-[#475569] mb-2">{t('clinic:patientSelector.searchHint')}</div>
            <div className="text-2xl font-bold text-[#475569] mb-2">{t('clinic:patientSelector.samplePatientsHint')}</div>
            <div className="text-[#475569]">
              {t('clinic:patientSelector.startSearching')}
            </div>
          </div>
        )}

        {hasSearched && filteredPatients.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-12 text-center">
            <div className="flex justify-center mb-4"><SearchIcon className="w-16 h-16 text-[#64748b]" /></div>
            <div className="text-2xl font-bold text-[#475569] mb-2">{t('clinic:patientSelector.noResults')}</div>
            <div className="text-[#475569]">
              {t('clinic:patientSelector.noMatch', { term: searchTerm.trim() })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}