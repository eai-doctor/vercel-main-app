import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import Header from "./Header";
import PateintInfo from "./PatientInfo";
import ActiveConditions from "./ActiveConditions";
import Encounters from "./Encounter";
import VitalSigns from "./VitalSigns";
import Immunizations from "./Immunizations";
import InsuranceBilling from "./InsuranceBilling";
import Diagnoises from "./Diagnoises";
import Medications from "./Medications";
import Lab from "./Lab";
import Admissions from "./Admissions";
import Images from "./Images";
import Imaging from "./Imaging";


export default function MainLeftPanel({
  onBackToPatientList,
  patientData,
  setPatientData,
  setAiSummary,
  generateAISummary,
  setShowConfigPanel,
  language,
  snapshot,
  conversationSummary,
  aiSummary,
  modelInfo,
  isGeneratingSummary
}) {
  const { t } = useTranslation(['clinic', 'common']);
  const [editedPatientInfo, setEditedPatientInfo] = useState(null);

  const {
    patient_identification,
    diagnoses,
    medications,
    labs,
    imaging,
    consultations,
    admissions,
    vital_signs,
    vitals,
    immunizations
  } = patientData;


  return(
      <>
        {/* Header */}
        <Header 
          patientData={patientData}
          onBackToPatientList={onBackToPatientList} 
          setShowConfigPanel={setShowConfigPanel}
          generateAISummary={generateAISummary}
          snapshot={snapshot}
          conversationSummary={conversationSummary}
          aiSummary={aiSummary}
          setAiSummary={setAiSummary}
          modelInfo={modelInfo}
          isGeneratingSummary={isGeneratingSummary}
        />

        {/* Model Info Badge(saebyeok : blocked from 030926)*/}
        {/* <ModelInfo /> */}

        {/* Patient Info */}
        <PateintInfo 
          setPatientData={setPatientData}
          language={language}
          patient_identification={patient_identification}
        />

        {/* 3.2 Active Conditions */}
        <ActiveConditions 
          diagnoses={diagnoses}
        />

        {/* 3.3 Encounters (recent + more) - Accordion */}
        <Encounters 
          consultations={consultations}
          admissions={admissions}
        />

        {/* 3.4 Vital Signs (most recent first, show 3 by default) */}
        <VitalSigns
          vital_signs={vital_signs}
          vitals={vitals}
        />

        {/* 3.5 Immunizations – all immunizations sorted by date */}
        <Immunizations 
          immunizations={immunizations}
        />

        {/* 3.6 Insurance / Billing – list items only */}
        <InsuranceBilling 
          insuranceItems = { patientData.insurance || patientData.billing || [] }
        />

        {/* Diagnoses */}
        <Diagnoises 
          diagnoses={diagnoses}
        />

        {/* Medications */}
        <Medications medications={medications} />

        {/* 3.7 Lab Results – most recent first, show 3 by default */}
        <Lab patientData={patientData} setPatientData={setPatientData} />

        {/* 3.8 Images – placeholder section */}
        <Images />

        {/* Imaging */}
        <Imaging imaging={imaging} />

        {/* Admissions */}
        <Admissions admissions={admissions} />
  </>

  )
}