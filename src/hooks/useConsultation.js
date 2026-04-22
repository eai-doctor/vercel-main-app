import { useState, useRef, useCallback } from "react";
import { recordConsultationStream } from "@/api/consultationApi"
const SILENCE_THRESHOLD_DB = -35;  // 이 dB 이하면 무음으로 판단
const SILENCE_TIMEOUT_MS   = 5000; // 5초 무음 시 자동 종료

// Whisper hallucination filters with law quality audio
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

const isHallucination = (text) => {
  const lower = text.toLowerCase().trim();
  return WHISPER_HALLUCINATIONS.some((h) => lower.includes(h));
};

// audio settings
const AUDIO_CONSTRAINTS = {
  audio: {
    channelCount: 1,       
    sampleRate: 16000,     
    echoCancellation: true,
    noiseSuppression: true,
  },
};

const RECORDING_INTERVAL_MS = 10000;
const MIN_AUDIO_BYTES = 30 * 1024;   //consider voice under 30 kb as mute

// ─────────────────────────────────────────
// useConsultation
//
//   caption  → Web Speech API (immediate)
//   AI analyzation  → 서버의 conversation_history (Whisper precision)
// ─────────────────────────────────────────
const useConsultation = ({
  t,
  patientData,
  transcriptHistory,
  setTranscriptHistory,
  setInterimTranscript,
  setIsProcessing,
  setProcessingStartTime,
  setProcessingStatus,
  setNbqList,
  setDifferentials,
  setModelInfo,
  setShowSuccess,
  setConsulting,
  lang = "en",
  onSilenceStop= () => setConsulting(false)
}) => {
  // ── refs ──────────────────────────────
  const consultingRef        = useRef(false);
  const mediaRecorderRef     = useRef(null);
  const streamRef            = useRef(null);
  const speechRecognitionRef = useRef(null);
  const isSendingRef         = useRef(false);
  const silenceTimerRef  = useRef(null);
  const analyserRef      = useRef(null);
  const animationFrameRef = useRef(null);
  const analysisIntervalRef = useRef(0);
  const analysisCounterRef = useRef(0);
  const transcriptHistoryRef = useRef(transcriptHistory || "");

  // Keep ref in sync with transcriptHistory prop so sendChunk closure always reads latest value
  transcriptHistoryRef.current = transcriptHistory || "";

  const [isCaptionAvailable, setIsCaptionAvailable] = useState(false);

  // ── Web Speech (caption 전담) ─────────
  const startWebSpeech = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        setIsCaptionAvailable(false);
        return;
    }

    const LANGUAGE_MAP = {
        en: "en-US",
        zh: "zh-CN",
        fr: "fr-FR",
    };

    const recognition = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = LANGUAGE_MAP[lang];

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (!event.results[i].isFinal) interim += text;
        // Final results are handled by the Gemini transcription_complete SSE event
        // to avoid duplicating text from two sources in transcriptHistory
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
        console.warn("Web Speech error:", event.error);
        if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
        ) {
            setIsCaptionAvailable(false);
            speechRecognitionRef.current = null;
            return;  
        }
    };

    recognition.onend = () => {
      if (consultingRef.current && streamRef.current?.active) {
        try { recognition.start(); } catch (e) { }
      }
    };

    try {
      recognition.start();
      speechRecognitionRef.current = recognition;
      setIsCaptionAvailable(true);
    } catch (e) {
      console.warn("Web Speech start failed:", e);
    }
  }, [setInterimTranscript]);

  const stopWebSpeech = useCallback(() => {
    try { speechRecognitionRef.current?.stop(); } catch (e) { /*  */ }
    speechRecognitionRef.current = null;
    setInterimTranscript("");
  }, [setInterimTranscript]);

 const handleSSEStream = useCallback(async (axiosResponse) => {
  const rawData = axiosResponse.data;
  
  if (!rawData || typeof rawData !== 'string') {
    console.error("No valid SSE data found in response");
    return;
  }

  const blocks = rawData.split("\n\n");

  for (const block of blocks) {
    if (!block.trim()) continue;

    const eventMatch = block.match(/^event:\s*(.+)$/m);
    const dataMatch = block.match(/^data:\s*(.+)$/m);

    if (eventMatch && dataMatch) {
      const eventType = eventMatch[1].trim();
      const eventDataString = dataMatch[1].trim();

      try {
        const data = JSON.parse(eventDataString);

        switch (eventType) {
          case "transcription_start":
            setProcessingStatus(t("clinic:consultation.transcribingAudio", "Transcribing audio..."));
            break;

          case "transcription_complete":
            setProcessingStatus(t("clinic:consultation.transcriptionComplete", "Transcription complete ✓"));
            if (data.transcript && !isHallucination(data.transcript)) {
              setTranscriptHistory(prev => prev ? prev + ' ' + data.transcript.trim() : data.transcript.trim());
            }
            break;

          case "analysis_start":
            setProcessingStatus(t("clinic:consultation.analyzingConsultation", "Analyzing consultation..."));
            break;

          case "analysis_complete":
            setProcessingStatus(t("clinic:consultation.analysisComplete", "Analysis complete ✓"));
            // Bug 3 fix: merge NBQ by id (keep higher info_gain), replace differentials with latest
            setNbqList(prev => {
              const incoming = data.nbq_list || [];
              const merged = [...prev];
              for (const q of incoming) {
                const existing = merged.findIndex(e => e.id === q.id);
                if (existing === -1) merged.push(q);
                else if (q.info_gain > merged[existing].info_gain) merged[existing] = q;
              }
              return merged;
            });
            setDifferentials(data.differential_diagnosis || []);
            if (data._model_info) setModelInfo(data._model_info);
            break;

          case "complete":
            setProcessingStatus(t("common:states.done", "Done!"));
            setIsProcessing(false);
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              setProcessingStatus("");
            }, 3000);
            break;

          case "error":
            console.error("Server Error Event:", data.error);
            setIsProcessing(false);
            break;
        }
      } catch (e) {
        console.error("JSON Parsing Error in block:", e, eventDataString);
      }
    }
  }
}, [
  t,
  setTranscriptHistory,
  setProcessingStatus,
  setNbqList,
  setDifferentials,
  setModelInfo,
  setIsProcessing,
  setShowSuccess,
]);

  const sendChunk = useCallback(async (audioBlob) => {
    if (!patientData || !audioBlob || audioBlob.size < MIN_AUDIO_BYTES) {
      console.log(`Skipped Chunk: ${audioBlob?.size ?? 0} bytes`);
      return;
    }

    // 이전 전송이 끝나지 않았으면 스킵 (race condition 방지)
    if (isSendingRef.current) {
      console.warn("Sending previous chunking - skip");
      analysisCounterRef.current -= 1; 
      return;
    }

    analysisCounterRef.current += 1;
    // Bug 2 fix: % 2 so analysis runs every other chunk (~20s), not every chunk
    const shouldAnalyze = analysisCounterRef.current % 2 === 0;

    isSendingRef.current = true;
    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setProcessingStatus(
      t("clinic:consultation.uploadingAudio", "Uploading audio...")
    );

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "clip.webm");
      formData.append("patient_data", JSON.stringify(patientData));
      formData.append("analyze", String(shouldAnalyze));
      // Bug 1 fix: send accumulated transcript so backend has full context
      formData.append("accumulated_transcript", transcriptHistoryRef.current);
      const response = await recordConsultationStream(formData);

      await handleSSEStream(response);
    } catch (error) {
      console.error("Chunk Transfer Error:", error);
      setIsProcessing(false);
      setProcessingStatus("");
      setProcessingStatus(`Error: ${error.message}`);
      setTimeout(() => setProcessingStatus(""), 4000);
    } finally {
      isSendingRef.current = false;
    }
  }, [
    patientData,
    t,
    handleSSEStream,
    setIsProcessing,
    setProcessingStartTime,
    setProcessingStatus,
  ]);

  const recordChunk = useCallback((stream, mimeType) => {
    if (!consultingRef.current || !stream.active) return;

    const recorder = new MediaRecorder(stream, {
      mimeType:          mimeType || "",
      audioBitsPerSecond: 64000,
    });
    let chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: recorder.mimeType });
        setTimeout(() => sendChunk(blob), 100);
      }
      if (consultingRef.current && stream.active) {
        recordChunk(stream, mimeType);
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.requestData();
        recorder.stop();
      }
    }, RECORDING_INTERVAL_MS);
  }, [sendChunk]);


  const startConsultation = useCallback(async () => {
    try {
      setTranscriptHistory("");

      const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      streamRef.current    = stream;
      consultingRef.current = true;
      analysisCounterRef.current = 0;

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      startSilenceDetection(stream);

      startWebSpeech();
      recordChunk(stream, mimeType);
    } catch (error) {
      console.error("Mike Access Error:", error);
      consultingRef.current = false;
      setConsulting(false);
    }
  }, [setTranscriptHistory, setConsulting, startWebSpeech, recordChunk]);

  const stopConsultation = useCallback(() => {
    consultingRef.current = false;
    stopSilenceDetection();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    streamRef.current        = null;

    stopWebSpeech();
  }, [stopWebSpeech]);
  
const startSilenceDetection = useCallback((stream) => {
  const audioCtx = new AudioContext();
  const source   = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  analyserRef.current = analyser;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let lastLoggedDb = null;  // 동일 dB 반복 로그 방지

  const check = () => {
    analyser.getByteFrequencyData(dataArray);

    const avg    = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const dB     = avg === 0 ? -Infinity : 20 * Math.log10(avg / 255);
    const silent = dB < SILENCE_THRESHOLD_DB;

    // 0.5dB 이상 변화가 있을 때만 로그 (매 프레임 출력 방지)
    if (lastLoggedDb === null || Math.abs(dB - lastLoggedDb) > 0.5) {
      lastLoggedDb = dB;
    }

    if (silent) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopConsultation();
          onSilenceStop?.();
        }, SILENCE_TIMEOUT_MS);
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
 
    animationFrameRef.current = requestAnimationFrame(check);
  };

  check();
}, [stopConsultation, onSilenceStop]);

  const stopSilenceDetection = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    analyserRef.current = null;
  }, []);

  return { startConsultation, stopConsultation, isCaptionAvailable };
};

export default useConsultation;