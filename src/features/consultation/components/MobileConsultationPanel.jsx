import { useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  MicrophoneIcon,
  XCircleIcon,
  UploadIcon,
  ClockIcon 
} from "@/components/icons";

const formatElapsedTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function MobileConsultationPanel({
  consulting,
  setConsulting,
  sendRecording,
  isProcessing,
  transcriptHistory,
  interimTranscript,
  processingStatus,
  elapsedTime
}) {
  const { t } = useTranslation(['clinic', 'common']);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a)$/i)) {
      alert(t('clinic:consultation.invalidAudioFile', 'Please upload a valid audio file (MP3, WAV, WebM, OGG, or M4A)'));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert(t('common:errors.fileSizeLimit', 'File size must be less than 50MB'));
      return;
    }

    console.log(`Uploading audio file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    await sendRecording(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return(
        <div className="block lg:hidden w-full bg-white border-r border-[rgba(15,23,42,0.1)] backdrop-blur-lg p-4 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(15,23,42,0.1)] space-y-4 mb-6">
        <button
          className={`w-full py-6 rounded-xl text-white font-bold text-base shadow-lg transform transition-all duration-300 hover:scale-105 ${consulting
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            }`}
          onClick={() => setConsulting(!consulting)}
        >
          <span className="flex items-center justify-center space-x-2 text-2xl">{consulting ? <><XCircleIcon className="w-5 h-5" /><span>{t('clinic:consultation.stopConsultation', 'Stop Consultation')}</span></> : <><MicrophoneIcon className="w-5 h-5" /><span>{t('clinic:consultation.startConsultation', 'Start Consultation')}</span></>}</span>
        </button>

        {/* <div className="bg-[rgba(59,130,246,0.08)] rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/images/medical-icons/Ai Robot.jpg"
                alt={t('clinic:consultation.aiRobotAlt', 'AI Robot')}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('clinic:consultation.aiAssistant', 'AI Assistant')}</h2>
              <p className="text-xs text-white/80">{t('clinic:consultation.realTimeAnalysis', 'Real-time Analysis')}</p>
            </div>
          </div>
        </div> */}

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[rgba(15,23,42,0.1)]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-sm text-[#475569] font-medium">{t('common:states.or', 'or')}</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/webm,audio/ogg,audio/m4a,.mp3,.wav,.webm,.ogg,.m4a"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            className="w-full py-6 rounded-xl text-white font-semibold bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 disabled:hover:scale-100 btn-glow"
            onClick={() => fileInputRef.current?.click()}
            disabled={consulting || isProcessing}
          >
            <span className="flex items-center justify-center space-x-2 text-2xl"><UploadIcon className="w-5 h-5" /><span>{t('clinic:consultation.uploadAudioFile', 'Upload Audio File')}</span></span>
          </button>
          <div className="text-xs text-[#475569] text-center bg-[rgba(59,130,246,0.08)] rounded-lg p-2">
            {t('clinic:consultation.supportedAudioFormats', 'Support MP3, WAV, WebM, OGG, M4A (max 50MB)')}
          </div>
        </div>

        {consulting && !isProcessing && (
          <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-red-700">
                <span className="flex items-center space-x-1"><MicrophoneIcon className="w-4 h-4 inline" /><span>{t('clinic:consultation.recordingInProgress', 'Recording in progress...')}</span></span>
              </span>
            </div>
          </div>
        )}

        {/* Mobile: Live Transcription Caption Box - Stays visible after stopping */}
        {(consulting || transcriptHistory) && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-yellow-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-3 py-1.5 flex items-center space-x-2">
              {consulting ? (
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
              ) : (
                <div className="w-2.5 h-2.5 bg-white/60 rounded-full"></div>
              )}
              <span className="text-white font-semibold text-xs">
                {consulting ? t('clinic:consultation.liveTranscription', 'Live Transcription') : t('clinic:consultation.transcription', 'Transcription')}
              </span>
            </div>
            <div className="p-3 max-h-32 overflow-y-auto">
              {(transcriptHistory || interimTranscript) ? (
                <div className="text-xs whitespace-pre-wrap leading-relaxed text-[#1e293b] bg-white/70 p-2 rounded-lg border border-yellow-100">
                  {transcriptHistory}
                  {interimTranscript && (
                    <span className="text-[#64748b] italic">
                      {transcriptHistory ? " " : ""}{interimTranscript}
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic text-center py-1">
                  {t('clinic:consultation.listeningSpeak', 'Listening... speak to see transcription')}
                </div>
              )}
            </div>
          </div>
        )}

        {!consulting && !isProcessing && (
          <div className="text-center text-sm text-[#64748b]">
            <span className="flex items-center justify-center space-x-1"><ClockIcon className="w-4 h-4" /><span>{t('clinic:consultation.notRecording', 'Not recording')}</span></span>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 bg-[rgba(59,130,246,0.08)] border-2 border-[rgba(59,130,246,0.2)] rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-[#3b82f6] rounded-full animate-spin"></div>
              <div className="text-base font-semibold text-[#3b82f6]">
                {processingStatus || t('common:states.processing', 'Processing...')}
              </div>
            </div>
            <div className="text-center text-xs text-[#3b82f6] mt-2">
              <span className="flex items-center justify-center space-x-1"><ClockIcon className="w-4 h-4" /><span>{formatElapsedTime(elapsedTime)}</span></span>
            </div>
          </div>
        )}
      </div>
    )
}