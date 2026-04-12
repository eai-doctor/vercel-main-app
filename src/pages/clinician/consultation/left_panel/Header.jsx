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
import ChatboxModal from "@/pages/public/ChatboxModal";

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
    const [showChatbox, setShowChatbox] = useState(false);

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

            if (result.status === 200) {
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 w-full">
        {/* 네비게이션 */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/patients")}
              className="cursor-pointer group flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all border border-slate-200 text-sm font-medium"
            >
              <span className="opacity-50 group-hover:-translate-x-0.5 transition-transform">←</span>
              {t('clinic:consultation.patients', 'Patients')}
            </button>
            <button
              onClick={() => navigate("/clinics")}
              className="cursor-pointer flex items-center justify-center w-[34px] h-[34px] bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-all border border-slate-200"
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
          <ProfileDropdown variant="default" />
        </div>

        {/* 환자 정보 */}
        <div className="flex flex-wrap items-center gap-4">

          {/* 아바타 + 이름 */}
          <div className="flex items-center gap-4 flex-[1_1_260px] min-w-0">
            <div className="relative shrink-0">
              <div className="w-16 h-16 bg-[#E6ECFF] rounded-full border-2 border-[#C7D2F8]
                flex items-center justify-center text-2xl font-bold text-[#3C3489]">
                {info?.fullName?.charAt(0) || "P"}
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
            </div>

            <div className="flex flex-col gap-2 min-w-0">
              {/* 이름 + 성별 */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[22px] font-medium text-slate-900 tracking-tight leading-none truncate max-w-[280px]">
                  {info?.fullName}
                </h1>
                <span className="shrink-0 px-2.5 py-0.5 bg-[#EEEDFE] text-[#3C3489] rounded-full
                  text-[11px] font-medium uppercase tracking-wider border border-[#AFA9EC]">
                  {info?.gender || 'N/A'}
                </span>
              </div>

              {/* 정보 칩 */}
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
                    className="flex items-center gap-1.5 bg-slate-50 border border-slate-200
                      rounded-lg px-2.5 py-1">
                    <span className="text-[10px] font-medium uppercase tracking-[0.8px] text-slate-400">
                      {label}
                    </span>
                    <span className={`text-[13px] font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* 모델 태그 */}
              {modelInfo && (
                <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200
                  rounded-md px-2 py-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#AFA9EC] shrink-0" />
                  <span className="text-[11px] text-slate-400">{modelInfo}</span>
                </div>
              )}
            </div>
          </div>

          {/* 구분선 */}
          <div className="self-stretch w-px bg-slate-100 mx-1 hidden sm:block" />

          {/* 액션 버튼 */}
          <div className="flex gap-2 flex-[0_0_auto] flex-row flex-wrap w-full sm:flex-col sm:flex-nowrap sm:w-auto">
            <button
              onClick={handleGeneratePrescription}
              disabled={isGeneratingPrescription}
              className="flex-1 sm:flex-none cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap sm:min-w-[140px]"
            >
              <PillIcon className="w-[15px] h-[15px] shrink-0" />
              Prescription
            </button>

            <button
              onClick={handleOnClickSendSummary}
              disabled={isSendingEmail}
              className="flex-1 sm:flex-none cursor-pointer px-4 py-2 bg-[#7733CF] hover:bg-[#6622BE] text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 whitespace-nowrap sm:min-w-[140px]"
            >
              {isSendingEmail
                ? <div className="w-[15px] h-[15px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <MailIcon className="w-[15px] h-[15px] shrink-0" />}
              Summary
            </button>

            <button
              onClick={() => setShowChatbox(true)}
              className="cursor-pointer flex-1 sm:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-medium text-sm flex items-center justify-center gap-2 border border-slate-200 whitespace-nowrap sm:min-w-[140px] transition-all"
            >
              <AiIcon className="w-[15px] h-[15px] shrink-0" />
              Ask AI
            </button>
          </div>
        </div>

        {/* 모달들은 기존 그대로 유지 */}
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

        <ChatboxModal
          isOpen={showChatbox}
          onClose={() => setShowChatbox(false)}
          patientSummary={snapshot || conversationSummary || ''}
        />
      </div>
    );
}

           