// ⚡ HYBRID TRANSCRIPTION: Use Web Speech API for instant display + Whisper for accuracy
const USE_HYBRID_TRANSCRIPTION = true;

const useTranscription = ({
    consulting, 
    isWebSpeechSupported,
    setTranscriptHistory,
    setInterimTranscript,
    speechRecognitionRef,
    streamRef 
}) => {
    // ⚡ HYBRID TRANSCRIPTION: Start Web Speech API for instant display
    const startWebSpeechRecognition = () => {
      if (!USE_HYBRID_TRANSCRIPTION || !isWebSpeechSupported) return;

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
        // Accumulate final results into transcriptHistory (instant, no gaps)
        if (finalText.trim()) {
          setTranscriptHistory(prev => prev ? prev + " " + finalText.trim() : finalText.trim());
        }
        // Always update interim (clear stale text when results finalize)
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        console.log("Web Speech error:", event.error);
        // Don't stop - Whisper will still work
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

      try {
        recognition.start();
        speechRecognitionRef.current = recognition;
        console.log("✓ Web Speech API started for instant transcription");
      } catch (e) {
        console.log("Could not start Web Speech:", e);
      }
    };

    const stopWebSpeechRecognition = () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on stop
        }
        speechRecognitionRef.current = null;
      }
      setInterimTranscript("");
    };

    return {
    startWebSpeechRecognition,
    stopWebSpeechRecognition
  };
}

export default useTranscription;