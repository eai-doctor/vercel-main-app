import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";

import {
  ConfigPanel,
  MobileConsultationPanel,
  MainLeftPanel,
  MainRightPanel,
  McgillPredictionModal
} from "@/features/consultation/components";

import { useTranscription, useAudioRecorder } from "@/hooks";

import { useAuth } from '@/context/AuthContext';

import { generateConsultationSummary } from '@/services/consultationService';

// 260304 saebyeok
const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
//const API_URL = 'http://localhost:5001';

export default function ConsultationContainer({ onBackToPatientList, selectedPatientInfo }) {
  const location = useLocation();
  const { t } = useTranslation(['clinic', 'common']);
  const { token } = useAuth();
  
  // Configuration panel states (from InitialConsultationUI)
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showMcGillModal, setShowMcGillModal] = useState(false);

  const [language, setLanguage] = useState("English");
  const [visitType, setVisitType] = useState(null);

  // Existing consultation states
  const [patientData, setPatientData] = useState(null);
  const [consulting, setConsulting] = useState(false);
  const [snapshot, setSnapshot] = useState("");
  const [conversationSummary, setConversationSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [nbqList, setNbqList] = useState([]);
  const [differentials, setdifferentials] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const successTimeoutRef = useRef(null);

  // Refs to store latest analysis results (updated every 10s but NOT rendered until user clicks)
  const latestSnapshotRef = useRef("");
  const latestSummaryRef = useRef("");

  // ⚡ HYBRID TRANSCRIPTION: Web Speech API for instant display
  const speechRecognitionRef = useRef(null);
  const [interimTranscript, setInterimTranscript] = useState(""); // Instant display from Web Speech API
  const [transcriptHistory, setTranscriptHistory] = useState(""); // Accumulated Whisper transcripts
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState(false);

  // Model information state
  const [modelInfo, setModelInfo] = useState(null);

  // Email summary states
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // SOAP Note states
  const [soapNote, setSoapNote] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  const [isLoadingSoap, setIsLoadingSoap] = useState(false);
  const [soapNoteTitle, setSoapNoteTitle] = useState("SOAP Note (Insights from the past)");
  const [isConsultationFinished, setIsConsultationFinished] = useState(false);

  // Get patient data from location state or start with empty data
  useEffect(() => {
    if (location.state?.patientData) {
      // console.log("Loading patient data from location state:", location.state.patientData);
      setPatientData(location.state.patientData);
      setShowConfigPanel(false); // Hide config if data already loaded
    } else {
      console.log("No patient data found. Showing configuration panel.");
      setShowConfigPanel(true); // Show config panel if no data
      // Start with empty patient data
      const emptyData = {
        patient_identification: {
          mrn: "",
          full_name: "",
          date_of_birth: "",
          gender: ""
        },
        diagnoses: [],
        medications: [],
        vital_signs: [],
        labs: [],
        imaging: [],
        consultations: [],
        admissions: []
      };
      setPatientData(emptyData);
    }
  }, [location.state]);

  // Timer effect for elapsed time during processing
  useEffect(() => {
    if (isProcessing) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isProcessing]);

  // Cleanup success timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (consulting) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => stopRecording();
  }, [consulting]);
  
  //call hooks
  const { startWebSpeechRecognition, stopWebSpeechRecognition } = useTranscription({
    consulting,
    isWebSpeechSupported,
    setTranscriptHistory,
    setInterimTranscript,
    speechRecognitionRef,
    streamRef 
  });
  const { startRecording, stopRecording, sendRecording } = useAudioRecorder({ 
    t,
    API_URL,
    token,
    consulting,
    setConsulting,
    setTranscriptHistory,
    latestSnapshotRef,
    latestSummaryRef,
    startWebSpeechRecognition,
    mediaRecorderRef,
    streamRef,
    stopWebSpeechRecognition,
    patientData,
    setProcessingStartTime,
    setIsProcessing,
    setProcessingStatus,
    setNbqList,
    setdifferentials,
    setModelInfo,
    setShowSuccess 
  });

  const previousPatientIdRef = useRef(null);
  // Fetch initial SOAP note when patient changes
  useEffect(() => {
    if (patientData) {
      const currentPatientId = patientData.patient_identification?.mrn ||
                               patientData.patient_identification?.patient_id;

      // Only fetch if this is a new patient
      if (currentPatientId && currentPatientId !== previousPatientIdRef.current) {
        fetchSoapNote(patientData);
        previousPatientIdRef.current = currentPatientId;
      }
    }
  }, [patientData]);

  // SOAP note is only generated on page enter (via the patientData useEffect above)
  // No longer auto-triggered after each consultation chunk
  const fetchSoapNote = async (payload) => {
    try {
      setIsLoadingSoap(true);
      const response = await axios.post(`${API_URL}/api/soap`, {
        patient_data: payload
      });
      setSoapNote({
        subjective: response.data?.subjective || "",
        objective: response.data?.objective || "",
        assessment: response.data?.assessment || "",
        plan: response.data?.plan || ""
      });
      // console.log("SOAP note generated successfully");
    } catch (error) {
      console.error("Error fetching SOAP note:", error);
      setSoapNote({
        subjective: "",
        objective: "",
        assessment: "",
        plan: ""
      });
    } finally {
      setIsLoadingSoap(false);
    }
  };

  const generateAISummary = async () => {
    if (!patientData) {
      alert(t('clinic:consultation.noPatientData', 'No patient data available'));
      return;
    }

    try {
      setIsGeneratingSummary(true);

      const data = await generateConsultationSummary(
        patientData.patient_identification,
        {
          conversation_summary: conversationSummary,
          patient_snapshot: snapshot || conversationSummary,
          conversation_history: snapshot,
          new_diagnoses: patientData.diagnoses || [],
          new_medications: patientData.medications || []
        }
      );

      if (data.success) {
        setAiSummary(data.summary);
        // console.log("AI summary generated successfully");
      } else {
        alert(t('clinic:consultation.failedGenerateSummary', 'Failed to generate summary'));
      }

    } catch (error) {
      console.error("Error generating summary:", error);
      alert(t('clinic:consultation.failedGenerateAISummary', { message: error.response?.data?.error || error.message, defaultValue: 'Failed to generate AI summary: {{message}}' }));
      setAiSummary(t('clinic:consultation.errorGeneratingSummaryFallback', 'Error generating summary. Please try again or write your own summary.'));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (!patientData) {
    return (
      <div className="p-8 text-center text-[#64748b]">
        <div className="text-2xl font-semibold mb-4">{t('common:states.loading', 'Loading...')}</div>
        <div className="animate-spin inline-block w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Configuration Panel - Collapsible */}
      {showConfigPanel && 
        <ConfigPanel 
          visitType={visitType}
          setVisitType={setVisitType}
          language={language}
          setLanguage={setLanguage}
          patientData={patientData}
          setPatientData={setPatientData}
          setShowConfigPanel={setShowConfigPanel}
          setModelInfo={setModelInfo}
        />}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-screen-2xl mx-auto">
        {/* Mobile: Consultation Panel First */}
        <MobileConsultationPanel 
          consulting={consulting}
          setConsulting={setConsulting}
          sendRecording={sendRecording}
          isProcessing={isProcessing}
          transcriptHistory={transcriptHistory}
          interimTranscript={interimTranscript}
          processingStatus={processingStatus}
          elapsedTime={elapsedTime}
        />

        {/* Left Panel - Patient Info */}
        <div className="w-full lg:w-2/3 overflow-y-auto space-y-6">
          <MainLeftPanel 
            onBackToPatientList={onBackToPatientList}
            patientData={patientData}
            setPatientData={setPatientData}
            setAiSummary={setAiSummary}
            generateAISummary={generateAISummary}
            setShowConfigPanel={setShowConfigPanel}
            language={language}
            snapshot={snapshot}
            conversationSummary={conversationSummary}
            aiSummary={aiSummary}
            modelInfo={modelInfo}
            isGeneratingSummary={isGeneratingSummary}
          />
        </div>

        {/* Right Panel - AI Consultation (Desktop only) */}
        <div className="hidden lg:block w-full lg:w-1/3 bg-white border-r border-[rgba(15,23,42,0.1)] backdrop-blur-lg p-6 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(15,23,42,0.1)] space-y-6 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] overflow-y-auto">
          <MainRightPanel 
            patientData={patientData}
            consulting={consulting}
            setConsulting={setConsulting}
            transcriptHistory={transcriptHistory}
            interimTranscript={interimTranscript}
            latestSummaryRef={latestSummaryRef}
            conversationSummary={conversationSummary}
            setConversationSummary={setConversationSummary}
            snapshot={snapshot}
            setSnapshot={setSnapshot}
            soapNote={soapNote}
            isLoadingSoap={isLoadingSoap}
            nbqList={nbqList}
            differentials={differentials}
            showSuccess={showSuccess}
            setShowMcGillModal={setShowMcGillModal}
          />
        </div>

        
        {showMcGillModal && 
            <McgillPredictionModal 
                setShowMcGillModal={setShowMcGillModal}
                patientData={patientData}
            />}

      </div>
    </div>
  );
}