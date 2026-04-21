import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import Header from "./Header";
import PateintInfo from "./PatientInfo";
import ActiveConditions from "./ActiveConditions";
import Encounters from "./Encounters";
import VitalSigns from "./VitalSigns";
import Immunizations from "./Immunizations";
// import InsuranceBilling from "./InsuranceBilling";
import Diagnoises from "./Diagnoises";
import Medications from "./Medications";
import Lab from "./Lab";
// import Admissions from "./Admissions";
// import Images from "./Images";
import Imaging from "./Imaging";

// {
//   onBackToPatientList,
//   patientData,
//   setPatientData,
//   setAiSummary,
//   ,
//   setShowConfigPanel,
//   language,

//   aiSummary,

//   isGeneratingSummary
// }
export default function MainLeftPanel({
    handleBackToPatientList,
    patientData,
    setPatientData,
    modelInfo,
    snapshot,
    conversationSummary,
}) {
  const { t } = useTranslation(['clinic', 'common']);
  const [editedPatientInfo, setEditedPatientInfo] = useState(null);

  if (!patientData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const patient_identification = patientData.patient_identification;
  const diagnoses = patientData.diagnoses;
  const consultations = patientData.consultations;
  const admissions = patientData.admissions;
  const vital_signs = patientData.vital_signs;
  const immunizations = patientData.immunizations;
  const medications = patientData.medications;
  const labs = patientData.labs;
  const imaging = patientData.imaging;

  return(
      <>
        {/* Header */}
        <Header 
          patientData={patientData}
          handleBackToPatientList={handleBackToPatientList} 
        //   setShowConfigPanel={setShowConfigPanel}
          snapshot={snapshot}
          conversationSummary={conversationSummary}
        //   aiSummary={aiSummary}
        //   setAiSummary={setAiSummary}
          modelInfo={modelInfo}
        />

        {/* 3.1 Patient Info */}
        <PateintInfo 
          setPatientData={setPatientData}
          patient_identification={patient_identification}
        />

        {/* 3.2 Active Conditions */}
        <ActiveConditions 
          diagnoses={diagnoses}
        />

        {/* 3.3 Encounters (recent + more) - Accordion */}
        <Encounters 
          consultations ={consultations}
          admissions ={admissions}
        />

        {/* 3.4 Vital Signs (most recent first, show 3 by default) */}
        <VitalSigns
          vital_signs={vital_signs}
        />

        {/* 3.5 Immunizations – all immunizations sorted by date */}
        <Immunizations 
          immunizations={immunizations}
        />

        {/* 3.6 Insurance / Billing – list items only */}
        {/* 040826 saebyeok blocked - delayed function */}
        {/* <InsuranceBilling 
          insuranceItems = { patientData.insurance || patientData.billing || [] }
        /> */}

        {/* Diagnoses */}
        <Diagnoises 
          diagnoses={diagnoses}
        />
        
        {/* Medications */}
        <Medications medications={medications} />

        {/* 3.9 Lab Results – most recent first, show 3 by default */}
        <Lab labs={labs} patientId={patient_identification.patient_id} setPatientData={setPatientData} />

        {/* 3.10 Images – placeholder section */}
        {/* 040826 saebyeok blocked - delayed function */}
        {/* <Images /> */}

        {/* Imaging */}
        <Imaging imaging={imaging} />


  </>

  )
}