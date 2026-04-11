import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

import { LoginModal } from "@/components/modal";
import { ProfileDropdown } from "@/components";
import { AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon, MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon } from '@/components/ui/icons';
import chatApi from '@/api/chatApi';
import ChatboxModal from "@/pages/public/ChatboxModal";

// Audio constraints for microphone access
const AUDIO_CONSTRAINTS = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }
};

const FREE_MESSAGE_LIMIT = 5;

export default function HealthConsultation() {
  const { t } = useTranslation(['patient', 'common', 'functions']);
  const navigate = useNavigate();
  const { isAuthenticated, user, token, loading } = useAuth();

  // Auth gate states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  // Chat states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [suggestions, setSuggestions] = useState([
    t('suggestions.discussConsultation'),
    t('suggestions.prepareAppointment'),
    t('suggestions.monitorSymptoms'),
    t('suggestions.askDoctor')
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Consultation states
  const [consulting, setConsulting] = useState(false);

  // Recording refs
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Web Speech API transcription
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState("");

  // Consultation results
  const [snapshot, setSnapshot] = useState("");
  const [conversationSummary, setConversationSummary] = useState("");

  // Email summary states
  const [showEndConsultationModal, setShowEndConsultationModal] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  // Chatbox modal state (for Ask EboAI button)
  const [showChatboxModal, setShowChatboxModal] = useState(false);

  // Chat summary states
  const [chatSummary, setChatSummary] = useState('');
  const [isGeneratingChatSummary, setIsGeneratingChatSummary] = useState(false);
  const [showChatSummaryModal, setShowChatSummaryModal] = useState(false);
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [saveSummaryResult, setSaveSummaryResult] = useState(null);
  const [summaryModelUsed, setSummaryModelUsed] = useState('');

  // Previous symptoms state
  const [previousSymptoms, setPreviousSymptoms] = useState([]);
  const [isSymptomsLoading, setIsSymptomsLoading] = useState(false);

  // Lab report upload state
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const labReportInputRef = useRef(null);
  const plusMenuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const fetchSymptoms = async () => {
      setIsSymptomsLoading(true);
      try {
        const response = await chatApi.getConsultationSummaries();
        if (response.data.success) {
          setPreviousSymptoms(response.data.symptoms || []);
        }
      } catch (error) {
        console.error('Error fetching symptoms:', error);
      } finally {
        setIsSymptomsLoading(false);
      }
    };
    fetchSymptoms();
  }, [isAuthenticated, loading]);

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLabReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowPlusMenu(false);
    setIsUploadingReport(true);

    const userMsg = { role: 'user', content: `📎 Uploading lab report: ${file.name}…` };
    setMessages(prev => [...prev, userMsg]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (user?.name) formData.append('patient_name', user.name);

      const uploadHeaders = { 'X-API-Key': config.chatboxApiKey };
      if (token) uploadHeaders['Authorization'] = `Bearer ${token}`;

      const response = await chatApi.uploadLabReport(formData, { headers: uploadHeaders });

      if (response.data.report_id) {
        setActiveReportId(response.data.report_id);
      }

      const successMsg = {
        role: 'assistant',
        content: response.data.duplicate
          ? `Your lab report **${response.data.filename || file.name}** was already on file — I'll use that record for our conversation.`
          : `✅ Lab report **${response.data.filename || file.name}** uploaded successfully! You can now ask me questions about your results.`,
      };
      setMessages(prev => [...prev, successMsg]);
    } catch (error) {
      console.error('Lab report upload error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I couldn\'t upload your lab report. Please try again.',
        isError: true,
      }]);
    } finally {
      setIsUploadingReport(false);
      e.target.value = '';
    }
  };

  // Display a warm greeting from EboAI on mount
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: t('chat.welcomeGreeting')
    }]);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    if (consulting) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => stopRecording();
  }, [consulting]);

  // Chat functions
  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoadingChat) return;

    // 5-message gate: check if user has exceeded free limit
    if (!isAuthenticated && !loading) {
      const userMessageCount = messages.filter(m => m.role === 'user').length;
      if (userMessageCount >= FREE_MESSAGE_LIMIT) {
        setPendingMessage(textToSend);
        setShowLoginModal(true);
        return;
      }
    }

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoadingChat(true);
    setShowSuggestions(false);

    try {
      const chatHeaders = { 'X-API-Key': config.chatboxApiKey };
      if (token) chatHeaders['Authorization'] = `Bearer ${token}`;

      const response = await axios.post(
        `${config.chatboxServiceUrl}/api/chat`,
        {
          message: textToSend,
          patient_summary: conversationSummary || '',
          chat_history: messages,
          mode: 'patient',
          ...(activeReportId && { report_id: activeReportId }),
          ...(user && {
            patient_info: {
              name: user.name || '',
              gender: user.gender || '',
              age: user.age || '',
              location: user.location || '',
            }
          })
        },
        { headers: chatHeaders }
      );

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.response,
          formatted: response.data.formatted_response
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: t('common:errors.chatError'),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    sendMessage(suggestion);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  // Chat summary handlers
  const handleGenerateChatSummary = async () => {
    if (!isAuthenticated && !loading) {
      setPendingAction('generateChatSummary');
      setShowLoginModal(true);
      return;
    }

    const cleanMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(({ role, content }) => ({ role, content }));

    if (cleanMessages.length === 0) return;

    try {
      setIsGeneratingChatSummary(true);
      setSaveSummaryResult(null);
      const response = await axios.post(`${API_URL}/api/consultation-summaries/generate`, {
        messages: cleanMessages,
      });

      if (response.data.success) {
        setChatSummary(response.data.summary);
        setSummaryModelUsed(response.data.model_used || '');
        setShowChatSummaryModal(true);
      } else {
        alert(t('chat.summaryFailed'));
      }
    } catch (error) {
      console.error('Error generating chat summary:', error);
      alert(t('chat.summaryGenerateFailed', { error: error.response?.data?.error || error.message }));
    } finally {
      setIsGeneratingChatSummary(false);
    }
  };

  const handleSaveSummary = async () => {
    const cleanMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(({ role, content }) => ({ role, content }));

    try {
      setIsSavingSummary(true);
      const response = await axios.post(`${API_URL}/api/consultation-summaries/save`, {
        summary: chatSummary,
        messages: cleanMessages,
        model_used: summaryModelUsed,
      });

      if (response.data.success) {
        setSaveSummaryResult({ success: true, message: t('chat.summarySaved') });
      } else {
        setSaveSummaryResult({ success: false, message: t('chat.summarySaveFailed') });
      }
    } catch (error) {
      console.error('Error saving summary:', error);
      setSaveSummaryResult({ success: false, message: error.response?.data?.error || error.message });
    } finally {
      setIsSavingSummary(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Ensure patient portal is remembered so Home button returns here
    localStorage.setItem("last_portal", "/personal");
    if (pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      setTimeout(() => sendMessage(msg), 100);
    }
    if (pendingAction === 'generateSummary') {
      setPendingAction(null);
      setTimeout(() => handleOpenEndConsultationModal(), 100);
    }
    if (pendingAction === 'generateChatSummary') {
      setPendingAction(null);
      setTimeout(() => handleGenerateChatSummary(), 100);
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setPendingMessage(null);
    setPendingAction(null);
  };

  // Recording functions — Web Speech API only (no backend processing)
  const startRecording = async () => {
    try {
      // Clear previous session's transcript
      setTranscriptHistory("");
      setSnapshot("");
      setConversationSummary("");

      // Get microphone access (needed for Web Speech API in some browsers)
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      streamRef.current = stream;

      // Start Web Speech API for instant transcription
      startWebSpeechRecognition();
    } catch (error) {
      console.error("Microphone access error:", error);
      setConsulting(false);
    }
  };

  // Web Speech API for instant transcription
  const startWebSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log("Web Speech API not supported in this browser");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interim = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }
        // Accumulate final results into transcriptHistory (instant, no gaps)
        if (finalText.trim()) {
          setTranscriptHistory(prev => prev ? prev + " " + finalText.trim() : finalText.trim());
        }
        // Always update interim (clear stale text when results finalize)
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.log("Web Speech API error:", event.error);
        // Don't stop recording on speech recognition errors
      };

      recognition.onend = () => {
        // Restart if still consulting
        if (consulting && streamRef.current?.active) {
          try {
            recognition.start();
          } catch (e) {
            console.log("Could not restart Web Speech:", e);
          }
        }
      };

      recognition.start();
      speechRecognitionRef.current = recognition;
      console.log("Web Speech API started for instant transcription");
    } catch (error) {
      console.log("Failed to start Web Speech API:", error);
    }
  };

  const stopWebSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {
        console.log("Error stopping speech recognition:", e);
      }
      speechRecognitionRef.current = null;
    }
    setInterimTranscript("");
  };

  const stopRecording = () => {
    // Stop microphone
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    // Stop Web Speech recognition
    stopWebSpeechRecognition();

    // Keep transcriptHistory visible after stopping — cleared on next start
  };

  // Auth gate state for summary/email actions
  const [pendingAction, setPendingAction] = useState(null);

  // Email summary functions
  const handleOpenEndConsultationModal = async () => {
    // These backend endpoints require authentication
    if (!isAuthenticated && !loading) {
      setPendingAction('generateSummary');
      setShowLoginModal(true);
      return;
    }
    setPatientEmail('patient@example.com'); // Default email
    setAiSummary('');
    setEmailResult(null);
    setShowEndConsultationModal(true);
    await generateAISummary();
  };

  const generateAISummary = async () => {
    try {
      setIsGeneratingSummary(true);

      const response = await axios.post(`${API_URL}/api/generate-consultation-summary`, {
        patient_info: {
          full_name: "Patient Portal User",
          mrn: "PORTAL-USER"
        },
        consultation_data: {
          conversation_summary: conversationSummary || transcriptHistory,
          patient_snapshot: snapshot || conversationSummary || transcriptHistory,
          conversation_history: snapshot || transcriptHistory,
          new_diagnoses: [],
          new_medications: []
        }
      });

      if (response.data.success) {
        setAiSummary(response.data.summary);
        console.log("AI summary generated successfully");
      } else {
        alert(t('chat.summaryFailed'));
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert(t('chat.summaryGenerateFailed', { error: error.response?.data?.error || error.message }));
      setAiSummary(t('chat.summaryError'));
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSendEmail = async () => {
    if (!patientEmail) {
      alert(t('consultation.enterEmail'));
      return;
    }

    if (!aiSummary) {
      alert(t('consultation.enterSummary'));
      return;
    }

    try {
      setIsSendingEmail(true);

      const response = await axios.post(`${API_URL}/api/end-consultation`, {
        patient_email: patientEmail,
        consultation_summary: aiSummary,
        patient_info: {
          full_name: "Patient Portal User",
          mrn: "PORTAL-USER"
        }
      });

      setEmailResult(response.data);
      console.log("Email sent successfully:", response.data);
    } catch (error) {
      console.error("Error sending email:", error);
      setEmailResult({
        success: false,
        message: error.response?.data?.error || error.message
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] p-8 m-6">
        <div className="flex items-center justify-between">
          {/* Left - Title */}
          <div>
            <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-lg">
              {t('header.title')}
            </h1>
            <p className="text-white/80 text-sm mt-2">{t('header.subtitle')}</p>
          </div>

          {/* Right - Home & Auth */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl font-semibold"
              title={t('common:buttons.goToHome')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{t('common:buttons.home')}</span>
            </button>
            {isAuthenticated ? (
              <ProfileDropdown variant="dark" />
            ) : (
              <button
                onClick={() => { setPendingMessage(null); setShowLoginModal(true); }}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl font-semibold"
              >
                <span className="font-medium">{t('common:buttons.signIn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-screen-2xl mx-auto">
        {/* Left Panel - Chatbot */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] flex flex-col" style={{height: 'calc(100vh - 250px)'}}>
          {/* Chat Header */}
          <div className="bg-[rgba(59,130,246,0.08)] p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <AiIcon className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <div>
                <h2 className="text-[#1e293b] font-bold text-xl">{t('chat.assistantName')}</h2>
                <p className="text-[#475569] text-xs">{t('chat.assistantSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {messages.some(m => m.role === 'user') && (
                <button
                  onClick={handleGenerateChatSummary}
                  disabled={isGeneratingChatSummary}
                  className="text-[#3b82f6] hover:text-[#2563eb] text-sm px-3 py-1 rounded-lg hover:bg-[rgba(59,130,246,0.08)] transition-colors font-medium disabled:opacity-50"
                  title={t('chat.generateSummaryTitle')}
                >
                  {isGeneratingChatSummary ? t('common:states.generating') : t('chat.summarize')}
                </button>
              )}
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-[#475569] hover:text-[#1e293b] text-sm px-3 py-1 rounded-lg hover:bg-[rgba(59,130,246,0.08)] transition-colors"
                  title={t('chat.clearHistory')}
                >
                  {t('common:buttons.clear')}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f4f8]">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="mb-4"><AiIcon className="w-12 h-12 text-[#3b82f6] mx-auto" /></div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">{t('chat.welcomeTitle')}</h3>
                <p className="text-[#475569] mb-4">
                  {t('chat.welcomeDescription')}
                </p>
                {conversationSummary && (
                  <div className="bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-lg p-3 text-sm text-left max-w-md mx-auto">
                    <p className="font-semibold text-[#1e293b] mb-1">{t('consultation.summaryAvailable')}</p>
                    <p className="text-[#3b82f6] text-xs line-clamp-3">{conversationSummary}</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] ${
                    msg.role === 'user'
                      ? 'bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white'
                      : msg.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-[#1e293b] border border-[rgba(15,23,42,0.1)]'
                  }`}
                >
                  {msg.role === 'user' && (
                    <div className="flex items-center space-x-2 mb-1 opacity-80">
                      <span className="text-xs font-semibold">{t('chat.you')}</span>
                    </div>
                  )}
                  {msg.role === 'assistant' && !msg.isError && (
                    <div className="flex items-center space-x-2 mb-2">
                      <AiIcon className="w-6 h-6 text-[#3b82f6]" />
                      <span className="text-xs font-semibold text-[#3b82f6]">EboAI</span>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    {msg.role === 'assistant' && msg.formatted ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: msg.formatted }}
                        className="text-sm leading-relaxed"
                      />
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoadingChat && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)]">
                  <div className="flex items-center space-x-2">
                    <AiIcon className="w-6 h-6 text-[#3b82f6]" />
                    <span className="text-xs font-semibold text-[#3b82f6]">EboAI</span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <div className="w-2 h-2 bg-[#60a5fa] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
            <div className="px-4 py-3 bg-[rgba(59,130,246,0.08)] border-t border-[rgba(59,130,246,0.2)]">
              <p className="text-xs font-semibold text-[#1e293b] mb-2 flex items-center"><LightbulbIcon className="w-4 h-4 text-[#3b82f6] mr-1 inline" /> {t('chat.suggestedQuestions')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-white hover:bg-[rgba(59,130,246,0.08)] text-[#3b82f6] rounded-full text-xs border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] transition-colors shadow-sm hover:shadow"
                    disabled={isLoadingChat}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-[rgba(15,23,42,0.1)] bg-white rounded-b-xl">
            <div className="flex space-x-2 items-center">

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={t('chat.inputPlaceholder')}
                className="flex-1 px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-xl focus:outline-none focus:border-[#3b82f6] text-sm"
                disabled={isLoadingChat}
              />
              {/* Plus button with popup */}
              <div className="relative flex-shrink-0" ref={plusMenuRef}>
                <button
                  onClick={() => setShowPlusMenu(prev => !prev)}
                  disabled={isUploadingReport}
                  className="w-11 h-11 flex items-center justify-center rounded-xl border border-[rgba(15,23,42,0.15)] bg-[#f8fafc] hover:bg-[rgba(59,130,246,0.08)] hover:border-[#3b82f6] text-[#475569] hover:text-[#3b82f6] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl font-light"
                  title="More options"
                >
                  {isUploadingReport ? (
                    <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    '+'
                  )}
                </button>

                {showPlusMenu && (
                  <div className="absolute bottom-14 right-0 bg-white border border-[rgba(15,23,42,0.1)] rounded-xl shadow-[0_8px_30px_rgba(15,23,42,0.12)] py-1.5 min-w-[180px] z-20">
                    <div className="relative group">
                      <button
                        onClick={() => isAuthenticated && labReportInputRef.current?.click()}
                        disabled={!isAuthenticated}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors text-left ${
                          isAuthenticated
                            ? 'text-[#1e293b] hover:bg-[rgba(59,130,246,0.06)] cursor-pointer'
                            : 'text-[#94a3b8] cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className="text-base">📋</span>
                        <span>Upload lab report</span>
                        {!isAuthenticated && <span className="ml-auto text-xs">🔒</span>}
                      </button>
                      {!isAuthenticated && (
                        <div className="absolute bottom-full right-0 mb-2 w-52 bg-[#1e293b] text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                          You need to be logged in to upload a lab report.
                          <div className="absolute top-full right-4 border-4 border-transparent border-t-[#1e293b]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <input
                  ref={labReportInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleLabReportUpload}
                />
              </div>

              <button
                onClick={() => sendMessage()}
                disabled={isLoadingChat || !input.trim()}
                className="px-6 py-3 bg-[#3b82f6] text-white rounded-xl btn-glow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-lg transition-all"
              >
                {isLoadingChat ? (
                  <span className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    <span>{t('common:states.thinking')}</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span>{t('common:buttons.send')}</span>
                    <span>→</span>
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-[#64748b] mt-2 text-center">
              {t('chat.inputHint')}
            </p>
            {!isAuthenticated && !loading && (
              <p className="text-xs text-[#94a3b8] mt-1 text-center">
                {t('chat.freeMessagesRemaining', { count: Math.max(0, FREE_MESSAGE_LIMIT - messages.filter(m => m.role === 'user').length) })} — <button onClick={() => setShowLoginModal(true)} className="text-[#3b82f6] hover:underline">{t('common:buttons.signIn').toLowerCase()}</button> {t('chat.forUnlimited')}
              </p>
            )}
          </div>
        </div>

        {/* Right Panel - Consultation Controls */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Consultation Panel */}
          <div className="bg-white/95 backdrop-blur-[20px] p-6 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(15,23,42,0.1)] space-y-4">
            <div className="bg-[rgba(59,130,246,0.08)] rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg overflow-hidden flex items-center justify-center">
                  <MicrophoneIcon className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1e293b]">{t('consultation.audioRecording')}</h2>
                  <p className="text-xs text-[#475569]">{t('consultation.recordConsultation')}</p>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-xl text-white font-bold text-base shadow-lg transform transition-all duration-300 hover:scale-105 ${consulting
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                }`}
              onClick={() => setConsulting(!consulting)}
            >
              {consulting ? t('consultation.stopRecording') : t('consultation.startRecording')}
            </button>

            {consulting && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-red-700">
                    {t('consultation.recordingInProgress')}
                  </span>
                </div>
              </div>
            )}

            {/* Live Transcription Caption Box - Stays visible after stopping */}
            {(consulting || transcriptHistory) && (
              <div className="bg-[#f8fafc] rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] overflow-hidden">
                <div className="bg-[rgba(59,130,246,0.08)] px-3 py-1.5 flex items-center space-x-2">
                  {consulting ? (
                    <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-2.5 h-2.5 bg-[#3b82f6]/60 rounded-full"></div>
                  )}
                  <span className="text-[#1e293b] font-semibold text-xs">
                    {consulting ? t('consultation.liveTranscription') : t('consultation.transcription')}
                  </span>
                </div>
                <div className="p-3 max-h-48 overflow-y-auto">
                  {(transcriptHistory || interimTranscript) ? (
                    <div className="text-xs whitespace-pre-wrap leading-relaxed text-[#1e293b] bg-white/70 p-2 rounded-lg border border-[rgba(15,23,42,0.1)]">
                      {transcriptHistory}
                      {interimTranscript && (
                        <span className="text-[#64748b] italic">
                          {transcriptHistory ? " " : ""}{interimTranscript}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#64748b] italic text-center py-1">
                      {t('consultation.listening')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Show Conversation / Generate Summary buttons */}
            {transcriptHistory && !consulting && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSnapshot(transcriptHistory);
                    setConversationSummary(transcriptHistory);
                  }}
                  className="flex-1 py-2 rounded-xl text-white font-semibold text-xs bg-[#3b82f6] btn-glow hover:opacity-90 transition-all shadow-lg"
                >
                  {t('consultation.showConversation')}
                </button>
                <button
                  onClick={handleOpenEndConsultationModal}
                  className="flex-1 py-2 rounded-xl text-white font-semibold text-xs bg-[#3b82f6] btn-glow hover:opacity-90 transition-all shadow-lg"
                >
                  {t('consultation.generateSummary')}
                </button>
              </div>
            )}

            {!consulting && !transcriptHistory && (
              <div className="text-center text-sm text-[#64748b]">
                {t('consultation.pressStartRecording')}
              </div>
            )}
          </div>

          {/* Previous Symptoms */}
          {isAuthenticated && (
            <div className="bg-white/95 backdrop-blur-[20px] p-6 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(15,23,42,0.1)] space-y-4">
              <div className="flex items-center space-x-2">
                <ClipboardIcon className="w-5 h-5 text-[#3b82f6]" />
                <h3 className="text-base font-bold text-[#1e293b]">Previous Symptoms</h3>
              </div>

              {isSymptomsLoading ? (
                <div className="flex items-center justify-center py-4 space-x-2">
                  <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-[#64748b]">Loading symptoms...</span>
                </div>
              ) : previousSymptoms.length === 0 ? (
                <p className="text-sm text-[#94a3b8] italic text-center py-2">No previous symptoms recorded.</p>
              ) : (
                <ul className="space-y-2">
                  {previousSymptoms.map((symptom, idx) => {
                    const label = typeof symptom === 'string' ? symptom : symptom.symptom || symptom.name || JSON.stringify(symptom);
                    const severity = typeof symptom === 'object' ? (symptom.severity || symptom.severity_level || '') : '';
                    const severityStyles = {
                      mild:     'bg-green-100 text-green-700 border-green-200',
                      moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                      severe:   'bg-orange-100 text-orange-700 border-orange-200',
                      critical: 'bg-red-100 text-red-700 border-red-200',
                    };
                    const severityClass = severityStyles[severity?.toLowerCase()] || 'bg-[rgba(59,130,246,0.08)] text-[#3b82f6] border-[rgba(59,130,246,0.2)]';
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-2 bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.15)] rounded-lg px-3 py-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0"></span>
                        <span className="text-sm text-[#1e293b] leading-snug flex-1">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                        {severity && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 capitalize ${severityClass}`}>
                            {severity}
                          </span>
                        )}
                        {symptom.date && (
                          <span className="text-xs text-[#94a3b8] flex-shrink-0">{new Date(symptom.date).toLocaleDateString()}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Conversation / Summary Display */}
          {conversationSummary && (
            <div className="bg-white/95 backdrop-blur-[20px] p-6 rounded-xl shadow-[0_10px_30px_rgba(15,23,42,0.12)] border border-[rgba(15,23,42,0.1)] space-y-4">
              <h3 className="text-lg font-bold text-[#1e293b] flex items-center space-x-2">
                <ClipboardIcon className="w-6 h-6 text-[#3b82f6]" />
                <span>{t('consultation.consultationSummary')}</span>
              </h3>
              <div className="bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-lg p-3">
                <p className="text-sm text-[#1e293b] whitespace-pre-wrap">{conversationSummary}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ChatboxModal - Secondary AI Chat */}
      <ChatboxModal
        isOpen={showChatboxModal}
        onClose={() => setShowChatboxModal(false)}
        patientSummary={conversationSummary || t('consultation.noSummaryAvailable')}
      />

      {/* Login Modal */}
      {/* <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSuccess={handleLoginSuccess}
        portalTitle={t('header.title')}
        portalIcon={UserIcon}
        defaultRole="patient"
        message={pendingAction === 'generateSummary'
          ? t('auth.signInForSummaries')
          : pendingAction === 'generateChatSummary'
          ? t('auth.signInForChatSummaries')
          : pendingMessage
          ? t('auth.signInToContinueChat')
          : undefined}
      /> */}

      {/* Chat Summary Modal */}
      {showChatSummaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[rgba(59,130,246,0.08)] p-6 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1e293b]">{t('chat.chatSummary')}</h2>
                  <p className="text-[#475569] text-sm mt-1">
                    {t('chat.aiGeneratedSummary')}
                    {summaryModelUsed && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(59,130,246,0.1)] text-[#3b82f6]">
                        {summaryModelUsed}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => { setShowChatSummaryModal(false); setSaveSummaryResult(null); }}
                  className="text-[#475569] hover:text-[#1e293b] text-2xl w-8 h-8 flex items-center justify-center hover:bg-[rgba(59,130,246,0.08)] rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] rounded-lg p-4">
                <div className="text-sm text-[#1e293b] whitespace-pre-wrap leading-relaxed">
                  {chatSummary}
                </div>
              </div>

              {/* Save Result */}
              {saveSummaryResult && (
                <div className={`p-4 rounded-lg border-2 ${saveSummaryResult.success
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {saveSummaryResult.success ? <CheckCircleIcon className="w-6 h-6 text-green-600" /> : <XCircleIcon className="w-6 h-6 text-red-600" />}
                    <span className="font-semibold">{saveSummaryResult.message}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveSummary}
                  disabled={isSavingSummary || saveSummaryResult?.success}
                  className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-[#3b82f6] btn-glow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isSavingSummary ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common:states.saving')}</span>
                    </span>
                  ) : saveSummaryResult?.success ? (
                    <span className="flex items-center justify-center space-x-2"><CheckCircleIcon className="w-5 h-5" /><span>{t('common:states.saved')}</span></span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2"><ClipboardIcon className="w-5 h-5" /><span>{t('chat.saveToMyRecords')}</span></span>
                  )}
                </button>
                <button
                  onClick={() => { setShowChatSummaryModal(false); setSaveSummaryResult(null); }}
                  className="px-6 py-3 rounded-xl text-[#475569] font-semibold bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] transition-colors"
                >
                  {t('common:buttons.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Summary Modal */}
      {showEndConsultationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[rgba(59,130,246,0.08)] p-6 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#1e293b]">{t('consultation.sendSummary')}</h2>
                  <p className="text-[#475569] text-sm mt-1">{t('consultation.emailSummaryToPatient')}</p>
                </div>
                <button
                  onClick={() => setShowEndConsultationModal(false)}
                  className="text-[#475569] hover:text-[#1e293b] text-2xl w-8 h-8 flex items-center justify-center hover:bg-[rgba(59,130,246,0.08)] rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('consultation.patientEmailAddress')}
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              {/* AI Summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#475569]">
                    {t('consultation.consultationSummary')}
                  </label>
                  {isGeneratingSummary && (
                    <span className="text-xs text-[#3b82f6] flex items-center space-x-1">
                      <div className="w-3 h-3 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common:states.generating')}</span>
                    </span>
                  )}
                </div>
                <textarea
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  placeholder={t('consultation.summaryPlaceholder')}
                  rows={10}
                  className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] font-mono text-sm"
                />
              </div>

              {/* Email Result */}
              {emailResult && (
                <div className={`p-4 rounded-lg border-2 ${emailResult.success
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : 'bg-red-50 border-red-300 text-red-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    {emailResult.success ? <CheckCircleIcon className="w-6 h-6 text-green-600" /> : <XCircleIcon className="w-6 h-6 text-red-600" />}
                    <span className="font-semibold">
                      {emailResult.success ? t('consultation.emailSentSuccess') : t('consultation.emailSentFailed')}
                    </span>
                  </div>
                  {emailResult.message && (
                    <p className="text-sm mt-1 ml-7">{emailResult.message}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !patientEmail || !aiSummary}
                  className="flex-1 px-6 py-3 rounded-xl text-white font-semibold bg-[#3b82f6] btn-glow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {isSendingEmail ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('common:states.sending')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2"><MailIcon className="w-5 h-5" /><span>{t('consultation.sendEmail')}</span></span>
                  )}
                </button>
                <button
                  onClick={() => setShowEndConsultationModal(false)}
                  className="px-6 py-3 rounded-xl text-[#475569] font-semibold bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] transition-colors"
                >
                  {t('common:buttons.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}