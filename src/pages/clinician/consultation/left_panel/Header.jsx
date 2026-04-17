import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Plus, X } from "lucide-react";

import { ProfileDropdown } from "@/components";
import { PillIcon, MailIcon, AiIcon } from "@/components/ui/icons";

import PrescriptionModal from "../modal/PrescriptionModal";
import SendSummaryModal from "../modal/SendSummaryModal";
import ChatboxModal from "@/pages/public/ChatboxModal";

import { generatePrescription, generateConsultationSummary } from "@/api/consultationApi";

export default function Header({
  patientData,
  handleBackToPatientList,
  snapshot,
  conversationSummary,
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
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  // FAB 열림 상태 (모바일 전용)
  const [fabOpen, setFabOpen] = useState(false);

  // ── 핸들러들 (기존 동일) ──────────────────────────────────
  const handleGeneratePrescription = async () => {
    if (!patientData) { alert(t('clinic:consultation.noPatientData')); return; }
    try {
      setIsGeneratingPrescription(true);
      setShowPrescriptionModal(true);
      setGeneratedPrescription("");
      const response = await generatePrescription(patientData);
      setPrescriptionId(response.data.id);
      setGeneratedPrescription(response.data.prescription);
    } catch (error) {
      setShowPrescriptionModal(false);
      alert(t('clinic:consultation.failedGeneratePrescription', { message: error.response?.data?.error || error.message, defaultValue: 'Failed to generate prescription: {{message}}' }));
    } finally {
      setIsGeneratingPrescription(false);
    }
  };

  const handleOnClostPrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setGeneratedPrescription("");
    setIsGeneratingPrescription(false);
  };

  const generateAISummary = async () => {
    if (!patientData) { alert(t('clinic:consultation.noPatientData')); return; }
    try {
      setIsGeneratingSummary(true);
      const result = await generateConsultationSummary(
        patientData.patient_identification,
        {
          conversation_summary: conversationSummary,
          patient_snapshot: snapshot || conversationSummary,
          conversation_history: snapshot,
          new_diagnoses: patientData.diagnoses || [],
          new_medications: patientData.medications || [],
        }
      );
      if (result.status === 200) {
        setAiSummary(result.data.email_body);
        setClinicalReport(result.data.clinical_report);
      }
    } catch (error) {
      alert(t('clinic:consultation.failedGenerateAISummary', { message: error.response?.data?.error || error.message, defaultValue: 'Failed to generate AI summary: {{message}}' }));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleOnClickSendSummary = async () => {
    if (!patientData) { alert(t('clinic:consultation.noPatientData')); return; }
    const email = patientData.patient_identification?.email;
    if (!email) { alert(t('common:errors.unknownEmail')); return; }
    setPatientEmail(email);
    setAiSummary('');
    setEmailResult(null);
    setShowSendSummaryModal(true);
    await generateAISummary();
  };

  // FAB 클릭 시 해당 액션 실행 후 닫기
  const handleFabAction = (action) => {
    setFabOpen(false);
    action();
  };

  const actionButtons = [
    {
      label: "Prescription",
      icon: <PillIcon className="w-[15px] h-[15px] shrink-0" />,
      onClick: handleGeneratePrescription,
      disabled: isGeneratingPrescription,
      className: "bg-emerald-600 hover:bg-emerald-700 text-white",
      fabClassName: "bg-emerald-600 text-white",
    },
    // {
    //   label: "Summary",
    //   icon: isSendingEmail
    //     ? <div className="w-[15px] h-[15px] border-2 border-white border-t-transparent rounded-full animate-spin" />
    //     : <MailIcon className="w-[15px] h-[15px] shrink-0" />,
    //   onClick: handleOnClickSendSummary,
    //   disabled: isSendingEmail,
    //   className: "bg-[#7733CF] hover:bg-[#6622BE] text-white",
    //   fabClassName: "bg-[#7733CF] text-white",
    // },
    {
      label: "Ask AI",
      icon: <AiIcon className="w-[15px] h-[15px] shrink-0" />,
      onClick: () => setShowChatbox(true),
      disabled: false,
      className: "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200",
      fabClassName: "bg-slate-700 text-white",
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToPatientList}
              className="cursor-pointer group flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-all border border-slate-200 text-sm font-medium"
            >
              <span className="opacity-50 group-hover:-translate-x-0.5 transition-transform">←</span>
              {t('clinic:consultation.patients', 'Patients')}
            </button>
            <button
              onClick={() => navigate("/clinics")}
              className="cursor-pointer flex items-center justify-center w-[34px] h-[34px] bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition-all border border-slate-200"
            >
              <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {actionButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                disabled={btn.disabled}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-70 whitespace-nowrap min-w-[130px] justify-center ${btn.className}`}
              >
                {btn.icon}
                {btn.label}
              </button>
            ))}
            <ProfileDropdown variant="default" />
          </div>

          <div className="sm:hidden">
            <ProfileDropdown variant="default" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 sm:hidden">

        <div
          className={`flex flex-col items-end gap-2.5 transition-all duration-200 ${
            fabOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {[...actionButtons].reverse().map((btn) => (
            <div key={btn.label} className="flex items-center gap-2.5">
              {/* 라벨 */}
              <span className="text-xs font-medium text-slate-700 bg-white px-2.5 py-1 rounded-lg shadow border border-slate-100 whitespace-nowrap">
                {btn.label}
              </span>
              {/* 아이콘 버튼 */}
              <button
                onClick={() => handleFabAction(btn.onClick)}
                disabled={btn.disabled}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-70 ${btn.fabClassName}`}
              >
                {btn.icon}
              </button>
            </div>
          ))}
        </div>

        {/* 메인 FAB 버튼 */}
        <button
          onClick={() => setFabOpen((prev) => !prev)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 ${
            fabOpen
              ? "bg-slate-700 rotate-45"
              : "bg-[#3C3489] hover:bg-[#2e2870]"
          }`}
        >
          {fabOpen
            ? <X className="w-5 h-5 text-white" />
            : <Plus className="w-5 h-5 text-white" />
          }
        </button>
      </div>

      {/* FAB 열릴 때 배경 딤 처리 */}
      {fabOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* ── 모달들 ────────────────────────────────────────── */}
      {showPrescriptionModal && (
        <PrescriptionModal
          prescription={generatedPrescription}
          prescriptionId={prescriptionId}
          onClose={handleOnClostPrescriptionModal}
          isGenerating={isGeneratingPrescription}
          patientInfo={patientData}
        />
      )}

      {showSendSummaryModal && (
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
        />
      )}

      <ChatboxModal
        isOpen={showChatbox}
        onClose={() => setShowChatbox(false)}
        patientSummary={snapshot || conversationSummary || ''}
      />
    </>
  );
}