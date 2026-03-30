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
} from "@/components/icons";
import { ChatboxModal } from "@/features/modal";
import PrescriptionModal from "@/features/consultation/components/modal/PrescriptionModal"
import EndConsultationModal from "@/features/consultation/components/modal/EndConsultationModal";

import { generatePrescription } from "@/services/consultationService";

export default function Header({
    patientData,
    onBackToPatientList,
    isSendingEmail,
    setShowConfigPanel,
    generateAISummary,
    snapshot,
    conversationSummary,
    aiSummary,
    setAiSummary,
    modelInfo,
    isGeneratingSummary
}) {
    const navigate = useNavigate();
    const { t } = useTranslation(['clinic', 'common']);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [generatedPrescription, setGeneratedPrescription] = useState("");
    const [isGeneratingPrescription, setIsGeneratingPrescription] = useState(false);
    const [showEndConsultationModal, setShowEndConsultationModal] = useState(false);
    const [showChatbox, setShowChatbox] = useState(false);
    const [patientEmail, setPatientEmail] = useState('');
    const [emailResult, setEmailResult] = useState(null);
      
    const handleGeneratePrescription = async () => {
        if (!patientData) {
            alert(t('clinic:consultation.noPatientData', 'No patient data available'));
            return;
        }

        try {
            setIsGeneratingPrescription(true);
            setShowPrescriptionModal(true);
            setGeneratedPrescription("");

            const data = await generatePrescription(patientData);

            setGeneratedPrescription(data.prescription);
            setIsGeneratingPrescription(false);

            console.log("Prescription generated successfully");
        } catch (error) {
            // console.error("Error generating prescription:", error);
            setIsGeneratingPrescription(false);
            setShowPrescriptionModal(false);
            alert(t('clinic:consultation.failedGeneratePrescription', { message: error.response?.data?.error || error.message, defaultValue: 'Failed to generate prescription: {{message}}' }));
        }
    };
      
    const handleOpenEndConsultationModal = async () => {
        if (!patientData) {
            alert(t('clinic:consultation.noPatientData', 'No patient data available'));
            return;
        }

        // Set patient email from patient data
        const email = patientData.patient_identification?.email || '';
        setPatientEmail(email);

        // Reset states
        setAiSummary('');
        setEmailResult(null);

        // Open modal
        setShowEndConsultationModal(true);

        // Automatically generate AI summary
        await generateAISummary();
    };
      
    return (
        <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] p-8 mb-6">
            {/* Top Row - Navigation Buttons */}
            <div className="flex items-center space-x-4 mb-6">
                {/* Back button */}
                <button
                    onClick={onBackToPatientList}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 flex items-center space-x-2"
                    title={t('clinic:consultation.backToPatientList', 'Back to Patient List')}
                >
                    <span className="text-xl">←</span>
                    <span className="hidden sm:inline">{t('clinic:consultation.patients', 'Patients')}</span>
                </button>
                {/* Home button */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all shadow-md btn-glow"
                    title={t('clinic:consultation.goToHome', 'Go to Home')}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">{t('common:buttons.home', 'Home')}</span>
                </button>
                <ProfileDropdown variant="dark" />
            </div>

            {/* Main Row - Title on Left, Buttons on Right */}
            <div className="flex items-center justify-between">
                {/* Left - Title */}
                <div>
                    <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-lg">
                        {t('clinic:consultation.title', 'AI Medical Assistant')}
                    </h1>
                </div>

                {/* Right - Action Buttons Grid (2x2) */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Top Left - Generate Prescription */}
                    <button
                        onClick={handleGeneratePrescription}
                        disabled={isGeneratingPrescription}
                        className="px-5 py-3 bg-green-500/90 hover:bg-green-600 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        <PillIcon className="w-6 h-6" />
                        <span className="text-sm">{t('clinic:consultation.generatePrescription', 'Generate Prescription')}</span>
                    </button>

                    {/* Top Right - Send Summary */}
                    <button
                        onClick={handleOpenEndConsultationModal}
                        disabled={isSendingEmail}
                        className="px-5 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        <MailIcon className="w-6 h-6" />
                        <span className="text-sm">{t('clinic:consultation.sendSummary', 'Send Summary')}</span>
                    </button>

                {/* Bottom Left - Settings 
                <button
                    onClick={() => setShowConfigPanel(true)}
                    className="px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                    <SettingsIcon className="w-6 h-6" />
                    <span className="text-sm">{t('common:buttons.settings', 'Settings')}</span>
                </button>*/}

                {/* Bottom Right - Ask EboAI */}
                <button
                    onClick={() => setShowChatbox(true)}
                    className="px-5 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 text-white rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/30 flex items-center justify-center space-x-2 shadow-lg btn-glow"
                >
                    <AiIcon className="w-6 h-6" />
                    <span className="text-sm">{t('clinic:consultation.askEboAI', 'Ask EboAI')}</span>
                </button>
                </div>
            </div>

            {/* Prescription Modal */}
            {showPrescriptionModal && (
                <PrescriptionModal
                    prescription={generatedPrescription}
                    onClose={() => {
                        setShowPrescriptionModal(false);
                        setGeneratedPrescription("");
                        setIsGeneratingPrescription(false);
                    }}
                    isGenerating={isGeneratingPrescription}
                    patientInfo={patientData?.patient_identification || selectedPatientInfo}
                />
            )}

            { showEndConsultationModal && 
                <EndConsultationModal 
                    patientData={patientData}
                    patientEmail = {patientEmail}
                    setPatientEmail={setPatientEmail}
                    aiSummary={aiSummary}
                    setAiSummary={setAiSummary}
                    emailResult={emailResult}
                    setEmailResult={setEmailResult}
                    patient_identification={patientData?.patient_identification}
                    modelInfo={modelInfo}
                    generateAISummary={generateAISummary}
                    isGeneratingSummary={isGeneratingSummary}
                    setShowEndConsultationModal={setShowEndConsultationModal}
                />}

            {/* Chatbox Modal */}
            <ChatboxModal
                isOpen={showChatbox}
                onClose={() => setShowChatbox(false)}
                patientSummary={snapshot || conversationSummary || ''}
            />
        </div>
    )
}