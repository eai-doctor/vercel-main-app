import React from 'react';
import { MicrophoneIcon, ClipboardIcon } from '@/components/ui/icons';

// import ChatHistoryPanel from './ChatHistoryPanel';
// import PreviousSymptomsPanel from './PreviousSymptomsPanel';
import PreviousSymptomsPanel from './symptoms/PreviousSymptomsPanel';

function RecordingPanel({
  activeTab,
  consulting,
  setConsulting,
  transcriptHistory,
  interimTranscript,
  setSnapshot,
  conversationSummary,
  setConversationSummary,
  handleOpenEndConsultationModal,
  isAuthenticated,
  isPatient,
  setPendingAction,
  SYMPTOM_SEVERITY_CLASSES,
  t,
  loading,
  user,
  previousSymptoms,
  isSymptomsLoading,
}) {
  return (
    <div className={`w-full lg:w-1/3 space-y-4 ${activeTab === 'chat' ? 'hidden lg:block' : 'block'} `} >

      {/* <div className={activeTab === 'history' ? 'hidden lg:block' : 'block'}> */}
      <div className="hidden">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
            <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <MicrophoneIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-slate-800">
                {t('consultation.audioRecording', 'Audio Recording')}
              </h2>
              <p className="text-[10px] text-slate-400">
                {t('consultation.recordConsultation', 'Record your consultation')}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={() => setConsulting(!consulting)}
              className={`w-full py-3 rounded-xl text-white font-bold text-[13px] transition-all
                ${consulting
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {consulting
                ? t('consultation.stopRecording', 'Stop Recording')
                : t('consultation.startRecording', 'Start Recording')}
            </button>

            {consulting && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                <span className="text-[12px] font-semibold text-red-700">
                  {t('consultation.listening', 'Recording in progress...')}
                </span>
              </div>
            )}

            {transcriptHistory && !consulting && (
              <div className="flex-row gap-2 space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
                  <span className="text-[12px] font-semibold">
                    {t('consultation.listeningFinished', 'Recording completed')}
                  </span>
                </div>
                <div className="flex">
                  <button
                    onClick={handleOpenEndConsultationModal}
                    className="cursor-pointer flex-1 py-2 rounded-xl text-[12px] font-semibold text-white bg-[#2C3B8D] hover:bg-[#233070] transition-colors"
                  >
                    {t('consultation.generateSummary', 'Generate Summary')}
                  </button>
                </div>
              </div>
            )}

            {!consulting && !transcriptHistory && (
              <p className="text-center text-[12px] text-slate-400">
                {t('consultation.pressStartRecording', 'Press Start Recording to begin')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Previous Symptoms + Chat History ── */}
      {isAuthenticated && isPatient && (
        <div className={activeTab === 'record' ? 'hidden lg:block' : 'block'}>
          <PreviousSymptomsPanel
            previousSymptoms={previousSymptoms}
            isSymptomsLoading={isSymptomsLoading}
            SYMPTOM_SEVERITY_CLASSES={SYMPTOM_SEVERITY_CLASSES}
            t={t}
          />

          {/* <div className="mt-4">
            <ChatHistoryPanel
              isAuthenticated={isAuthenticated}
              isPatient = {isPatient}
              userId={user?.id}
            />
          </div> */}
        </div>
      )}

      {/* ── Conversation Summary ── */}
      {conversationSummary && (
        <div className={activeTab === 'record' ? 'hidden lg:block' : 'block'}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
              <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                <ClipboardIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
              </div>
              <h3 className="text-[14px] font-semibold text-slate-800">
                {t('consultation.consultationSummary', 'Consultation Summary')}
              </h3>
            </div>
            <div className="p-3">
              <p className="text-[12px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                {conversationSummary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordingPanel;
