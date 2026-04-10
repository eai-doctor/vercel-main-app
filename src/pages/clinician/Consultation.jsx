import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import MainLeftPanel from "./consultation/left_panel/MainLeftPanel";
import MainRightPanel from "./consultation/right_panel/MainRightPanel";
import McgillPredictionModal from "./consultation/modal/McgillPredictionModal";

import { blockCopy } from "@/utils/privacy";
import { useConsultation, useLanguage } from "@/hooks";

import { generateConsultationSummary } from "@/api/consultationApi";

export default function ConsultationContainer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(['clinic', 'common']);

  // Refs to store latest analysis results (updated every 10s but NOT rendered until user clicks)
  const latestSnapshotRef = useRef("");
  const latestSummaryRef = useRef("");

  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showMcGillModal, setShowMcGillModal] = useState(false)

  const [patientData, setPatientData] = useState(null);
  const [snapshot, setSnapshot] = useState("");
  const [conversationSummary, setConversationSummary] = useState("");
  const [isLoadingSoap, setIsLoadingSoap] = useState(false);
  const [soapNote, setSoapNote] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });

  // audio related variables
  const [consulting, setConsulting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState(""); // Instant display from Web Speech API
  const [transcriptHistory, setTranscriptHistory] = useState(""); // Accumulated Whisper transcripts
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStartTime, setProcessingStartTime] = useState(null);
  const [processingStatus, setProcessingStatus] = useState("");
  const [nbqList, setNbqList] = useState([]);
  const [differentials, setDifferentials] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);

  const { startConsultation, stopConsultation, isCaptionAvailable  } = useConsultation({ 
    t,
    patientData,
    setTranscriptHistory,
    setInterimTranscript,
    setIsProcessing,
    setProcessingStartTime,
    setProcessingStatus,
    setNbqList,
    setDifferentials,
    setModelInfo,
    setShowSuccess,
    setConsulting,
    lang : currentLanguage.code });

  // Get patient data from location state or start with empty data
  useEffect(() => {
        if (location.state?.patientData) {
          setPatientData(location.state.patientData);
          setShowConfigPanel(false);
        } else {
        console.warn("No patient data found. Security redirect triggered.");
        
        alert(
            "Security Alert: Patient data session has expired or is missing. " +
            "For safety reasons, you must re-select the patient from the list."
        );

        // 환자 리스트 페이지로 강제 이동
        navigate("/patients", { replace: true });
      }
  }, [location.state, navigate]);

  // Voice action start and stop
  useEffect(() => {
    if (consulting) startConsultation();
    else stopConsultation();
    return () => stopConsultation();
  }, [consulting]);

  return (
  <div className="min-h-screen bg-white" onCopy={blockCopy}>
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-screen-2xl mx-auto">
        <div className="w-full lg:w-2/3 overflow-y-auto space-y-6">
          <MainLeftPanel 
            // onBackToPatientList={onBackToPatientList}
            patientData={patientData}
            etPatientData={setPatientData}
            // setAiSummary={setAiSummary}
            // setShowConfigPanel={setShowConfigPanel}
            // language={language}
            snapshot={snapshot}
            conversationSummary={conversationSummary}
            // aiSummary={aiSummary}
            modelInfo={modelInfo}
          />
        </div>

        {/* Right Panel - AI Consultation (Desktop only) */}
        <div className="hidden lg:block w-full lg:w-1/3 bg-white border-r border-[rgba(15,23,42,0.1)] backdrop-blur-lg p-6 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(15,23,42,0.1)] space-y-6 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] overflow-y-auto">
          <MainRightPanel 
            // patientData={patientData}
            consulting={consulting}
            setConsulting={setConsulting}
            showSuccess={showSuccess}
            transcriptHistory={transcriptHistory}
            interimTranscript={interimTranscript}
            isCaptionAvailable={isCaptionAvailable}
            latestSummaryRef={latestSummaryRef}
            conversationSummary={conversationSummary}
            setConversationSummary={setConversationSummary}
            // snapshot={snapshot}
            // setSnapshot={setSnapshot}
            soapNote={soapNote}
            isLoadingSoap={isLoadingSoap}
            nbqList={nbqList}
            differentials={differentials}
            setShowMcGillModal={setShowMcGillModal}
          />
        </div>

        {showMcGillModal && 
            <McgillPredictionModal 
                setShowMcGillModal={setShowMcGillModal}
                patientData={patientData}
            />}
    </div>
  </div>);

}