// Audio optimization settings
const AUDIO_CONSTRAINTS = {
  audio: {
    channelCount: 1,        // Mono (reduces file size by 50%)
    sampleRate: 16000,      // Whisper's native sample rate
    echoCancellation: true,
    noiseSuppression: true,
  }
};

// ⚡ OPTIMIZED: Recording interval reduced from 30s to 10s for faster transcription
// Smaller audio chunks transcribe 2-3x faster with Whisper
const RECORDING_INTERVAL_MS = 10000; // 10 seconds

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

const useAudioRecorder = ({
    t,
    API_URL,
    token,
    consulting,
    setConsulting,
    setTranscriptHistory,
    latestSnapshotRef,
    latestSummaryRef,
    startWebSpeechRecognition,
    mediaRecorderRef,
    streamRef,
    stopWebSpeechRecognition,
    patientData,
    setProcessingStartTime,
    setIsProcessing,
    setProcessingStatus,
    setNbqList,
    setdifferentials,
    setModelInfo,
    setShowSuccess
}) => {

  // ✅ Web Speech support check (hook 초기화 시 1번만 실행)
  const isWebSpeechSupported =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

    const startRecording = async () => {
        try {
        // Clear previous session's transcript and refs
        setTranscriptHistory("");
        latestSnapshotRef.current = "";
        latestSummaryRef.current = "";

        // ⚡ OPTIMIZED: Use optimized audio constraints for smaller file size
        const stream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
        streamRef.current = stream;

        // ⚡ HYBRID: Start Web Speech API for instant display
        startWebSpeechRecognition();

        const mimeType = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/ogg",
        ].find((type) => MediaRecorder.isTypeSupported(type));

        const recordChunk = () => {
            // ⚡ OPTIMIZED: Lower bitrate for faster upload
            const mediaRecorder = new MediaRecorder(stream, {
            mimeType: mimeType || "",
            audioBitsPerSecond: 64000,  // 64kbps instead of default 128kbps
            });
            let localChunks = [];

            mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) localChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
            if (localChunks.length > 0) {
                const blob = new Blob(localChunks, {
                type: mediaRecorder.mimeType,
                });
                setTimeout(() => {
                if (blob.size > 0) {
                    console.log(`Sending audio blob: ${blob.size} bytes, type: ${blob.type}`);
                    // Web Speech handles caption display — no need to clear interim here
                    sendRecording(blob);
                } else {
                    console.warn('Empty audio blob detected, skipping send');
                }
                }, 100);
            }
            if (consulting && streamRef.current && streamRef.current.active) {
                setTimeout(recordChunk, 0);
            }
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;

            setTimeout(() => {
            if (mediaRecorder.state === "recording") {
                mediaRecorder.requestData();
                mediaRecorder.stop();
            }
            }, RECORDING_INTERVAL_MS);
        };

        recordChunk();
        } catch (error) {
        console.error("Microphone access error:", error);
        setConsulting(false);
        }
    };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    streamRef.current = null;

    // ⚡ HYBRID: Stop Web Speech recognition
    stopWebSpeechRecognition();

    // Keep transcriptHistory visible after stopping — cleared on next start
  };

  
    // Recording and consultation functions
    const sendRecording = async (audioBlob) => {

      if (!patientData || !audioBlob || audioBlob.size === 0) return;

      // ~30KB of opus audio ≈ 7-8 seconds of speech — below this is likely silence/noise
      const MIN_AUDIO_BYTES = 30 * 1024;
      if (audioBlob.size < MIN_AUDIO_BYTES) {
        console.log(`Audio blob too small (${audioBlob.size} bytes < ${MIN_AUDIO_BYTES}) — likely silence, skipping.`);
        return;
      }
  
      const formData = new FormData();
      formData.append("audio", audioBlob, "clip.webm");
      formData.append("patient_data", JSON.stringify(patientData));
  
      setIsProcessing(true);
      setProcessingStartTime(Date.now());
      setProcessingStatus(t('clinic:consultation.uploadingAudio', 'Uploading audio...'));
  
      try {
        console.log("Sending audio recording to backend with streaming...");
  
        const response = await fetch(`${API_URL}/api/record-consultation-stream`, {
          method: 'POST',
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          body: formData
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
  
              console.log(`SSE Event: ${eventType}`, data);
  
              switch (eventType) {
                case 'upload_complete':
                  setProcessingStatus(t('clinic:consultation.audioUploaded', 'Audio uploaded ✓'));
                  break;
  
                case 'transcription_start':
                  setProcessingStatus(t('clinic:consultation.transcribingAudio', 'Transcribing audio...'));
                  break;
  
                case 'transcription_complete':
                  setProcessingStatus(t('clinic:consultation.transcriptionComplete', 'Transcription complete ✓'));
                  if (data.transcript && data.transcript.trim() && !isWhisperHallucination(data.transcript)) {
                    const whisperText = data.transcript.trim();
                    // Accumulate Whisper results in ref for AI Summary
                    latestSnapshotRef.current = latestSnapshotRef.current
                      ? latestSnapshotRef.current + " " + whisperText
                      : whisperText;
                    // Fallback: use Whisper for caption if Web Speech API is not available
                    if (!isWebSpeechSupported) {
                      setTranscriptHistory(prev => prev ? prev + " " + whisperText : whisperText);
                    }
                  }
                  break;
  
                case 'analysis_start':
                  setProcessingStatus(t('clinic:consultation.analyzingConsultation', 'Analyzing consultation...'));
                  break;
  
                case 'analysis_complete':
                  setProcessingStatus(t('clinic:consultation.analysisComplete', 'Analysis complete ✓'));
                  console.log("Full analysis_complete data:", data);
  
                  const { patient_snapshot, conversation_summary, conversation_history, nbq_list, differential_diagnosis, new_diagnoses, new_medications, new_vital_signs, patient_info, _model_info } = data;
  
                  // Store snapshot and summary in refs (only displayed on button click)
                  latestSnapshotRef.current = conversation_history || t('clinic:consultation.noConversation', 'No conversation available');
                  latestSummaryRef.current = conversation_summary || "";
  
                  // NBQ and differentials still update in real-time
                  setNbqList(nbq_list || []);
                  setdifferentials(differential_diagnosis || []);
  
                  // Update model info if available
                  if (_model_info) {
                    setModelInfo(_model_info);
                    console.log("Model used:", _model_info);
                  }
  
                  // Patient data is NOT updated every 10s — only loaded on page enter
  
                  break;
  
                case 'complete':
                  setProcessingStatus(t('common:states.done', 'Done!'));
                  setIsProcessing(false);
                  setShowSuccess(true);
                  // SOAP note is only generated on page enter, not after each 10s chunk
                  setTimeout(() => {
                    setShowSuccess(false);
                    setProcessingStatus("");
                  }, 3000);
                  break;
  
                case 'error':
                  throw new Error(data.error || "Processing failed");
              }
            }
          }
        }
      } catch (error) {
        console.error("Error sending audio:", error);
        alert(t('clinic:consultation.errorProcessingAudio', { message: error.message, defaultValue: 'Error processing audio recording: {{message}}. Check console for details.' }));
        setIsProcessing(false);
        setProcessingStatus("");
      }
    };

  return {
    startRecording,
    stopRecording,
    sendRecording
  }
};

export default useAudioRecorder;