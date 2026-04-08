import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { Search, User, ChevronRight, AlertCircle, ClipboardList, Home } from "lucide-react";

import { Header, NavBar, ProfileDropdown, SystemStatus } from "@/components";
import { UserIcon } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { getAssignedPatients, getPatientDetails } from "@/api/patientApi";

export default function PatientSelector() {
  const { t } = useTranslation(['clinic', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const clinicianId = user?.user_id || user?.id;

  const fetchPatients = useCallback(async () => {
    if (!clinicianId) return;
    try {
      setLoading(true);
      const response = await getAssignedPatients(searchTerm);
      setPatients(response.data.patients || []);
      setError(null);
    } catch (err) {
      setError(t('clinic:patientSelector.loadError'));
    } finally {
      setLoading(false);
    }
  }, [clinicianId, searchTerm]);

  useEffect(() => {
    if (!clinicianId) {
      console.warn("No clinician ID found");
      return;
    }
    fetchPatients();
  }, [clinicianId, fetchPatients]);

  const handleSelectPatient = async (patient) => {
    try {
      setLoading(true);
      const response = await getPatientDetails(patient.id);
      const patientDetails = response.data.patient_data;
      navigate("/consultation", { 
        state: { 
          patientData: patientDetails 
        } 
      });
    } catch (err) {
      alert(`Failed to load patient data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const term = searchTerm.trim().toLowerCase();
    return p.full_name?.toLowerCase().includes(term) || p.mrn?.toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar handleOnClickBack={()=>window.location.replace("/clinics")} />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {t('clinic:patientSelector.title')}
          </h2>
          <p className="text-gray-500">{t('clinic:patientSelector.subtitle')}</p>
        </section>

        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-4 bg-white border-none shadow-md rounded-2xl focus:ring-2 focus:ring-blue-400 transition-all text-lg"
              placeholder={t('clinic:patientSelector.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHasSearched(e.target.value.trim().length > 0);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasSearched ? (
            patients.length > 0 ? (
              patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="cursor-pointer flex items-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left border border-transparent hover:border-blue-200 group"
                >
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg mr-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {/* {patient.first_name[0]}{patient.last_name[0]} */}
                    
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{patient.name}</h4>
                    <p className="text-sm text-gray-500">MRN: {patient.mrn || 'N/A'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                </button>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('clinic:patientSelector.noResults')}</p>
              </div>
            )
          ) : (
            <div className="col-span-full py-20 text-center">
              <ClipboardList className="w-16 h-16 text-blue-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">{t('clinic:patientSelector.startSearching')}</p>
            </div>
          )}
        </div>
      </main>

      {/* System Status - HomePage와 동일하게 유지 */}
      <SystemStatus />
    </div>
  );
}