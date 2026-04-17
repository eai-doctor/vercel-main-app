import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

import { FreeMessageLimitModal } from "@/pages/public";
import { ProfileDropdown } from "@/components";
import chatApi from '@/api/chatApi';
import consultationApi from '@/api/consultationApi';
import ChatboxModal from "@/pages/public/ChatboxModal";
import { useAuthModal } from '@/context/AuthModalContext';

import ChatSummaryModal from './components/modals/ChatSummaryModal';
import { useHealthConsultation } from './hooks/useHealthConsultation';
import ChatPanel from './components/ChatPanel';

import { 
  SYMPTOM_SEVERITY_CLASSES, 
  FREE_MESSAGE_LIMIT, 
  getTabs, 
  getSuggestions 
} from './constants';
import { 
  getStoredMessageCount
} from './utils';
import EmailSummaryModal from './components/modals/EmailSummaryModal';
import RecordingPanel from './components/RecordingPanel';

export default function HealthConsultation() {
  const { t } = useTranslation(['patient', 'common', 'functions']);
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, accessToken } = useAuth();
  const { openLogin } = useAuthModal();


  const [activeTab, setActiveTab] = useState('chat');

  const [suggestions] = useState(getSuggestions(t));
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [showEndConsultationModal, setShowEndConsultationModal] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  const [showChatboxModal, setShowChatboxModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 
  const [pendingMessage, setPendingMessage] = useState(null); 

  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [saveSummaryResult, setSaveSummaryResult] = useState(null);


  const [showLimitModal, setShowLimitModal] = useState(false);
  const labReportInputRef = useRef(null);
  const plusMenuRef = useRef(null);

    const {
    // States
    messages, setMessages,
    input, setInput,
    isLoadingChat,
    consulting, setConsulting,
    transcriptHistory, 
    interimTranscript,
    conversationSummary, setConversationSummary,
    chatSummary,
    isGeneratingChatSummary,
    summaryModelUsed,
    aiSummary, setAiSummary,
    isGeneratingSummary, setIsGeneratingSummary,
    isUploadingReport, setIsUploadingReport,
    activeReportId, setActiveReportId,snapshot, setSnapshot,
    showChatSummaryModal,
    setShowChatSummaryModal,
    showPlusMenu, setShowPlusMenu,
    
    // Actions
    sendMessage,
    startRecording,
    stopRecording,
    generateChatSummary,
    uploadLabReport
  } = useHealthConsultation(user, accessToken, isAuthenticated, loading, openLogin);

  const TABS = getTabs(t);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoadingChat]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) setShowPlusMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: t('chat.welcomeGreeting') }]);
    setShowSuggestions(false);
  }, []);

  const handleSuggestionClick = (s) => { setInput(s); sendMessage(s); };
  const handleClearChat = () => { setMessages([]); setShowSuggestions(true); };

  const handleSaveSummary = async () => {
    const cleanMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(({ role, content }) => ({ role, content }));
    try {
      setIsSavingSummary(true);
      const response = await chatApi.saveConsultationSummaries(chatSummary, cleanMessages, summaryModelUsed);
      setSaveSummaryResult({ success: response.data.success, message: response.data.success ? t('chat.summarySaved') : t('chat.summarySaveFailed') });
    } catch (e) { setSaveSummaryResult({ success: false, message: e.response?.data?.error || e.message }); }
    finally { setIsSavingSummary(false); }
  };

  const handleOpenEndConsultationModal = async () => {
    if (!isAuthenticated && !loading) { setPendingAction('generateSummary'); openLogin(); return; }
    setPatientEmail('patient@example.com'); setAiSummary(''); setEmailResult(null);
    setShowEndConsultationModal(true); await generateAISummary();
  };

  const generateAISummary = async () => {
    try {
      setIsGeneratingSummary(true);
      const response = await consultationApi.generateConsultationSummary(
        { full_name: "Patient Portal User", mrn: "PORTAL-USER" },
        { conversation_summary: conversationSummary || transcriptHistory, patient_snapshot: snapshot || conversationSummary || transcriptHistory, conversation_history: snapshot || transcriptHistory, new_diagnoses: [], new_medications: [] }
      );
      if (response.data.success) setAiSummary(response.data.clinical_report);
      else alert(t('chat.summaryFailed'));
    } catch (e) { alert(t('chat.summaryGenerateFailed', { error: e.response?.data?.error || e.message })); setAiSummary(t('chat.summaryError')); }
    finally { setIsGeneratingSummary(false); }
  };

  const handleSendEmail = async () => {
    if (!patientEmail || !aiSummary) { alert(!patientEmail ? t('consultation.enterEmail') : t('consultation.enterSummary')); return; }
    try {
      setIsSendingEmail(true);
      const response = await consultationApi.endConsultation(patientEmail, aiSummary, { full_name: "Patient Portal User", mrn: "PORTAL-USER" });
      setEmailResult(response.data);
    } catch (e) { setEmailResult({ success: false, message: e.response?.data?.error || e.message }); }
    finally { setIsSendingEmail(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="bg-[#2C3B8D] shadow-sm mx-3 mt-3 mb-0 p-3 rounded-2xl lg:mx-6 lg:mt-6 lg:p-5">
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
              {t('header.title', 'Health Consultation')}
            </h1>
            <p className="text-white/60 text-[13px] mt-0.5">{t('header.subtitle', 'AI-powered patient assistant')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold rounded-xl transition-colors border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t('common:buttons.home', 'Home')}
            </button>
            {isAuthenticated
              ? <ProfileDropdown variant="dark" />
              : <button onClick={() => { setPendingMessage(null); openLogin(); }} className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold rounded-xl transition-colors border border-white/20">{t('common:buttons.signIn', 'Sign In')}</button>
            }
          </div>
        </div>

        <div className="flex lg:hidden items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="w-8 h-8 flex items-center justify-center bg-white/15 rounded-lg border border-white/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <div>
              <h1 className="text-[16px] font-bold text-white leading-tight">{t('header.title', 'Health Consultation')}</h1>
              <p className="text-white/60 text-[11px]">{t('header.subtitle', 'AI-powered assistant')}</p>
            </div>
          </div>
          {isAuthenticated
            ? <ProfileDropdown variant="dark" />
            : <button onClick={() => { setPendingMessage(null); openLogin(); }} className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[12px] font-semibold rounded-lg border border-white/20">{t('common:buttons.signIn', 'Sign In')}</button>
          }
        </div>

        <div className="flex lg:hidden bg-white/10 rounded-xl p-1 gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all
                ${activeTab === tab.id ? 'bg-white text-[#2C3B8D]' : 'text-white/70 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 p-3 lg:p-6 max-w-screen-2xl mx-auto">

        {/* ── Chat panel ── */}
        <ChatPanel 
          messages = {messages}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef }
          generateChatSummary = {generateChatSummary}
          handleClearChat = {handleClearChat}
          isGeneratingChatSummary = {isGeneratingChatSummary}
          activeTab = {activeTab}
          t = {t}
          isLoadingChat = {isLoadingChat}
          suggestions = {suggestions}
          showSuggestions = {showSuggestions}
          handleSuggestionClick = {handleSuggestionClick}
          input = {input}
          setInput= {setInput}
          sendMessage= {sendMessage}
          plusMenuRef= {plusMenuRef} 
          showPlusMenu= {showPlusMenu}
          setShowPlusMenu= {setShowPlusMenu}
          isUploadingReport= {isUploadingReport} 
          isAuthenticated= {isAuthenticated}
          labReportInputRef= {labReportInputRef}
          openLogin= {openLogin}
          loading= {loading}
          uploadLabReport={uploadLabReport}
          FREE_MESSAGE_LIMIT ={FREE_MESSAGE_LIMIT }
          getStoredMessageCount ={getStoredMessageCount}
        />

        {/* ── RIGHT: Record + History ── */}
        <RecordingPanel 
          activeTab={activeTab}
          consulting={consulting}
          setConsulting={setConsulting}
          transcriptHistory={transcriptHistory}
          interimTranscript={interimTranscript}
          conversationSummary={conversationSummary}
          setConversationSummary={setConversationSummary}
          handleOpenEndConsultationModal={handleOpenEndConsultationModal}
          isAuthenticated={isAuthenticated}
          setSnapshot ={setSnapshot }
          setPendingAction={setPendingAction}
          SYMPTOM_SEVERITY_CLASSES={SYMPTOM_SEVERITY_CLASSES}
          t={t}
          loading={loading}
          user={user}
        />


      </div>

      {/* ── ChatboxModal ── */}
      <ChatboxModal 
        isOpen={showChatboxModal} 
        onClose={() => setShowChatboxModal(false)} 
        patientSummary={conversationSummary || t('consultation.noSummaryAvailable')} 
      />

      {/* ── Chat Summary Modal ── */}
      {showChatSummaryModal && 
        <ChatSummaryModal 
          t={t}
          summaryModelUsed={summaryModelUsed}
          setShowChatSummaryModal={setShowChatSummaryModal} 
          setSaveSummaryResult={setSaveSummaryResult} 
          chatSummary={chatSummary} 
          saveSummaryResult={saveSummaryResult} 
          handleSaveSummary={handleSaveSummary} 
          isSavingSummary={isSavingSummary} 
        />}

      {/* ── Email Summary Modal ── */}
      {showEndConsultationModal && (
        <EmailSummaryModal
          t={t}
          setShowEndConsultationModal={setShowEndConsultationModal}
          patientEmail={patientEmail}
          setPatientEmail={setPatientEmail}
          isGeneratingSummary={isGeneratingSummary}
          emailResult={emailResult}
          setAiSummary={setAiSummary}
          aiSummary={aiSummary}
          handleSendEmail={handleSendEmail}
          isSendingEmail={isSendingEmail}
        />
      )}

      <FreeMessageLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}