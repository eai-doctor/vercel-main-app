import ReactMarkdown from 'react-markdown';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

import { FreeMessageLimitModal } from "@/pages/public";
import { ProfileDropdown } from "@/components";
import {
  AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon,
  MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
} from '@/components/ui/icons';
import chatApi from '@/api/chatApi';
import consultationApi from '@/api/consultationApi';
import ChatboxModal from "@/pages/public/ChatboxModal";
import { useAuthModal } from '@/context/AuthModalContext';

const AUDIO_CONSTRAINTS = {
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
};
const FREE_MESSAGE_LIMIT = 5;

export default function HealthConsultation() {
  const { t } = useTranslation(['patient', 'common', 'functions']);
  const navigate = useNavigate();
  const { isAuthenticated, user, loading, accessToken } = useAuth();
  const { openLogin } = useAuthModal();

  const [pendingMessage, setPendingMessage] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [suggestions] = useState([
    t('suggestions.discussConsultation'),
    t('suggestions.prepareAppointment'),
    t('suggestions.monitorSymptoms'),
    t('suggestions.askDoctor')
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [consulting, setConsulting] = useState(false);
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState("");
  const [snapshot, setSnapshot] = useState("");
  const [conversationSummary, setConversationSummary] = useState("");

  const [showEndConsultationModal, setShowEndConsultationModal] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  const [showChatboxModal, setShowChatboxModal] = useState(false);

  const [chatSummary, setChatSummary] = useState('');
  const [isGeneratingChatSummary, setIsGeneratingChatSummary] = useState(false);
  const [showChatSummaryModal, setShowChatSummaryModal] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [saveSummaryResult, setSaveSummaryResult] = useState(null);
  const [summaryModelUsed, setSummaryModelUsed] = useState('');

  const [previousSymptoms, setPreviousSymptoms] = useState([]);
  const [isSymptomsLoading, setIsSymptomsLoading] = useState(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const labReportInputRef = useRef(null);
  const plusMenuRef = useRef(null);

  const TABS = [
    { id: 'chat',    label: t('tab.chat', 'Chat') },
    { id: 'record',  label: t('tab.record', 'Recording') },
    { id: 'history', label: t('tab.history', 'History') },
  ];

  const getStoredCount = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('free_msg') || '{}');
      const today = new Date().toDateString();
      if (stored.date !== today) return 0;
      return stored.count || 0;
    } catch { return 0; }
  };

  const incrementCount = () => {
    const today = new Date().toDateString();
    const count = getStoredCount() + 1;
    localStorage.setItem('free_msg', JSON.stringify({ date: today, count }));
    return count;
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoadingChat]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const fetchSymptoms = async () => {
      setIsSymptomsLoading(true);
      try {
        const response = await chatApi.getConsultationSummaries();
        if (response.data.success) setPreviousSymptoms(response.data.symptoms || []);
      } catch (e) { console.error(e); } finally { setIsSymptomsLoading(false); }
    };
    fetchSymptoms();
  }, [isAuthenticated, loading]);

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

  useEffect(() => {
    if (consulting) startRecording();
    else stopRecording();
    return () => stopRecording();
  }, [consulting]);

  const handleLabReportUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setShowPlusMenu(false); setIsUploadingReport(true);
    setMessages(prev => [...prev, { role: 'user', content: `📎 Uploading lab report: ${file.name}…` }]);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (user?.name) formData.append('patient_name', user.name);
      const headers = { 'X-API-Key': '', "Content-Type": "multipart/form-data" };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const response = await chatApi.uploadLabReport(formData, headers);
      if (response.data.report_id) setActiveReportId(response.data.report_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.duplicate
          ? `Your lab report **${response.data.filename || file.name}** was already on file.`
          : `✅ Lab report **${response.data.filename || file.name}** uploaded! You can now ask me about your results.`
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Could not upload. Please try again.', isError: true }]);
    } finally { setIsUploadingReport(false); e.target.value = ''; }
  };

  //step 1: send chat message and get response from backend
  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoadingChat) return;
    if (!isAuthenticated && !loading) {
      const currentCount = getStoredCount();
      if (currentCount >= FREE_MESSAGE_LIMIT) {
        setPendingMessage(textToSend);
        setShowLimitModal(true);
        return;
      }
      incrementCount();
    }
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInput(''); setIsLoadingChat(true); setShowSuggestions(false);
    try {
      const headers = { 'X-API-Key': '' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const response = await chatApi.sendPatientMessage({
        message: textToSend, patient_summary: conversationSummary || '',
        chat_history: messages, mode: 'patient',
        ...(activeReportId && { report_id: activeReportId }),
        ...(user && { patient_info: { name: user.name || '', gender: user.gender || '', age: user.age || '', location: user.location || '' } })
      }, headers);
      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.response, formatted: response.data.formatted_response }]);

        // step2 : add chat data to database
        const saveResponse = await chatApi.saveMessage(textToSend, response.data.response, user?.user_id || "PORTAL-USER");
      } else throw new Error(response.data.error || 'Failed');
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common:errors.chatError'), isError: true }]);
    } finally { setIsLoadingChat(false); }
  };

  const handleSuggestionClick = (s) => { setInput(s); sendMessage(s); };
  const handleClearChat = () => { setMessages([]); setShowSuggestions(true); };

  const handleGenerateChatSummary = async () => {
    if (!isAuthenticated && !loading) { setPendingAction('generateChatSummary'); setShowLimitModal(true); return; }
    const cleanMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(({ role, content }) => ({ role, content }));
    if (cleanMessages.length === 0) return;
    try {
      setIsGeneratingChatSummary(true); setSaveSummaryResult(null);
      const response = await chatApi.generateConsultationSummaries(cleanMessages);
      if (response.data.success) { setChatSummary(response.data.summary); setSummaryModelUsed(response.data.model_used || ''); setShowChatSummaryModal(true); }
      else alert(t('chat.summaryFailed'));
    } catch (e) { alert(t('chat.summaryGenerateFailed', { error: e.response?.data?.error || e.message })); }
    finally { setIsGeneratingChatSummary(false); }
  };

  const handleSaveSummary = async () => {
    const cleanMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant').map(({ role, content }) => ({ role, content }));
    try {
      setIsSavingSummary(true);
      const response = await chatApi.saveConsultationSummaries(chatSummary, cleanMessages, summaryModelUsed);
      setSaveSummaryResult({ success: response.data.success, message: response.data.success ? t('chat.summarySaved') : t('chat.summarySaveFailed') });
    } catch (e) { setSaveSummaryResult({ success: false, message: e.response?.data?.error || e.message }); }
    finally { setIsSavingSummary(false); }
  };

  const handleLoginSuccess = () => {
    localStorage.setItem("last_portal", "/personal");
    if (pendingMessage) { const m = pendingMessage; setPendingMessage(null); setTimeout(() => sendMessage(m), 100); }
    if (pendingAction === 'generateSummary') { setPendingAction(null); setTimeout(() => handleOpenEndConsultationModal(), 100); }
    if (pendingAction === 'generateChatSummary') { setPendingAction(null); setTimeout(() => handleGenerateChatSummary(), 100); }
  };

  const startRecording = async () => {
    try {
      setTranscriptHistory(""); setSnapshot(""); setConversationSummary("");
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      streamRef.current = stream;
      startWebSpeechRecognition();
    } catch { setConsulting(false); }
  };

  const startWebSpeechRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US';
      r.onresult = (e) => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const txt = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += txt; else interim += txt;
        }
        if (final.trim()) setTranscriptHistory(p => p ? p + " " + final.trim() : final.trim());
        setInterimTranscript(interim);
      };
      r.onend = () => { if (consulting && streamRef.current?.active) { try { r.start(); } catch {} } };
      r.start(); speechRecognitionRef.current = r;
    } catch {}
  };

  const stopWebSpeechRecognition = () => {
    try { speechRecognitionRef.current?.stop(); } catch {}
    speechRecognitionRef.current = null; setInterimTranscript("");
  };

  const stopRecording = () => {
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    stopWebSpeechRecognition();
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
        {/* 데스크톱 헤더 */}
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

        {/* 모바일 헤더 */}
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

        {/* 모바일 탭바 — 헤더 안에 배치 */}
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
        <div
          className={`w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col
            ${activeTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
          style={{ height: 'calc(100dvh - 160px)' }}
        >
          {/* Chat subheader */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#f5f7ff] rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                <AiIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-slate-800">{t('chat.assistantName', 'EboAI')}</h2>
                <p className="text-[10px] text-slate-400">{t('chat.assistantSubtitle', 'Patient health assistant')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {messages.some(m => m.role === 'user') && (
                <button onClick={handleGenerateChatSummary} disabled={isGeneratingChatSummary}
                  className="text-[11px] font-semibold text-[#2C3B8D] px-2.5 py-1.5 rounded-lg hover:bg-[#eef2ff] transition-colors disabled:opacity-50">
                  {isGeneratingChatSummary ? t('common:states.generating') : t('chat.summarize', 'Summarize')}
                </button>
              )}
              {messages.length > 0 && (
                <button onClick={handleClearChat}
                  className="text-[11px] text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  {t('common:buttons.clear', 'Clear')}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-[#e6ecff] flex items-center justify-center mb-3">
                  <AiIcon className="w-6 h-6 text-[#2C3B8D]" />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-800 mb-1">{t('chat.welcomeTitle', 'How can I help?')}</h3>
                <p className="text-[12px] text-slate-500 max-w-sm">{t('chat.welcomeDescription', 'Ask about your symptoms, medications, or upcoming appointment.')}</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-[#2C3B8D] text-white rounded-br-sm'
                    : msg.isError
                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'}`}>
                  {msg.role === 'assistant' && !msg.isError && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <AiIcon className="w-3 h-3 text-[#2C3B8D]" />
                      <span className="text-[10px] font-semibold text-[#2C3B8D]">EboAI</span>
                    </div>
                  )}
                  {msg.role === 'assistant' && msg.formatted
                    ? <div dangerouslySetInnerHTML={{ __html: msg.formatted }} className="prose prose-sm max-w-none" />
                    : <p className="whitespace-pre-wrap">{msg.content}</p>
                  }
                </div>
              </div>
            ))}

            {isLoadingChat && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-3 py-2.5">
                  <div className="flex items-center gap-1 mb-1.5">
                    <AiIcon className="w-3 h-3 text-[#2C3B8D]" />
                    <span className="text-[10px] font-semibold text-[#2C3B8D]">EboAI</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#2C3B8D] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[#2C3B8D] rounded-full animate-bounce [animation-delay:100ms]" />
                    <div className="w-1.5 h-1.5 bg-[#2C3B8D] rounded-full animate-bounce [animation-delay:200ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
            <div className="px-3 py-2.5 bg-white border-t border-slate-100 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, idx) => (
                  <button key={idx} onClick={() => handleSuggestionClick(s)} disabled={isLoadingChat}
                    className="px-2.5 py-1 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#2C3B8D] text-[11px] font-semibold rounded-full border border-[#c7d2f8] transition-colors disabled:opacity-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
            {/* 모바일: 2줄 레이아웃, 데스크톱: 1줄 */}
            <div className="flex gap-2 items-center">
              <input
                type="text" value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={t('chat.inputPlaceholder', 'Ask about your symptoms...')}
                disabled={isLoadingChat}
                className="flex-1 min-w-0 px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl
                  focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
                  text-slate-900 placeholder:text-slate-400 transition-colors disabled:opacity-50"
              />
              <div className="relative shrink-0" ref={plusMenuRef}>
                <button
                  onClick={() => setShowPlusMenu(p => !p)} disabled={isUploadingReport}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200
                    bg-slate-50 hover:bg-[#eef2ff] hover:border-[#2C3B8D] text-slate-500
                    hover:text-[#2C3B8D] transition-all disabled:opacity-50 text-lg font-light"
                >
                  {isUploadingReport
                    ? <div className="w-3.5 h-3.5 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
                    : '+'}
                </button>
                {showPlusMenu && (
                  <div className="absolute bottom-12 right-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-[170px] z-20">
                    <button
                      onClick={() => isAuthenticated && labReportInputRef.current?.click()}
                      disabled={!isAuthenticated}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors
                        ${isAuthenticated ? 'text-slate-700 hover:bg-[#f5f7ff]' : 'text-slate-400 cursor-not-allowed'}`}
                    >
                      <span>📋</span><span>Upload lab report</span>
                      {!isAuthenticated && <span className="ml-auto text-[10px]">🔒</span>}
                    </button>
                  </div>
                )}
                <input ref={labReportInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleLabReportUpload} />
              </div>
              <button
                onClick={() => sendMessage()} disabled={isLoadingChat || !input.trim()}
                className="shrink-0 px-3.5 py-2.5 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[13px]
                  font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isLoadingChat
                  ? <ClockIcon className="w-4 h-4 animate-spin" />
                  : <><span className="hidden sm:inline">{t('common:buttons.send', 'Send')}</span><span>→</span></>
                }
              </button>
            </div>
            {!isAuthenticated && !loading && (
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                {t('chat.freeMessagesRemaining', { count: Math.max(0, FREE_MESSAGE_LIMIT - getStoredCount()) })} —{' '}
                <button onClick={() => openLogin()} className="text-[#2C3B8D] hover:underline font-medium">{t('common:buttons.signIn', 'sign in')}</button>{' '}
                {t('chat.forUnlimited', 'for unlimited')}
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Record + History ── */}
        {/* 모바일: record 탭이면 Recording 카드만, history 탭이면 Symptoms 카드만 표시 */}
        {/* 데스크톱: 항상 전부 표시 */}
        <div className={`w-full lg:w-1/3 space-y-4 ${activeTab === 'chat' ? 'hidden lg:block' : 'block'}`}>

          {/* Recording card — record 탭 또는 데스크톱 */}
          <div className={activeTab === 'history' ? 'hidden lg:block' : 'block'}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                  <MicrophoneIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
                </div>
                <div>
                  <h2 className="text-[14px] font-semibold text-slate-800">{t('consultation.audioRecording', 'Audio Recording')}</h2>
                  <p className="text-[10px] text-slate-400">{t('consultation.recordConsultation', 'Record your consultation')}</p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setConsulting(!consulting)}
                  className={`w-full py-3 rounded-xl text-white font-bold text-[13px] transition-all
                    ${consulting ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {consulting ? t('consultation.stopRecording', 'Stop Recording') : t('consultation.startRecording', 'Start Recording')}
                </button>
                {consulting && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                    <span className="text-[12px] font-semibold text-red-700">{t('consultation.recordingInProgress', 'Recording in progress...')}</span>
                  </div>
                )}
                {(consulting || transcriptHistory) && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-100">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${consulting ? 'bg-amber-500 animate-pulse' : 'bg-amber-300'}`} />
                      <span className="text-[11px] font-semibold text-amber-700">
                        {consulting ? t('consultation.liveTranscription', 'Live Transcription') : t('consultation.transcription', 'Transcription')}
                      </span>
                    </div>
                    <div className="p-3 max-h-36 overflow-y-auto">
                      {(transcriptHistory || interimTranscript) ? (
                        <p className="text-[12px] whitespace-pre-wrap leading-relaxed text-slate-800">
                          {transcriptHistory}
                          {interimTranscript && <span className="text-slate-400 italic"> {interimTranscript}</span>}
                        </p>
                      ) : (
                        <p className="text-[12px] text-slate-400 italic text-center py-1">{t('consultation.listening', 'Listening...')}</p>
                      )}
                    </div>
                  </div>
                )}
                {transcriptHistory && !consulting && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSnapshot(transcriptHistory); setConversationSummary(transcriptHistory); }}
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-[#2C3B8D] bg-[#eef2ff] hover:bg-[#e0e7ff] border border-[#c7d2f8] transition-colors"
                    >
                      {t('consultation.showConversation', 'Show Conversation')}
                    </button>
                    <button
                      onClick={handleOpenEndConsultationModal}
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-white bg-[#2C3B8D] hover:bg-[#233070] transition-colors"
                    >
                      {t('consultation.generateSummary', 'Generate Summary')}
                    </button>
                  </div>
                )}
                {!consulting && !transcriptHistory && (
                  <p className="text-center text-[12px] text-slate-400">{t('consultation.pressStartRecording', 'Press Start Recording to begin')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Previous Symptoms — history 탭 또는 데스크톱 */}
          {isAuthenticated && (
            <div className={activeTab === 'record' ? 'hidden lg:block' : 'block'}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                    <ClipboardIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-800">Previous Symptoms</h3>
                  {previousSymptoms.length > 0 && (
                    <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">{previousSymptoms.length}</span>
                  )}
                </div>
                <div className="p-3">
                  {isSymptomsLoading ? (
                    <div className="flex items-center justify-center py-4 gap-2">
                      <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[12px] text-slate-400">Loading...</span>
                    </div>
                  ) : previousSymptoms.length === 0 ? (
                    <p className="text-[12px] text-slate-400 italic text-center py-2">No previous symptoms recorded.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {previousSymptoms.map((symptom, idx) => {
                        const label = typeof symptom === 'string' ? symptom : symptom.symptom || symptom.name || '';
                        const severity = typeof symptom === 'object' ? (symptom.severity || symptom.severity_level || '') : '';
                        const sClass = {
                          mild: 'bg-green-100 text-green-700',
                          moderate: 'bg-amber-100 text-amber-700',
                          severe: 'bg-orange-100 text-orange-700',
                          critical: 'bg-red-100 text-red-700',
                        }[severity?.toLowerCase()] || 'bg-[#eef2ff] text-[#2C3B8D]';
                        return (
                          <li key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2C3B8D] shrink-0" />
                            <span className="text-[12px] text-slate-800 flex-1">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                            {severity && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${sClass}`}>{severity}</span>}
                            {symptom.date && <span className="text-[10px] text-slate-400">{new Date(symptom.date).toLocaleDateString()}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Conversation summary */}
          {conversationSummary && (
            <div className={activeTab === 'record' ? 'hidden lg:block' : 'block'}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
                  <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                    <ClipboardIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
                  </div>
                  <h3 className="text-[14px] font-semibold text-slate-800">{t('consultation.consultationSummary', 'Consultation Summary')}</h3>
                </div>
                <div className="p-3">
                  <p className="text-[12px] text-slate-700 whitespace-pre-wrap leading-relaxed">{conversationSummary}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ChatboxModal ── */}
      <ChatboxModal isOpen={showChatboxModal} onClose={() => setShowChatboxModal(false)} patientSummary={conversationSummary || t('consultation.noSummaryAvailable')} />

      {/* ── Chat Summary Modal ── */}
      {showChatSummaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ModalHeader title={t('chat.chatSummary', 'Chat Summary')} subtitle={t('chat.aiGeneratedSummary', 'AI-generated summary')} badge={summaryModelUsed || undefined} onClose={() => { setShowChatSummaryModal(false); setSaveSummaryResult(null); }} />
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="text-[14px] text-slate-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-800 prose-strong:text-slate-800 prose-ul:my-1 prose-li:my-0.5 prose-p:my-1.5">
                  <ReactMarkdown>{chatSummary}</ReactMarkdown>
                </div>
              </div>
              {saveSummaryResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[13px] font-semibold ${saveSummaryResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {saveSummaryResult.success ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                  {saveSummaryResult.message}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveSummary} disabled={isSavingSummary || saveSummaryResult?.success}
                  className="flex-1 py-3 rounded-xl bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSavingSummary ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common:states.saving')}</> : saveSummaryResult?.success ? <><CheckCircleIcon className="w-4 h-4" />{t('common:states.saved')}</> : <><ClipboardIcon className="w-4 h-4" />{t('chat.saveToMyRecords', 'Save to My Records')}</>}
                </button>
                <button onClick={() => { setShowChatSummaryModal(false); setSaveSummaryResult(null); }} className="px-5 py-3 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[14px] font-semibold transition-colors">
                  {t('common:buttons.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Summary Modal ── */}
      {showEndConsultationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ModalHeader title={t('consultation.sendSummary', 'Send Summary')} subtitle={t('consultation.emailSummaryToPatient', 'Email consultation summary')} onClose={() => setShowEndConsultationModal(false)} />
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium uppercase tracking-wide text-slate-400">{t('consultation.patientEmailAddress', 'Patient Email')}</label>
                <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@example.com"
                  className="w-full px-4 py-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10 text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium uppercase tracking-wide text-slate-400">{t('consultation.consultationSummary', 'Summary')}</label>
                  {isGeneratingSummary && (
                    <div className="flex items-center gap-1.5 text-[12px] text-[#2C3B8D]">
                      <div className="w-3 h-3 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
                      {t('common:states.generating', 'Generating...')}
                    </div>
                  )}
                </div>
                <textarea value={aiSummary} onChange={(e) => setAiSummary(e.target.value)} placeholder={t('consultation.summaryPlaceholder', 'Summary will appear here...')} rows={10}
                  className="w-full px-4 py-3 text-[13px] font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10 resize-none" />
              </div>
              {emailResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[13px] font-semibold ${emailResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {emailResult.success ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                  <div>
                    <p>{emailResult.success ? t('consultation.emailSentSuccess') : t('consultation.emailSentFailed')}</p>
                    {emailResult.message && <p className="text-[11px] font-normal mt-0.5 opacity-80">{emailResult.message}</p>}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSendEmail} disabled={isSendingEmail || !patientEmail || !aiSummary}
                  className="flex-1 py-3 rounded-xl bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSendingEmail ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common:states.sending')}</> : <><MailIcon className="w-4 h-4" />{t('consultation.sendEmail', 'Send Email')}</>}
                </button>
                <button onClick={() => setShowEndConsultationModal(false)} className="px-5 py-3 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[14px] font-semibold transition-colors">
                  {t('common:buttons.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FreeMessageLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}