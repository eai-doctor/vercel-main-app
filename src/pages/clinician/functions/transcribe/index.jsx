import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { useAuth } from '@/context/AuthContext';
import consultationApi from "@/api/consultationApi";

const WHISPER_HALLUCINATIONS = [
  "thank you for watching", "thanks for watching", "please subscribe",
  "subscribe to my channel", "like and subscribe", "see you next time",
  "thank you for listening", "thanks for listening",
];
const isWhisperHallucination = (text) => {
  const lower = text.toLowerCase().trim();
  return WHISPER_HALLUCINATIONS.some(h => lower.includes(h));
};

const RECORDING_INTERVAL_MS = 10000;
const WS_SILENCE_TIMEOUT_MS = 3000;
// ✅ FIX 1: Whisper silence timeout must be longer than the chunk interval.
// A 10-second chunk recording + upload latency means we can't stop after 3 s of
// "no new transcript" — the first result doesn't arrive until ~10-15 s in.
const WH_SILENCE_TIMEOUT_MS = 15000;

const AUDIO_CONSTRAINTS = {
  audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true }
};
const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001';
const copyToClipboard = (text) => navigator.clipboard.writeText(text);

function TranscribeDictate() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);
  const { token } = useAuth();
  const [error, setError] = useState("");

  // Web Speech
  const [wsIsRecording, setWsIsRecording] = useState(false);
  const [wsTranscript, setWsTranscript] = useState("");
  const [wsInterim, setWsInterim] = useState("");
  const [wsIsSupported, setWsIsSupported] = useState(false);
  const [wsStartTime, setWsStartTime] = useState(null);
  const [wsWordCount, setWsWordCount] = useState(0);
  const wsSpeechRef = useRef(null);
  const wsStreamRef = useRef(null);
  const wsSilenceTimerRef = useRef(null);
  const wsLastSpeechRef = useRef(null);

  // Whisper
  const [whIsRecording, setWhIsRecording] = useState(false);
  const [whTranscript, setWhTranscript] = useState("");
  const [whProcessingCount, setWhProcessingCount] = useState(0);
  const [whStartTime, setWhStartTime] = useState(null);
  const [whWordCount, setWhWordCount] = useState(0);
  const whMediaRecorderRef = useRef(null);
  const whStreamRef = useRef(null);
  const whSilenceTimerRef = useRef(null);
  const whLastSpeechRef = useRef(null);

  // Summary
  const [summary, setSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) setWsIsSupported(true);
  }, []);

  useEffect(() => {
    if (wsIsRecording || whIsRecording) {
      const interval = setInterval(() => setTick(t => t + 1), 1000);
      return () => clearInterval(interval);
    }
  }, [wsIsRecording, whIsRecording]);

  // ── Web Speech ───────────────────────────────────────────
  const wsStart = async () => {
    if (!wsIsSupported) { setError(t('functions:transcribe.webSpeechNotSupported')); return; }
    setWsTranscript(""); setWsInterim(""); setWsWordCount(0); setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      wsStreamRef.current = stream;
    } catch { setError(t('functions:transcribe.micError')); return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let interim = '', finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t; else interim += t;
      }
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
    recognition.onerror = () => {};
    recognition.onend = () => {
      if (wsStreamRef.current?.active) { try { recognition.start(); } catch {} }
    };
    try {
      recognition.start(); wsSpeechRef.current = recognition;
      setWsIsRecording(true); setWsStartTime(Date.now()); wsLastSpeechRef.current = Date.now();
      wsSilenceTimerRef.current = setInterval(() => {
        if (wsLastSpeechRef.current && Date.now() - wsLastSpeechRef.current > WS_SILENCE_TIMEOUT_MS) wsStop();
      }, 500);
    } catch { setError(t('functions:transcribe.webSpeechStartError')); }
  };

  const wsStop = () => {
    if (wsSilenceTimerRef.current) { clearInterval(wsSilenceTimerRef.current); wsSilenceTimerRef.current = null; }
    try { wsSpeechRef.current?.stop(); } catch {}
    wsSpeechRef.current = null;
    wsStreamRef.current?.getTracks().forEach(t => t.stop()); wsStreamRef.current = null;
    setWsInterim(""); setWsIsRecording(false);
  };

  // ── Whisper ──────────────────────────────────────────────
  const whSendChunk = async (audioBlob) => {
    if (!audioBlob || audioBlob.size < 30 * 1024) return;

    // ✅ FIX 2: Refresh the silence timer whenever we START sending a chunk,
    // not only when a transcript arrives. This prevents the 3-second timeout
    // from firing during the 10-second recording + upload window.
    whLastSpeechRef.current = Date.now();

    setWhProcessingCount(p => p + 1);
    const formData = new FormData();
    formData.append("audio", audioBlob, "clip.webm");
    formData.append("patient_data", JSON.stringify({
      patient_identification: { full_name: "Transcription User" },
      diagnoses: [], medications: [], vital_signs: [], labs: []
    }));
    try {
      const response = await consultationApi.recordConsultationStream(formData);
      const sseText = typeof response.data === 'string' ? response.data : '';
      const blocks = sseText.split('\n\n');
      for (const block of blocks) {
        if (!block.trim()) continue;
        const blockLines = block.split('\n');
        let eventName = '';
        let dataStr = '';
        for (const line of blockLines) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim();
          else if (line.startsWith('data:')) dataStr = line.slice(5).trim();
        }
        if (eventName === 'transcription_complete' && dataStr) {
          let data;
          try { data = JSON.parse(dataStr); } catch { continue; }
          if (data.transcript?.trim() && !isWhisperHallucination(data.transcript)) {
            whLastSpeechRef.current = Date.now();
            setWhTranscript(prev => {
              const updated = prev ? prev + " " + data.transcript.trim() : data.transcript.trim();
              setWhWordCount(updated.split(/\s+/).filter(Boolean).length);
              return updated;
            });
          }
        }
      }
    } catch (e) { console.error('whSendChunk error:', e); }
    finally { setWhProcessingCount(p => Math.max(0, p - 1)); }
  };

  const whStart = async () => {
    try {
      setWhTranscript(""); setWhWordCount(0); setError("");
      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      whStreamRef.current = stream;
      const mimeType = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/ogg"]
        .find(t => MediaRecorder.isTypeSupported(t));
      const recordChunk = () => {
        const mr = new MediaRecorder(stream, { mimeType: mimeType || "", audioBitsPerSecond: 64000 });
        let chunks = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: mr.mimeType });
            setTimeout(() => { if (blob.size > 0) whSendChunk(blob); }, 100);
          }
          if (whStreamRef.current?.active) setTimeout(recordChunk, 0);
        };
        mr.start(); whMediaRecorderRef.current = mr;
        setTimeout(() => { if (mr.state === "recording") { mr.requestData(); mr.stop(); } }, RECORDING_INTERVAL_MS);
      };
      recordChunk();
      setWhIsRecording(true);
      setWhStartTime(Date.now());
      whLastSpeechRef.current = Date.now();
      // ✅ FIX 3: Use the longer Whisper-specific silence timeout
      whSilenceTimerRef.current = setInterval(() => {
        if (whLastSpeechRef.current && Date.now() - whLastSpeechRef.current > WH_SILENCE_TIMEOUT_MS) whStop();
      }, 500);
    } catch { setError(t('functions:transcribe.micError')); }
  };

  const whStop = () => {
    if (whSilenceTimerRef.current) { clearInterval(whSilenceTimerRef.current); whSilenceTimerRef.current = null; }
    if (whMediaRecorderRef.current?.state === "recording") whMediaRecorderRef.current.stop();
    whStreamRef.current?.getTracks().forEach(t => t.stop());
    whMediaRecorderRef.current = null; whStreamRef.current = null; setWhIsRecording(false);
  };

  const startBoth = async () => { await wsStart(); await whStart(); };
  const stopBoth = () => { wsStop(); whStop(); };
  const bothRecording = wsIsRecording && whIsRecording;
  const eitherHasTranscript = wsTranscript || whTranscript;

  // ✅ FIX 4: axios was used here without being imported. Replaced with fetch.
  const handleGenerateSummary = async () => {
    const transcript = wsTranscript || whTranscript;
    if (!transcript) { setError(t('functions:transcribe.noTranscription')); return; }
    try {
      setIsGeneratingSummary(true); setError("");
      const response = await consultationApi.generateConsultationSummary(
        { full_name: "Transcription User" },
        {
            conversation_summary: transcript,
            conversation_history: transcript,
            patient_snapshot: transcript,
            new_diagnoses: [],
            new_medications: []
          }
      );

      if (response.status !== 200) { setError(t('functions:transcribe.summaryError')); return; }
      const data = response.data;
      if (data.success) setSummary(data.clinical_report);
      else setError(t('functions:transcribe.summaryError'));
    } catch (err) {
      setError(`Failed to generate summary: ${err.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const formatElapsed = (startTime) => {
    if (!startTime) return "0:00";
    const secs = Math.floor((Date.now() - startTime) / 1000);
    return `${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  // ── Shared panel component ───────────────────────────────
  const TranscriptPanel = ({ title, desc, isRecording, transcript, interim, wordCount, startTime, processingCount, onStart, onStop, statusType }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-[#2C3B8D]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-slate-800">{title}</h2>
            <p className="text-[11px] text-slate-400">{desc}</p>
          </div>
        </div>
        {!isRecording ? (
          <button onClick={onStart}
            className="px-4 py-2 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[13px] font-semibold rounded-xl transition-colors">
            {t('functions:transcribe.start', 'Start')}
          </button>
        ) : (
          <button onClick={onStop}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors animate-pulse">
            {t('functions:transcribe.stop', 'Stop')}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-5 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-4 text-[12px] text-slate-500">
          <span>{t('functions:transcribe.words', 'Words')}: <strong className="text-slate-800">{wordCount}</strong></span>
          <span>{t('functions:transcribe.time', 'Time')}: <strong className="text-slate-800">{startTime ? formatElapsed(startTime) : '—'}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px]">
          {isRecording && statusType === 'webspeech' && (
            <><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-semibold text-emerald-600">{t('functions:transcribe.live', 'Live')}</span></>
          )}
          {isRecording && statusType === 'whisper' && processingCount > 0 && (
            <><div className="w-3.5 h-3.5 border-2 border-[#2C3B8D]/30 border-t-[#2C3B8D] rounded-full animate-spin" />
            <span className="font-semibold text-[#2C3B8D]">{t('functions:transcribe.processing', 'Processing')}</span></>
          )}
          {isRecording && statusType === 'whisper' && processingCount === 0 && (
            <><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="font-semibold text-red-600">{t('functions:transcribe.recording', 'Recording')}</span></>
          )}
          {!isRecording && transcript && (
            <span className="font-semibold text-slate-400">{t('functions:transcribe.stopped', 'Stopped')}</span>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 min-h-[220px] max-h-[380px] overflow-y-auto bg-white">
        {(transcript || interim) ? (
          <p className="text-[14px] whitespace-pre-wrap leading-relaxed text-slate-800">
            {transcript}
            {interim && <span className="text-slate-400 italic">{transcript ? ' ' : ''}{interim}</span>}
          </p>
        ) : isRecording ? (
          <p className="text-[13px] text-slate-400 italic text-center py-10">
            {statusType === 'whisper'
              ? t('functions:transcribe.recordingHint', 'Recording... first results appear after ~10 seconds')
              : t('functions:transcribe.listening', 'Listening... speak to see transcription here')}
          </p>
        ) : (
          <p className="text-[13px] text-slate-300 italic text-center py-10">
            {t('functions:transcribe.clickStart', 'Click Start to begin transcription')}
          </p>
        )}
      </div>

      {transcript && (
        <div className="px-5 pb-4 border-t border-slate-100 pt-3">
          <button
            onClick={() => copyToClipboard(transcript)}
            className="w-full py-2.5 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#2C3B8D]
              text-[13px] font-semibold rounded-xl border border-[#c7d2f8] transition-colors"
          >
            {t('functions:transcribe.copyTranscript', 'Copy Transcript')}
          </button>
        </div>
      )}
    </div>
  );

  const InfoBox = ({ items }) => (
    <div className="bg-[#f5f7ff] rounded-xl border border-[#c7d2f8] px-4 py-3 space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2C3B8D]">
        {t('functions:transcribe.howItWorks', 'How it works')}
      </p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[12px] text-slate-500">
            <span className="w-1 h-1 rounded-full bg-[#2C3B8D] mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:transcribe.title')}
        subtitle={t('functions:transcribe.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        <div className="flex justify-center">
          {!bothRecording ? (
            <button onClick={startBoth}
              className="flex items-center gap-3 px-10 py-4 bg-[#2C3B8D] hover:bg-[#233070]
                text-white font-bold text-[16px] rounded-2xl shadow-md transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
              {t('functions:transcribe.startBoth', 'Start Both')}
            </button>
          ) : (
            <button onClick={stopBoth}
              className="flex items-center gap-3 px-10 py-4 bg-red-500 hover:bg-red-600
                text-white font-bold text-[16px] rounded-2xl shadow-md transition-colors animate-pulse">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              {t('functions:transcribe.stopBoth', 'Stop Both')}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[13px] text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <TranscriptPanel
              title={t('functions:transcribe.webSpeechTitle', 'Web Speech')}
              desc={t('functions:transcribe.webSpeechDesc', 'Browser-native · Instant · Free')}
              isRecording={wsIsRecording}
              transcript={wsTranscript}
              interim={wsInterim}
              wordCount={wsWordCount}
              startTime={wsStartTime}
              statusType="webspeech"
              onStart={wsStart}
              onStop={wsStop}
            />
            <InfoBox items={[
              t('functions:transcribe.webSpeechInfo1', 'Runs entirely in the browser (Chrome/Edge)'),
              t('functions:transcribe.webSpeechInfo2', 'Instant results — no network latency'),
              t('functions:transcribe.webSpeechInfo3', 'Free — no API costs'),
              t('functions:transcribe.webSpeechInfo4', 'Lower accuracy for medical/technical terms'),
              t('functions:transcribe.webSpeechInfo5', "Requires internet (uses Google's servers)"),
            ]} />
          </div>

          <div className="space-y-3">
            <TranscriptPanel
              title={t('functions:transcribe.whisperTitle', 'OpenAI Whisper')}
              desc={t('functions:transcribe.whisperDesc', 'Backend AI model · 10s chunks · High accuracy')}
              isRecording={whIsRecording}
              transcript={whTranscript}
              interim={null}
              wordCount={whWordCount}
              startTime={whStartTime}
              processingCount={whProcessingCount}
              statusType="whisper"
              onStart={whStart}
              onStop={whStop}
            />
            <InfoBox items={[
              t('functions:transcribe.whisperInfo1', 'Records 10-second audio chunks'),
              t('functions:transcribe.whisperInfo2', 'Sends to backend for OpenAI Whisper processing'),
              t('functions:transcribe.whisperInfo3', 'Higher accuracy for medical/technical terms'),
              t('functions:transcribe.whisperInfo4', '~10s delay per chunk (upload + transcribe)'),
              t('functions:transcribe.whisperInfo5', 'Uses OpenAI API credits'),
              t('functions:transcribe.whisperInfo6', 'Hallucination filter applied'),
            ]} />
          </div>
        </div>

        {eitherHasTranscript && (
          <div className="flex justify-center">
            <button
              onClick={handleGenerateSummary} disabled={isGeneratingSummary}
              className="flex items-center gap-3 px-8 py-4 bg-[#2C3B8D] hover:bg-[#233070]
                text-white font-bold text-[15px] rounded-2xl shadow-md transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingSummary ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('functions:transcribe.generatingSummary', 'Generating Summary...')}</>
              ) : (
                t('functions:transcribe.generateSummary', 'Generate AI Summary')
              )}
            </button>
          </div>
        )}

        {summary && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                <svg className="w-[18px] h-[18px] text-[#2C3B8D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-[17px] font-semibold text-slate-800 flex-1">
                {t('functions:transcribe.aiSummary', 'AI Summary')}
              </h3>
              <button
                onClick={() => copyToClipboard(summary)}
                className="px-3 py-1.5 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#2C3B8D]
                  text-[12px] font-semibold rounded-lg border border-[#c7d2f8] transition-colors"
              >
                {t('functions:transcribe.copy', 'Copy')}
              </button>
            </div>
            <div className="p-5">
              <p className="text-[14px] whitespace-pre-wrap leading-relaxed text-slate-800">{summary}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TranscribeDictate;
