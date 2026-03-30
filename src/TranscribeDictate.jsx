import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "./config";
import Header from "./components/Header";
import { useAuth } from '@/context/AuthContext';

// Known Whisper hallucination phrases (generated on silence/low audio)
const WHISPER_HALLUCINATIONS = [
  "thank you for watching",
  "thanks for watching",
  "please subscribe",
  "subscribe to my channel",
  "like and subscribe",
  "see you next time",
  "thank you for listening",
  "thanks for listening",
];

const isWhisperHallucination = (text) => {
  const lower = text.toLowerCase().trim();
  return WHISPER_HALLUCINATIONS.some(h => lower.includes(h));
};

const RECORDING_INTERVAL_MS = 10000;
const WS_SILENCE_TIMEOUT_MS = 8000; // Auto-stop Web Speech after 8 seconds of silence

const AUDIO_CONSTRAINTS = {
  audio: {
    channelCount: 1,
    sampleRate: 16000,
    echoCancellation: true,
    noiseSuppression: true,
  }
};

const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

function TranscribeDictate() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);
  const { token } = useAuth();
  const [error, setError] = useState("");

  // ─── Web Speech API states ───
  const [wsIsRecording, setWsIsRecording] = useState(false);
  const [wsTranscript, setWsTranscript] = useState("");
  const [wsInterim, setWsInterim] = useState("");
  const [wsIsSupported, setWsIsSupported] = useState(false);
  const [wsStartTime, setWsStartTime] = useState(null);
  const [wsWordCount, setWsWordCount] = useState(0);
  const wsSpeechRef = useRef(null);
  const wsStreamRef = useRef(null); // mic stream to keep alive for auto-restart
  const wsSilenceTimerRef = useRef(null); // 3s silence auto-stop
  const wsLastSpeechRef = useRef(null);

  // ─── Whisper states ───
  const [whIsRecording, setWhIsRecording] = useState(false);
  const [whTranscript, setWhTranscript] = useState("");
  const [whProcessingCount, setWhProcessingCount] = useState(0);
  const [whStartTime, setWhStartTime] = useState(null);
  const [whWordCount, setWhWordCount] = useState(0);
  const whMediaRecorderRef = useRef(null);
  const whStreamRef = useRef(null);
  const whSilenceTimerRef = useRef(null); // 3s silence auto-stop
  const whLastSpeechRef = useRef(null);

  // ─── AI Summary states (shared) ───
  const [summary, setSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setWsIsSupported(true);
    }
  }, []);

  // ═══════════════════════════════════════════
  // WEB SPEECH API — browser-native, instant
  // ═══════════════════════════════════════════

  const wsStart = async () => {
    if (!wsIsSupported) {
      setError(t('functions:transcribe.webSpeechNotSupported', 'Web Speech API is not supported in this browser'));
      return;
    }

    setWsTranscript("");
    setWsInterim("");
    setWsWordCount(0);
    setError("");

    // Request mic so browser shows recording indicator
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      wsStreamRef.current = stream;
    } catch (err) {
      setError(t('functions:transcribe.micError', 'Failed to access microphone. Please check permissions.'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
      // Any speech activity resets the silence timer
      wsLastSpeechRef.current = Date.now();
      if (finalText.trim()) {
        setWsTranscript(prev => {
          const updated = prev ? prev + " " + finalText.trim() : finalText.trim();
          setWsWordCount(updated.split(/\s+/).filter(Boolean).length);
          return updated;
        });
      }
      setWsInterim(interim);
    };

    recognition.onerror = (event) => {
      console.log("Web Speech error:", event.error);
    };

    recognition.onend = () => {
      // Auto-restart if still recording
      if (wsStreamRef.current?.active) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Could not restart Web Speech:", e);
        }
      }
    };

    try {
      recognition.start();
      wsSpeechRef.current = recognition;
      setWsIsRecording(true);
      setWsStartTime(Date.now());
      wsLastSpeechRef.current = Date.now();

      // Start silence detection — check every 500ms
      wsSilenceTimerRef.current = setInterval(() => {
        if (wsLastSpeechRef.current && Date.now() - wsLastSpeechRef.current > WS_SILENCE_TIMEOUT_MS) {
          console.log("Web Speech: 8s silence detected, auto-stopping");
          wsStop();
        }
      }, 500);
    } catch (e) {
      setError(t('functions:transcribe.webSpeechStartError', 'Could not start Web Speech API'));
    }
  };

  const wsStop = () => {
    if (wsSilenceTimerRef.current) {
      clearInterval(wsSilenceTimerRef.current);
      wsSilenceTimerRef.current = null;
    }
    if (wsSpeechRef.current) {
      try { wsSpeechRef.current.stop(); } catch (e) { /* ignore */ }
      wsSpeechRef.current = null;
    }
    if (wsStreamRef.current) {
      wsStreamRef.current.getTracks().forEach(t => t.stop());
      wsStreamRef.current = null;
    }
    setWsInterim("");
    setWsIsRecording(false);
  };

  // ═══════════════════════════════════════════
  // WHISPER — OpenAI backend, 10s chunks
  // ═══════════════════════════════════════════

  const whSendChunk = async (audioBlob) => {
    const MIN_AUDIO_BYTES = 10 * 1024;
    if (!audioBlob || audioBlob.size === 0) return;
    if (audioBlob.size < MIN_AUDIO_BYTES) {
      console.log(`Audio chunk too small (${audioBlob.size} bytes) — likely silence, skipping.`);
      return;
    }

    setWhProcessingCount(prev => prev + 1);

    const formData = new FormData();
    formData.append("audio", audioBlob, "clip.webm");
    formData.append("patient_data", JSON.stringify({
      patient_identification: { full_name: "Transcription User" },
      diagnoses: [], medications: [], vital_signs: [], labs: []
    }));

    try {
      const response = await fetch(`${API_URL}/api/record-consultation-stream`, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData
      });

      if (!response.ok) {
        setWhProcessingCount(prev => Math.max(0, prev - 1));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const eventMatch = line.match(/event:\s*(\w+)/);
          const dataMatch = line.match(/data:\s*({.*})/s);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (eventType === 'transcription_complete') {
              if (data.transcript && data.transcript.trim() && !isWhisperHallucination(data.transcript)) {
                const whisperText = data.transcript.trim();
                // Speech detected — reset silence timer
                whLastSpeechRef.current = Date.now();
                setWhTranscript(prev => {
                  const updated = prev ? prev + " " + whisperText : whisperText;
                  setWhWordCount(updated.split(/\s+/).filter(Boolean).length);
                  return updated;
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Whisper error:", err);
    } finally {
      setWhProcessingCount(prev => Math.max(0, prev - 1));
    }
  };

  const whStart = async () => {
    try {
      setWhTranscript("");
      setWhWordCount(0);
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      whStreamRef.current = stream;

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recordChunk = () => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType || "",
          audioBitsPerSecond: 64000,
        });
        let localChunks = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) localChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          if (localChunks.length > 0) {
            const blob = new Blob(localChunks, { type: mediaRecorder.mimeType });
            setTimeout(() => {
              if (blob.size > 0) {
                whSendChunk(blob);
              }
            }, 100);
          }
          if (whStreamRef.current && whStreamRef.current.active) {
            setTimeout(recordChunk, 0);
          }
        };

        mediaRecorder.start();
        whMediaRecorderRef.current = mediaRecorder;

        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.requestData();
            mediaRecorder.stop();
          }
        }, RECORDING_INTERVAL_MS);
      };

      recordChunk();
      setWhIsRecording(true);
      setWhStartTime(Date.now());
    } catch (err) {
      setError(t('functions:transcribe.micError', 'Failed to access microphone. Please check permissions.'));
      console.error("Whisper mic error:", err);
    }
  };

  const whStop = () => {
    if (whMediaRecorderRef.current?.state === "recording") {
      whMediaRecorderRef.current.stop();
    }
    whStreamRef.current?.getTracks().forEach((track) => track.stop());
    whMediaRecorderRef.current = null;
    whStreamRef.current = null;
    setWhIsRecording(false);
  };

  // ═══════════════════════════════════════════
  // SHARED: Start/Stop Both + Summary
  // ═══════════════════════════════════════════

  const startBoth = async () => {
    await wsStart();
    await whStart();
  };

  const stopBoth = () => {
    wsStop();
    whStop();
  };

  const bothRecording = wsIsRecording && whIsRecording;
  const eitherHasTranscript = wsTranscript || whTranscript;

  const handleGenerateSummary = async () => {
    const transcript = wsTranscript || whTranscript;
    if (!transcript) {
      setError(t('functions:transcribe.noTranscription', 'No transcription available to summarize'));
      return;
    }

    try {
      setIsGeneratingSummary(true);
      setError("");

      const response = await axios.post(`${API_URL}/api/generate-consultation-summary`, {
        patient_info: { full_name: "Transcription User" },
        consultation_data: {
          conversation_summary: transcript,
          conversation_history: transcript,
          patient_snapshot: transcript,
          new_diagnoses: [],
          new_medications: []
        }
      });

      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError(t('functions:transcribe.summaryError', 'Failed to generate summary'));
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      setError(`Failed to generate summary: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Elapsed time helper
  const formatElapsed = (startTime) => {
    if (!startTime) return "0:00";
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  // Force re-render for elapsed time display
  const [, setTick] = useState(0);
  useEffect(() => {
    if (wsIsRecording || whIsRecording) {
      const interval = setInterval(() => setTick(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [wsIsRecording, whIsRecording]);

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:transcribe.title')}
        subtitle={t('functions:transcribe.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Start/Stop Both Button */}
        <div className="flex justify-center">
          {!bothRecording ? (
            <button
              onClick={startBoth}
              className="px-10 py-4 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-xl font-bold text-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:opacity-90 transition-all transform hover:scale-105 btn-glow flex items-center space-x-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              <span>{t('functions:transcribe.startBoth', 'Start Both')}</span>
            </button>
          ) : (
            <button
              onClick={stopBoth}
              className="px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 animate-pulse flex items-center space-x-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              <span>{t('functions:transcribe.stopBoth', 'Stop Both')}</span>
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ═══ TWO PANELS SIDE BY SIDE ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ─── Panel 1: Web Speech API ─── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] overflow-hidden border-2 border-[rgba(59,130,246,0.3)] card-hover">
              {/* Header */}
              <div className="bg-[rgba(59,130,246,0.08)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[#1e293b] font-bold text-lg">{t('functions:transcribe.webSpeechTitle', 'Web Speech')}</h2>
                    <p className="text-[#475569] text-xs">{t('functions:transcribe.webSpeechDesc', 'Browser-native, instant, free')}</p>
                  </div>
                  {!wsIsRecording ? (
                    <button
                      onClick={wsStart}
                      disabled={wsIsRecording}
                      className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg font-semibold text-sm transition-all btn-glow"
                    >
                      {t('functions:transcribe.start', 'Start')}
                    </button>
                  ) : (
                    <button
                      onClick={wsStop}
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all animate-pulse"
                    >
                      {t('functions:transcribe.stop', 'Stop')}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between px-5 py-2 bg-[rgba(59,130,246,0.08)] border-b border-[rgba(15,23,42,0.1)] text-xs text-[#475569]">
                <div className="flex items-center space-x-4">
                  <span>{t('functions:transcribe.words', 'Words')}: <strong>{wsWordCount}</strong></span>
                  <span>{t('functions:transcribe.time', 'Time')}: <strong>{wsIsRecording ? formatElapsed(wsStartTime) : (wsStartTime ? formatElapsed(wsStartTime) : "—")}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  {wsIsRecording && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-semibold">{t('functions:transcribe.live', 'Live')}</span>
                    </>
                  )}
                  {!wsIsRecording && wsTranscript && (
                    <span className="text-[#475569] font-semibold">{t('functions:transcribe.stopped', 'Stopped')}</span>
                  )}
                </div>
              </div>

              {/* Transcript */}
              <div className="p-5 min-h-[200px] max-h-[400px] overflow-y-auto">
                {(wsTranscript || wsInterim) ? (
                  <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#1e293b]">
                    {wsTranscript}
                    {wsInterim && (
                      <span className="text-[#64748b] italic">
                        {wsTranscript ? " " : ""}{wsInterim}
                      </span>
                    )}
                  </div>
                ) : wsIsRecording ? (
                  <div className="text-sm text-[#64748b] italic text-center py-8">
                    {t('functions:transcribe.listening', 'Listening... speak to see transcription here')}
                  </div>
                ) : (
                  <div className="text-sm text-[#64748b]/50 italic text-center py-8">
                    {t('functions:transcribe.clickStart', 'Click Start to begin transcription')}
                  </div>
                )}
              </div>

              {/* Copy Button */}
              {wsTranscript && (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => copyToClipboard(wsTranscript)}
                    className="w-full py-2 bg-[rgba(59,130,246,0.08)] hover:bg-[rgba(59,130,246,0.15)] text-[#3b82f6] rounded-lg text-sm font-semibold transition-all"
                  >
                    {t('functions:transcribe.copyTranscript', 'Copy Transcript')}
                  </button>
                </div>
              )}
            </div>

            {/* Web Speech API Info */}
            <div className="bg-[rgba(59,130,246,0.08)] rounded-xl p-4 border border-[rgba(59,130,246,0.2)] text-xs text-[#475569] space-y-1">
              <div className="font-semibold">{t('functions:transcribe.howItWorks', 'How it works')}:</div>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{t('functions:transcribe.webSpeechInfo1', 'Runs entirely in the browser (Chrome/Edge)')}</li>
                <li>{t('functions:transcribe.webSpeechInfo2', 'Instant results — no network latency')}</li>
                <li>{t('functions:transcribe.webSpeechInfo3', 'Free — no API costs')}</li>
                <li>{t('functions:transcribe.webSpeechInfo4', 'Lower accuracy for medical/technical terms')}</li>
                <li>{t('functions:transcribe.webSpeechInfo5', 'Requires internet (uses Google\'s servers)')}</li>
              </ul>
            </div>
          </div>

          {/* ─── Panel 2: Whisper ─── */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] overflow-hidden border-2 border-[rgba(59,130,246,0.3)] card-hover">
              {/* Header */}
              <div className="bg-[rgba(59,130,246,0.08)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[#1e293b] font-bold text-lg">{t('functions:transcribe.whisperTitle', 'OpenAI Whisper')}</h2>
                    <p className="text-[#475569] text-xs">{t('functions:transcribe.whisperDesc', 'Backend AI model, 10s chunks')}</p>
                  </div>
                  {!whIsRecording ? (
                    <button
                      onClick={whStart}
                      disabled={whIsRecording}
                      className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-lg font-semibold text-sm transition-all btn-glow"
                    >
                      {t('functions:transcribe.start', 'Start')}
                    </button>
                  ) : (
                    <button
                      onClick={whStop}
                      className="px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all animate-pulse"
                    >
                      {t('functions:transcribe.stop', 'Stop')}
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between px-5 py-2 bg-[rgba(59,130,246,0.08)] border-b border-[rgba(15,23,42,0.1)] text-xs text-[#475569]">
                <div className="flex items-center space-x-4">
                  <span>{t('functions:transcribe.words', 'Words')}: <strong>{whWordCount}</strong></span>
                  <span>{t('functions:transcribe.time', 'Time')}: <strong>{whIsRecording ? formatElapsed(whStartTime) : (whStartTime ? formatElapsed(whStartTime) : "—")}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  {whIsRecording && whProcessingCount > 0 && (
                    <>
                      <div className="w-4 h-4 border-2 border-[rgba(59,130,246,0.3)] border-t-[#3b82f6] rounded-full animate-spin"></div>
                      <span className="text-[#3b82f6] font-semibold">{t('functions:transcribe.processing', 'Processing')}</span>
                    </>
                  )}
                  {whIsRecording && whProcessingCount === 0 && (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-semibold">{t('functions:transcribe.recording', 'Recording')}</span>
                    </>
                  )}
                  {!whIsRecording && whTranscript && (
                    <span className="text-[#475569] font-semibold">{t('functions:transcribe.stopped', 'Stopped')}</span>
                  )}
                </div>
              </div>

              {/* Transcript */}
              <div className="p-5 min-h-[200px] max-h-[400px] overflow-y-auto">
                {whTranscript ? (
                  <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#1e293b]">
                    {whTranscript}
                  </div>
                ) : whIsRecording ? (
                  <div className="text-sm text-[#64748b] italic text-center py-8">
                    {t('functions:transcribe.recordingHint', 'Recording... first results appear after ~10 seconds')}
                  </div>
                ) : (
                  <div className="text-sm text-[#64748b]/50 italic text-center py-8">
                    {t('functions:transcribe.clickStart', 'Click Start to begin transcription')}
                  </div>
                )}
              </div>

              {/* Copy Button */}
              {whTranscript && (
                <div className="px-5 pb-4">
                  <button
                    onClick={() => copyToClipboard(whTranscript)}
                    className="w-full py-2 bg-[rgba(59,130,246,0.08)] hover:bg-[rgba(59,130,246,0.15)] text-[#3b82f6] rounded-lg text-sm font-semibold transition-all"
                  >
                    {t('functions:transcribe.copyTranscript', 'Copy Transcript')}
                  </button>
                </div>
              )}
            </div>

            {/* Whisper Info */}
            <div className="bg-[rgba(59,130,246,0.08)] rounded-xl p-4 border border-[rgba(59,130,246,0.2)] text-xs text-[#475569] space-y-1">
              <div className="font-semibold">{t('functions:transcribe.howItWorks', 'How it works')}:</div>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{t('functions:transcribe.whisperInfo1', 'Records 10-second audio chunks')}</li>
                <li>{t('functions:transcribe.whisperInfo2', 'Sends to backend for OpenAI Whisper processing')}</li>
                <li>{t('functions:transcribe.whisperInfo3', 'Higher accuracy for medical/technical terms')}</li>
                <li>{t('functions:transcribe.whisperInfo4', '~10s delay per chunk (upload + transcribe)')}</li>
                <li>{t('functions:transcribe.whisperInfo5', 'Uses OpenAI API credits')}</li>
                <li>{t('functions:transcribe.whisperInfo6', 'Hallucination filter applied (e.g. "Thank you for watching")')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generate Summary Button */}
        {eitherHasTranscript && (
          <div className="flex justify-center">
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="px-8 py-4 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-xl font-bold text-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:opacity-90 transition-all transform hover:scale-105 btn-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
            >
              {isGeneratingSummary ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('functions:transcribe.generatingSummary', 'Generating Summary...')}</span>
                </>
              ) : (
                <span>{t('functions:transcribe.generateSummary', 'Generate AI Summary')}</span>
              )}
            </button>
          </div>
        )}

        {/* AI Summary Result */}
        {summary && (
          <div className="bg-[rgba(59,130,246,0.08)] rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(59,130,246,0.2)] overflow-hidden card-hover">
            <div className="bg-[rgba(59,130,246,0.08)] px-4 py-3 flex items-center space-x-2">
              <span className="text-[#1e293b] font-bold text-lg">{t('functions:transcribe.aiSummary', 'AI Summary')}</span>
              <button
                onClick={() => copyToClipboard(summary)}
                className="ml-auto px-3 py-1 bg-[rgba(59,130,246,0.12)] hover:bg-[rgba(59,130,246,0.2)] text-[#3b82f6] rounded-lg text-xs font-semibold transition-all"
              >
                {t('functions:transcribe.copy', 'Copy')}
              </button>
            </div>
            <div className="p-5">
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#1e293b] bg-white/95 backdrop-blur-[20px] p-4 rounded-xl border border-[rgba(15,23,42,0.1)]">
                {summary}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TranscribeDictate;