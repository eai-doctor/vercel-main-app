import React, { useEffect, useState, useRef, useCallback  } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import MainLeftPanel from "./left_panel";
import MainRightPanel from "./right_panel/MainRightPanel";
import McgillPredictionModal from "./modal/McgillPredictionModal";

import { blockCopy } from "@/utils/privacy";
import { useConsultation, useLanguage } from "@/hooks";
import { TAB_KEYS } from "@/constants/fhir";
import { fhirRecordsToPatientData } from "@/utils/fhir";

import { generateConsultationSummary } from "@/api/consultationApi";
import consultationApi from "@/api/consultationApi";
import medicalRecordApi from "@/api/medicalRecordApi";
import { getPatientDetails } from "@/api/patientApi";

export default function Consultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation(['clinic', 'common']);

  const cacheRef = useRef({});
  const [recordsByTab, setRecordsByTab] = useState({});

  // Refs to store latest analysis results (updated every 10s but NOT rendered until user clicks)
  const latestSnapshotRef = useRef("");
  const latestSummaryRef = useRef("");

  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showMcGillModal, setShowMcGillModal] = useState(false);
  const [activeTab, setActiveTab] = useState("patient")

  const [patientData, setPatientData] = useState(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || "");

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
  const [selectingId, setSelectingId] = useState(null);
  const [nbqList, setNbqList] = useState([]);
  const [differentials, setDifferentials] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [newFindings, setNewFindings] = useState(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  const { startConsultation, stopConsultation, isCaptionAvailable  } = useConsultation({
    t,
    patientData,
    transcriptHistory,
    setTranscriptHistory,
    setInterimTranscript,
    setIsProcessing,
    setProcessingStartTime,
    setProcessingStatus,
    setNbqList,
    setDifferentials,
    setModelInfo,
    setNewFindings,
    setShowSuccess,
    setConsulting,
    lang : currentLanguage.code });

  // Get patient data from location state or start with empty data
useEffect(() => {
  const fetchFHIRRecords = async (userFhirMrn) => {
    if (!userFhirMrn) return null;

    const cacheKey = `${userFhirMrn}-FHIR_ALL`;
    let byTab;

    if (cacheRef.current[cacheKey]) {
      byTab = cacheRef.current[cacheKey];
    } else {
      const res = await medicalRecordApi.getFHIRRecordsByMrn(userFhirMrn);
      const records = res?.data?.records || {};

      // byTab = {};
      // TAB_KEYS.forEach((tab) => {
      //   const list = Array.isArray(records[tab]) ? records[tab] : [];
      //   byTab[tab] = list;
      // });

      cacheRef.current[cacheKey] = records;
      byTab = records;
    }

    setRecordsByTab(byTab);
    return byTab;
  };

  const initializePatientData = async () => {
    if (location.state?.patientData) {
      setPatientData(location.state.patientData);
      setShowConfigPanel(false);

      if (location.state.searchTerm !== undefined) {
        setSearchTerm(location.state.searchTerm);
      }

      if (location.state.selectingId !== undefined) {
        setSelectingId(location.state.selectingId);
      }


      const mrn =
        location.state.patientData.patient_identification?.mrn || null;

      if (mrn) {
        const fhirRecords = await fetchFHIRRecords(mrn);
        console.log("[original] fhirRecords : ", fhirRecords);

        if (fhirRecords) {
          const testPatientData = fhirRecordsToPatientData(fhirRecords);
          console.log("[original] fhirRecordsToPatientData : ", testPatientData);

          setPatientData(testPatientData);
        }
      }
    } else {
      console.warn("No patient data found. Security redirect triggered.");

      alert(
        "Security Alert: Patient data session has expired or is missing. " +
          "For safety reasons, you must re-select the patient from the list."
      );

      navigate("/patients", { replace: true });
    }
  };

  initializePatientData();
}, [location.state, navigate]);

  // Voice action start and stop
  useEffect(() => {
    if (consulting) startConsultation();
    else stopConsultation();
    return () => stopConsultation();
  }, [consulting]);

  const previousPatientIdRef = useRef(null);

  const handleSaveToRecord = async () => {
    if (!newFindings || !patientData) return;
    const mrn = patientData.patient_identification?.mrn;
    if (!mrn) return;
    try {
      setIsSavingRecord(true);
      await consultationApi.saveConsultationToRecord(mrn, newFindings);
      setNewFindings(null);
      // Refresh patient data in the left panel so new entries are visible immediately
      const res = await getPatientDetails(mrn);
      if (res.data?.patient_data) {
        const freshData = res.data.patient_data;
        setPatientData(freshData);
        // Sync browser history so F5 reloads fresh data instead of the pre-save snapshot
        navigate(location.pathname, {
          replace: true,
          state: { ...location.state, patientData: freshData },
        });
      }
    } catch (err) {
      console.error("Failed to save to record:", err);
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleUpdateSoap = async () => {
    if (!patientData || !transcriptHistory) return;
    const enrichedPatientData = {
      ...patientData,
      consultation: {
        chief_complaint: differentials[0]?.name || "",
        transcript: transcriptHistory,
        differential_diagnosis: differentials,
      }
    };
    try {
      setIsLoadingSoap(true);
      const response = await consultationApi.getSoap(enrichedPatientData, true);
      setSoapNote({
        subjective: response.data?.subjective || "",
        objective: response.data?.objective || "",
        assessment: response.data?.assessment || "",
        plan: response.data?.plan || ""
      });
    } catch (error) {
      console.error("Error updating SOAP note:", error);
    } finally {
      setIsLoadingSoap(false);
    }
  };

  const handleBackToPatientList = () => {
  navigate("/patients", { state: { searchTerm } });
};

  const fetchSoapNote = async (payload) => {
    try {
      setIsLoadingSoap(true);
      const response = await consultationApi.getSoap(payload);
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


  return (
  <div className="min-h-screen bg-white" onCopy={blockCopy}>
    <div className="lg:hidden flex border-b border-gray-200 sticky top-0 bg-white z-10">
      <button
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeTab === "patient"
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab("patient")}
      >
        Patient Information
      </button>
      <button
        className={`flex-1 py-3 text-sm font-medium transition-colors ${
          activeTab === "ai"
            ? "border-b-2 border-blue-500 text-blue-600"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab("ai")}
      >
        AI Consultation
      </button>
    </div>

    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-screen-2xl mx-auto">
        <div className={`w-full lg:w-2/3 overflow-y-auto space-y-6 
            ${activeTab !== "patient" ? "hidden lg:block" : ""}`}>
          <MainLeftPanel 
            handleBackToPatientList={handleBackToPatientList}
            patientData={patientData}
            setPatientData={setPatientData}
            // setAiSummary={setAiSummary}
            // setShowConfigPanel={setShowConfigPanel}
            // language={language}
            snapshot={snapshot}
            conversationSummary={conversationSummary}
            // aiSummary={aiSummary}
            modelInfo={modelInfo}
            selectingId={selectingId}
          />
        </div>

        {/* Right Panel - AI Consultation (Desktop only) */}
        <div className={`w-full lg:w-1/3 bg-white border-r border-[rgba(15,23,42,0.1)] 
            backdrop-blur-lg p-6 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] 
            border border-[rgba(15,23,42,0.1)] space-y-6 lg:sticky lg:top-4 
            lg:h-[calc(100vh-2rem)] overflow-y-auto
            ${activeTab !== "ai" ? "hidden lg:block" : ""}`}>
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
            onUpdateSoap={handleUpdateSoap}
            hasConsultationData={transcriptHistory.length > 0}
            newFindings={newFindings}
            onSaveToRecord={handleSaveToRecord}
            isSavingRecord={isSavingRecord}
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