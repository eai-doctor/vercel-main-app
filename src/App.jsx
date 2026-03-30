// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LandingPage from "./LandingPage";
import HomePage from "./HomePage";
import PatientHomePage from "./PatientHomePage";
import PatientSelector from "./PatientSelector";
import InitialConsultationUI from "./InitialConsultationUI";
import PrescriptionList from "./PrescriptionList";
import GeneticConsult from "./GeneticConsult";
import FunctionLibraries from "./FunctionLibraries";
import TranscribeDictate from "./TranscribeDictate";
import FollowUps from "./FollowUps";
import AskEboAI from "./AskEboAI";
import PatientQuery from "./PatientQuery";
import PatientPortal from "./PatientPortal";
import EHRbasePatientList from "./EHRbasePatientList";
import PubMedSearch from "./HealthCanadaDrugBank"; // PubMed literature search
import TriageEngine from "./TriageEngine";
import MerckManual from "./MerckManual";
import DrugBank from "./DrugBank";
import OpenEMR from "./OpenEMR";
import MedicalProfile from "./MedicalProfile";
import AdminSettings from "./AdminSettings";
import ConsentSettings from "./ConsentSettings";
import AccountSettings from "./AccountSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AppointmentCalendar from "./AppointmentCalendar";
import PatientAppointments from "./PatientAppointments";

import { ConsultationPage } from "@/pages/consultation";

import {
  Footer
} from "./components";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('states.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('states.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to={user?.role === 'patient' ? '/personal' : '/clinics'} replace />;
  }

  return children;
}

function ClinicianRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('states.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'clinician' && user?.role !== 'admin') {
    return <Navigate to="/personal" replace />;
  }

  return children;
}

function PatientRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const { t } = useTranslation('common');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('states.loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated non-patients (clinicians/admins) to their dashboard
  if (isAuthenticated && user?.role !== 'patient') {
    return <Navigate to="/clinics" replace />;
  }

  return children;
}

function ConsentGate({ children }) {
  const { user } = useAuth();

  if (user?.consents?.privacy_policy?.accepted !== true) {
    return <Navigate to="/consent" replace />;
  }

  return children;
}

function AppContent() {
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [selectedPatientInfo, setSelectedPatientInfo] = useState(null);
  const navigate = useNavigate();

  const handleSelectPatient = (patientData, patientInfo) => {
    setSelectedPatientData(patientData);
    setSelectedPatientInfo(patientInfo);
    navigate('/consultation', { state: { patientData } });
  };

  const handleBackToPatientList = () => {
    setSelectedPatientData(null);
    setSelectedPatientInfo(null);
    navigate('/patients');
  };

  return (
    <Routes>
      {/* Landing page - Portal selection + Login/Register */}
      <Route path="/" element={<LandingPage />} />

      {/* Consent Settings - no ConsentGate to avoid redirect loop */}
      <Route path="/consent" element={<ProtectedRoute><ConsentSettings /></ProtectedRoute>} />

      {/* Account Settings */}
      <Route path="/account" element={<ProtectedRoute><ConsentGate><AccountSettings /></ConsentGate></ProtectedRoute>} />

      {/* Clinics Portal - Main home page for clinics (clinician/admin only) */}
      <Route path="/clinics" element={<ClinicianRoute><ConsentGate><HomePage /></ConsentGate></ClinicianRoute>} />

      {/* Personal Portal - Patient home page (no auth required) */}
      <Route path="/personal" element={<PatientRoute><PatientHomePage /></PatientRoute>} />

      {/* Personal Portal - Health Consultation with AI Chat (no auth required, 5-message gate) */}
      <Route path="/personal-genetic" element={<PatientRoute><PatientPortal /></PatientRoute>} />

      {/* Patient selection screen - for Patient Browse (clinician/admin only) */}
      <Route path="/patients" element={<ClinicianRoute><ConsentGate><PatientSelector onSelectPatient={handleSelectPatient} /></ConsentGate></ClinicianRoute>} />

      {/* Consultation screen with back button - after selecting patient (clinician/admin only) */}
      <Route
        path="/consultation"
        element={
          <ClinicianRoute>
            <ConsentGate>
              <ConsultationPage
                onBackToPatientList={handleBackToPatientList}
                selectedPatientInfo={selectedPatientInfo}
              />
            </ConsentGate>
          </ClinicianRoute>
        }
      />

      {/* Direct consultation - without patient selection (clinician/admin only) */}
      <Route path="/consultation-direct" element={<ClinicianRoute><ConsentGate><InitialConsultationUI /></ConsentGate></ClinicianRoute>} />

      {/* Function Libraries (clinician/admin only) */}
      <Route path="/function-libraries" element={<ClinicianRoute><ConsentGate><FunctionLibraries /></ConsentGate></ClinicianRoute>} />

      {/* Function Library Features (clinician/admin only) */}
      <Route path="/functions/transcribe" element={<ClinicianRoute><ConsentGate><TranscribeDictate /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/followups" element={<ClinicianRoute><ConsentGate><FollowUps /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/eboai" element={<ClinicianRoute><ConsentGate><AskEboAI /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/patient-query" element={<ClinicianRoute><ConsentGate><PatientQuery /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/pubmed" element={<ClinicianRoute><ConsentGate><PubMedSearch /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/triage-engine" element={<ClinicianRoute><ConsentGate><TriageEngine /></ConsentGate></ClinicianRoute>} />
      <Route path="/personal/triage-engine" element={<PatientRoute><ConsentGate><TriageEngine /></ConsentGate></PatientRoute>} />
      <Route path="/functions/merck-manual" element={<ClinicianRoute><ConsentGate><MerckManual /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/drug-bank" element={<ClinicianRoute><ConsentGate><DrugBank /></ConsentGate></ClinicianRoute>} />
      <Route path="/functions/openemr" element={<ClinicianRoute><ConsentGate><OpenEMR /></ConsentGate></ClinicianRoute>} />

      {/* Prescription list (clinician/admin only) */}
      <Route path="/prescriptions" element={<ClinicianRoute><ConsentGate><PrescriptionList /></ConsentGate></ClinicianRoute>} />

      {/* Genetic consult (no auth required, login prompt on upload) */}
      <Route path="/genetic" element={<GeneticConsult />} />

      {/* Medical Profile - Patient self-reported data */}
      <Route path="/medical-profile" element={<ProtectedRoute><ConsentGate><MedicalProfile /></ConsentGate></ProtectedRoute>} />

      {/* Admin Settings */}
      <Route path="/settings" element={<AdminRoute><ConsentGate><AdminSettings /></ConsentGate></AdminRoute>} />

      {/* Appointment Calendar - clinician portal */}
      <Route path="/functions/appointments" element={<ClinicianRoute><ConsentGate><AppointmentCalendar /></ConsentGate></ClinicianRoute>} />

      {/* Patient Appointments - patient portal */}
      <Route path="/personal/appointments" element={<PatientRoute><PatientAppointments /></PatientRoute>} />

      {/* EHRbase Patient Database */}
      <Route path="/ehrbase-patients" element={<ClinicianRoute><ConsentGate><EHRbasePatientList /></ConsentGate></ClinicianRoute>} />

      {/* Privacy Policy */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

function App() {
  console.log("DEV VERSION");
  
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        
        {/* Footer : complimentary for HIPPA and Raw25 */}
        <Footer />
      </AuthProvider>
    </Router>
  );
} 

export default App;
