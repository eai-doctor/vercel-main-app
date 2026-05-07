import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import chatApi from '@/api/chatApi';
import consultationApi from '@/api/consultationApi';
import { AUDIO_CONSTRAINTS, FREE_MESSAGE_LIMIT } from '../constants';
import { getStoredMessageCount, incrementMessageCount } from '../utils';

export const useHealthConsultation = (user, accessToken, isAuthenticated, isPatient, loading, openLogin) => {
  const { t } = useTranslation(['patient', 'common', 'chat']);

  // --- 1. Chat States ---
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('chat.welcomeGreeting') }]);
  const [input, setInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [activeReportId, setActiveReportId] = useState(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  
  // --- 2. Recording & Transcription States ---
  const [consulting, setConsulting] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState("");
  const [conversationSummary, setConversationSummary] = useState("");
  const [snapshot, setSnapshot] = useState("");
  
  // --- 3. Summary & Modal States ---
  const [chatSummary, setChatSummary] = useState('');
  const [showChatSummaryModal, setShowChatSummaryModal] = useState(false);
  const [isGeneratingChatSummary, setIsGeneratingChatSummary] = useState(false);
  const [summaryModelUsed, setSummaryModelUsed] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const [showPlusMenu, setShowPlusMenu] = useState(false);
  
  
  // --- 4. Refs ---
  const streamRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // --- 5. Chat Actions ---
  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoadingChat) return;

    if (!isAuthenticated &&!isPatient && !loading && !isPatient) {
      const currentCount = getStoredMessageCount();
      if (currentCount >= FREE_MESSAGE_LIMIT) {
        return { type: 'LIMIT_EXCEEDED', payload: textToSend };
      }
      incrementMessageCount();
    }

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInput('');
    setIsLoadingChat(true);

    try {
      const headers = { 'X-API-Key': '' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      const response = await chatApi.sendPatientMessage({
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
            location: user.location || '' 
          } 
        })
      }, headers);

      if (response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.response, 
          formatted: response.data.formatted_response 
        }]);
        await chatApi.saveMessage(textToSend, response.data.response, user?.id || "PORTAL-USER");
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: t('common:errors.chatError'), isError: true }]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // --- 6. Recording Actions ---
  const stopWebSpeechRecognition = useCallback(() => {
    try { speechRecognitionRef.current?.stop(); } catch {}
    speechRecognitionRef.current = null;
    setInterimTranscript("");
  }, []);

  const stopRecording = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    stopWebSpeechRecognition();
  }, [stopWebSpeechRecognition]);

  const startWebSpeechRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = true;
      r.lang = 'en-US';
      r.onresult = (e) => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const txt = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += txt; else interim += txt;
        }
        // console.log("transcript:", p => p ? p + " " + final.trim() : final.trim());
        if (final.trim()) setTranscriptHistory(p => p ? p + " " + final.trim() : final.trim());
        setInterimTranscript(interim);
      };
      r.onend = () => { if (consulting && streamRef.current?.active) { try { r.start(); } catch {} } };
      r.start();
      speechRecognitionRef.current = r;
    } catch {}
  }, [consulting]);

  const startRecording = async () => {
    console.log("Starting recording...");

    try {
      setTranscriptHistory("");
      setConversationSummary("");

      console.log("Requesting microphone...");

      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      } catch (err) {
        console.warn("Constraint failed, fallback to basic audio:", err);

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      startWebSpeechRecognition();

    } catch (err) {
      let message = "Microphone access failed.";

      switch (err?.name) {
        case "NotAllowedError":
          message = "Microphone permission denied. Please allow access.";
          break;
        case "NotFoundError":
          message = "No microphone device found.";
          break;
        case "NotReadableError":
          message = "Microphone is already in use by another app.";
          break;
        case "OverconstrainedError":
          message = "Audio constraints not supported.";
          break;
        case "SecurityError":
          message = "Microphone requires HTTPS.";
          break;
        default:
          message = err?.message || message;
      }

      alert(message);

      setConsulting(false);
    }
  };

  useEffect(() => {
    if (consulting) startRecording();
    else stopRecording();
    return () => stopRecording();
  }, [consulting, startWebSpeechRecognition, stopRecording]);

  // --- 7. Summary Actions ---
  const generateChatSummary = async () => {
      // const cleanMessages = messages
      //   .filter(m => m.role === 'user' || m.role === 'assistant')
      //   .map(({ role, content }) => ({ role, content }));

      // if (cleanMessages.length === 0) return;
      // if (cleanMessages.length < 10) {
      //   window.alert(t('chat:warning.chatSummaryTooShort'));
      //   return;
      // }
      setIsGeneratingChatSummary(true);

      const cleanMessages = [
  {
    "role": "assistant",
    "content": "Hello! I'm your personal health assistant. How can I help you today?"
  },
  {
    "role": "user",
    "content": "hi how are you"
  },
  {
    "role": "assistant",
    "content": "I'm doing well, thank you! How about yourself? Are you consulting for yourself or someone else today?"
  },
  {
    "role": "user",
    "content": "I used to cross my leg when i am seated. I don't know it is comming from that. i feel numb on my leg"
  },
  {
    "role": "assistant",
    "content": "I understand that must be concerning for you. Are you consulting for yourself or someone else regarding this issue?"
  },
  {
    "role": "user",
    "content": "myself, saebyeok, montreal, 20, female"
  },
  {
    "role": "assistant",
    "content": "Thank you for sharing that information, Saebyeok. I understand numbness can be worrying. Could you tell me more about the numbness on your leg — **how long it lasts** and if there are any **specific areas** where you feel it the most?"
  },
  {
    "role": "user",
    "content": "right upper side of knee and it lasts for 3 weeks now"
  },
  {
    "role": "assistant",
    "content": "Thank you for those details, Saebyeok. It's important to address numbness that has persisted for several weeks. Being a 20-year-old female in Montreal, one possibility could be **nerve compression**, perhaps from crossed legs, which may affect circulation or nerves. Have you experienced any other symptoms, such as **pain, tingling, or weakness** in that leg?"
  },
  {
    "role": "user",
    "content": "i feel i lose my tense on my right leg"
  },
  {
    "role": "assistant",
    "content": "I understand, Saebyeok. Losing tension in your leg might feel unsettling. Considering you are in Montreal, it's unlikely related to climate or region-specific conditions. However, given your age and gender, one possibility could be minor nerve or circulation issues from posture or habits such as crossing your legs. Another possibility could be **nerve entrapment** like meralgia paresthetica, which can occur in that area.\n\nTo be more certain, it would be helpful to know if you've noticed any **changes in physical activities** or if there were any **injuries** recently."
  }
      ];

      try {
        const response = await chatApi.generateConsultationSummaries(cleanMessages);
        if (response.data.success) {
          setChatSummary(response.data.summary);
          setShowChatSummaryModal(true);
          return response.data;
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsGeneratingChatSummary(false);
      }
    };

  const uploadLabReport = async (e) => {
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

  return {
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
    activeReportId, setActiveReportId,
    snapshot,
    setSnapshot,
    showChatSummaryModal,
    setShowChatSummaryModal,
    showPlusMenu, setShowPlusMenu,
    
    // Actions
    sendMessage,
    startRecording,
    stopRecording,
    generateChatSummary,
    uploadLabReport 
  };
};