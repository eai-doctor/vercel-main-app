import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import {
    ProfileDropdown
} from "@/components";

import {
    PillIcon,
    MailIcon,
    SettingsIcon,
    AiIcon,
} from "@/components/ui/icons";

import PrescriptionModal from "../modal/PrescriptionModal";
import SendSummaryModal from "../modal/SendSummaryModal";

import { generatePrescription, generateConsultationSummary } from "@/api/consultationApi";

export default function Header({
    patientData,
    // isSendingEmail,
    // setShowConfigPanel,
    snapshot,
    conversationSummary,
    // aiSummary,
    // setAiSummary,
    modelInfo,
}) {
    const navigate = useNavigate();
    const { t } = useTranslation(['clinic', 'common']);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);
    // const [showChatbox, setShowChatbox] = useState(false);

    const [showSendSummaryModal, setShowSendSummaryModal] = useState(false);
    const [patientEmail, setPatientEmail] = useState('');

    const [generatedPrescription, setGeneratedPrescription] = useState("");
    const [prescriptionId, setPrescriptionId] = useState("");

    const [aiSummary, setAiSummary] = useState("");
    const [clinicalReport, setClinicalReport] = useState("");
    const [isGeneratingSummary, setIsGeneratingSummary] = useState("");
    const [emailResult, setEmailResult] = useState(null);

    const info = patientData?.patient_identification;

    const handleGeneratePrescription = async () => {
        if (!patientData) {
            alert(t('clinic:consultation.noPatientData', 'No patient data available'));
            return;
        }

        try {
            setIsGeneratingPrescription(true);
            setShowPrescriptionModal(true);
            setGeneratedPrescription("");

            const response = await generatePrescription(patientData);
            // const temp = {
            //     "id" : '69d40a9a19c3770942f888d6',
            //     "_model_info": "gemini-2.5-flash",
            //     "generated_at": "2026-04-06T19:23:14.125737",
            //     "prescription" : "insertion test"
            // }

            setPrescriptionId(response.data.id);
            setGeneratedPrescription(response.data.prescription);
            setIsGeneratingPrescription(false);
        } catch (error) {
            // console.error("Error generating prescription:", error);
            setIsGeneratingPrescription(false);
            setShowPrescriptionModal(false);
            alert(t('clinic:consultation.failedGeneratePrescription', { message: error.response?.data?.error || error.message, defaultValue: 'Failed to generate prescription: {{message}}' }));
        }
    };

    const handleOnClostPrescriptionModal = () => {
        setShowPrescriptionModal(false);
        setGeneratedPrescription("");
        setIsGeneratingPrescription(false);
    }

    const generateAISummary = async () => {

        if (!patientData) {
        alert(t('clinic:consultation.noPatientData', 'No patient data available'));
        return;
        }

        try {
            setIsGeneratingSummary(true);

            const result = await generateConsultationSummary(
                patientData.patient_identification,
                {
                conversation_summary: conversationSummary,
                patient_snapshot: snapshot || conversationSummary,
                conversation_history: snapshot,
                new_diagnoses: patientData.diagnoses || [],
                new_medications: patientData.medications || []
                }
            );

            console.log(result);
            
            // const data = {
            //     "clinical_report": "**Patient:** Abdul218 Gusikowski974\n\n**Chief Complaint:** Not specified\n\n**Summary of Consultation:** Not specified\n\n**Diagnoses:**\n*   **Active:**\n    *   Seizure disorder (diagnosed 1980-05-16)\n    *   History of single seizure (situation) (diagnosed 1980-05-16)\n    *   Allergy: Allergy to Penicillin (disorder)\n*   **Resolved:**\n    *   Streptococcal sore throat (disorder) (diagnosed 1977-06-15)\n    *   Viral sinusitis (disorder) (diagnosed 1979-10-11)\n    *   Acute viral pharyngitis (disorder) (diagnosed 1983-08-26)\n\n**Medications:**\n*   **New:** Not specified\n*   **Existing:** Not specified\n\n**Relevant History:**\n*   Patient has a history of active Seizure disorder and a documented Penicillin allergy.\n*   Past medical history includes resolved episodes of Streptococcal sore throat, Viral sinusitis, and Acute viral pharyngitis.",
            //     "email_body": "Dear Abdul218 Gusikowski974,\n\nThank you for your recent visit. We appreciate you taking the time to discuss your health concerns with us.\n\nIt's important to continue monitoring your overall well-being and to follow any general health recommendations we may have discussed. If you have any new symptoms or questions, please do not hesitate to contact our office.\n\nWe are here to support you on your health journey.\n\nSincerely,\nYour Healthcare Team",
            //     "generated_at": "2026-04-07T03:33:09.223376",
            //     "success": true
            // }

            if (result.statusText === "OK") {
                const data = result.data;
                setAiSummary(data.email_body);
                setClinicalReport(data.clinical_report);
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

    const handleOnClickSendSummary = async () => {
        if (!patientData) {
            alert(t('clinic:consultation.noPatientData', 'No patient data available'));
            return;
        }

        // Set patient email from patient data
        const email = patientData.patient_identification?.email;

        if(!email) {
            alert(t('common:errors.unknownEmail'));
            return;
        }
        setPatientEmail(email);

        // Reset states
        setAiSummary('');
        setEmailResult(null);

        // Open modal
        setShowSendSummaryModal(true);

        // Automatically generate AI summary
        await generateAISummary();
    };

    return (
        <div className="bg-[#2C3B8D] rounded-2xl shadow-sm p-6 lg:p-8 mb-8 border border-slate-200 relative overflow-hidden w-full ">

          {/* 상단: 네비게이션 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 ">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/patients")}
                className=" cursor-pointer  group flex items-center space-x-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all border border-slate-200"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform opacity-60">←</span>
                <span className="font-medium text-sm">{t('clinic:consultation.patients', 'Patients')}</span>
              </button>
              <button
                onClick={() => navigate("/clinics")}
                className="cursor-pointer p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-all border border-slate-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
            <ProfileDropdown variant="light" />
          </div>

          {/* Patient info row */}
          <div className="flex flex-wrap items-center gap-y-4">

          {/* Left: Avatar + Identity */}
          <div className="flex items-center gap-5 flex-[1_1_260px] min-w-0">
            {/* Avatar with status dot */}
            <div className="relative shrink-0">
              <div className="w-[72px] h-[72px] bg-[#e6ecff] rounded-full border-2 border-[#c7d2f8]
                flex items-center justify-center text-[32px] font-bold text-[#2C3B8D] shadow-sm">
                {info?.fullName?.charAt(0) || "P"}
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>

            {/* Name + chips */}
            <div className="space-y-2.5 min-w-0">

              {/* Name + gender badge */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] lg:text-[30px] font-extrabold text-white tracking-tight leading-none truncate max-w-[320px]">
                  {info?.fullName}
                </h1>
                <span className="shrink-0 px-3 py-1 bg-[#eef2ff] text-[#2C3B8D] rounded-full
                  text-[11px] font-bold uppercase tracking-widest border border-[#c7d2f8]">
                  {info?.gender || 'N/A'}
                </span>
              </div>

              {/* Info chips — larger text */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: 'MRN', value: info?.mrn || '---', mono: true },
                  { label: 'DOB', value: info?.date_of_birth || '---' },
                  {
                    label: 'Age',
                    value: info?.date_of_birth
                      ? `${new Date().getFullYear() - new Date(info.date_of_birth).getFullYear()} yrs`
                      : '---',
                  },
                ].map(({ label, value, mono }) => (
                  <div key={label}
                    className="flex items-center gap-2 bg-white/15 border border-white/25
                      rounded-[10px] px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[1.2px] text-white/60">
                      {label}
                    </span>
                    <span className={`text-[14px] font-bold text-white ${mono ? 'font-mono' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Model tag */}
              {modelInfo && (
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20
                  rounded-md px-2.5 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0" />
                  <span className="text-[11px] text-white/50">{modelInfo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="self-stretch w-px bg-slate-200 mx-5 hidden sm:block" />

          {/* Action buttons */}
          <div className="
            flex gap-2 flex-[0_0_auto]
            flex-row flex-wrap w-full
            sm:flex-col sm:flex-nowrap sm:w-auto
          ">
            <button
              onClick={handleGeneratePrescription}
              disabled={isGeneratingPrescription}
              className="flex-1 sm:flex-none cursor-pointer px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm whitespace-nowrap sm:min-w-[148px]"
            >
              <PillIcon className="w-4 h-4 text-emerald-200 shrink-0" />
              Prescription
            </button>

            <button
              onClick={handleOnClickSendSummary}
              disabled={isSendingEmail}
              className="flex-1 sm:flex-none cursor-pointer px-4 py-2.5 bg-[#7733cf] hover:bg-[#7733cf8c] text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm whitespace-nowrap sm:min-w-[148px]"
            >
              {isSendingEmail
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <MailIcon className="w-4 h-4 shrink-0" />}
              Summary
            </button>

            <button
              disabled
              className="flex-1 sm:flex-none px-4 py-2.5 text-slate-300 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-slate-200 whitespace-nowrap cursor-not-allowed sm:min-w-[148px]"
            >
              <AiIcon className="w-4 h-4 shrink-0" />
              Ask AI
            </button>
          </div>
        </div>

  {showPrescriptionModal && (
    <PrescriptionModal
      prescription={generatedPrescription}
      prescriptionId={prescriptionId}
      onClose={handleOnClostPrescriptionModal}
      isGenerating={isGeneratingPrescription}
      patientInfo={patientData}
    />
  )}

  {showSendSummaryModal &&
    <SendSummaryModal
      patientData={patientData}
      patientEmail={patientEmail}
      setPatientEmail={setPatientEmail}
      aiSummary={aiSummary}
      clinicalReport={clinicalReport}
      setAiSummary={setAiSummary}
      emailResult={emailResult}
      setEmailResult={setEmailResult}
      modelInfo={modelInfo}
      generateAISummary={generateAISummary}
      isGeneratingSummary={isGeneratingSummary}
      setShowSendSummaryModal={setShowSendSummaryModal}
    />}
</div>
    );
}

            {/* Chatbox Modal */}
            {/* <ChatboxModal
                isOpen={showChatbox}
                onClose={() => setShowChatbox(false)}
                patientSummary={snapshot || conversationSummary || ''}
            /> */}