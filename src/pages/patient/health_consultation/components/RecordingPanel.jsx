import React, { useState, useRef, useEffect } from 'react';

import {
  AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon,
  MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
} from '@/components/ui/icons';
import chatApi from '@/api/chatApi';

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
    setPendingAction,
    SYMPTOM_SEVERITY_CLASSES, 
    t,
    loading,
    user
}) {

  const [chatHistory, setChatHistory] = useState([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
  const [expandedHistoryDate, setExpandedHistoryDate] = useState(null);

  const [previousSymptoms, setPreviousSymptoms] = useState([]);
  const [isSymptomsLoading, setIsSymptomsLoading] = useState(false);

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
  if (!isAuthenticated || loading) return;
  const fetchChatHistory = async () => {
    setIsChatHistoryLoading(true);
    try {
      const response = await chatApi.getChatHistory(user?.id || "PORTAL-USER");
      if (response.data.success) setChatHistory(response.data.histories || []);
    } catch (e) { console.error(e); } 
    finally { setIsChatHistoryLoading(false); }
  };
  fetchChatHistory();
}, [isAuthenticated, loading]);

const groupedHistory = chatHistory.reduce((acc, item) => {
  const date = new Date(item.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
  if (!acc[date]) acc[date] = [];
  acc[date].push(item);
  return acc;
}, {});
const historyDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

// ── Chat History Panel  ──
const ChatHistoryPanel = ({ mobile = false }) => {
  if (!isAuthenticated) return null;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return t('history.today', 'Today');
    if (d.toDateString() === yesterday.toDateString()) return t('history.yesterday', 'Yesterday');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoStr) =>
    new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (mobile) {
    // 모바일: chat 패널 하단에 붙는 아코디언
    return (
      <div className="border-t border-slate-100 bg-white rounded-b-none shrink-0">
        <button
          onClick={() => setExpandedHistoryDate(prev => prev === 'open' ? null : 'open')}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <ClockIcon className="w-3.5 h-3.5 text-[#2C3B8D]" />
            <span className="text-[12px] font-semibold text-slate-700">
              {t('history.chatHistory', 'Chat History')}
            </span>
            {chatHistory.length > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
                {historyDates.length}d
              </span>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expandedHistoryDate === 'open' ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedHistoryDate === 'open' && (
          <div className="max-h-72 overflow-y-auto border-t border-slate-100">
            {isChatHistoryLoading ? (
              <div className="flex items-center justify-center py-6 gap-2">
                <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
                <span className="text-[12px] text-slate-400">Loading...</span>
              </div>
            ) : historyDates.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic text-center py-4">
                {t('history.noHistory', 'No chat history yet.')}
              </p>
            ) : (
              historyDates.map(date => (
                <div key={date}>
                  {/* 날짜 헤더 — 클릭으로 해당 날짜 토글 */}
                  <button
                    onClick={() => setExpandedHistoryDate(prev => prev === date ? 'open' : date)}
                    className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-left"
                  >
                    <span className="text-[11px] font-semibold text-slate-500">{formatDate(date)}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">{groupedHistory[date].length} msgs</span>
                      <svg
                        className={`w-3 h-3 text-slate-400 transition-transform ${expandedHistoryDate === date ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedHistoryDate === date && (
                    <div className="divide-y divide-slate-50">
                      {groupedHistory[date].map((item, idx) => (
                        <div key={idx} className="px-4 py-2.5 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[12px] text-slate-800 font-medium leading-relaxed flex-1">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
                              {formatTime(item.created_at)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {item.response}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // 데스크톱: 사이드패널 카드
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
          <ClockIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
        </div>
        <h3 className="text-[14px] font-semibold text-slate-800">
          {t('history.chatHistory', 'Chat History')}
        </h3>
        {historyDates.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
            {historyDates.length}d
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-100">
        {isChatHistoryLoading ? (
          <div className="flex items-center justify-center py-6 gap-2">
            <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
            <span className="text-[12px] text-slate-400">Loading...</span>
          </div>
        ) : historyDates.length === 0 ? (
          <p className="text-[12px] text-slate-400 italic text-center py-4 px-3">
            {t('history.noHistory', 'No chat history yet.')}
          </p>
        ) : (
          historyDates.map(date => (
            <div key={date}>
              {/* 날짜 헤더 — 클릭으로 접기/펼치기 */}
              <button
                onClick={() => setExpandedHistoryDate(prev => prev === date ? null : date)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 text-left hover:bg-[#f5f7ff] transition-colors"
              >
                <span className="text-[12px] font-semibold text-[#2C3B8D]">{formatDate(date)}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">{groupedHistory[date].length} messages</span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedHistoryDate === date ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedHistoryDate === date && (
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                  {groupedHistory[date].map((item, idx) => (
                    <div key={idx} className="px-4 py-3 space-y-2">
                      {/* user message */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <span className="text-[10px] font-semibold text-[#2C3B8D] mt-0.5 shrink-0">Q</span>
                          <p className="text-[12px] text-slate-800 leading-relaxed">{item.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">{formatTime(item.created_at)}</span>
                      </div>
                      {/* AI response */}
                      <div className="flex items-start gap-1.5 pl-0">
                        <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 shrink-0">A</span>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">{item.response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

    return( <div className={`w-full lg:w-1/3 space-y-4 ${activeTab === 'chat' ? 'hidden lg:block' : 'block'}`}>

          {/* Recording card */}
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
                    {/* <button
                      onClick={() => { setSnapshot(transcriptHistory); setConversationSummary(transcriptHistory); }}
                      className="flex-1 py-2 rounded-xl text-[12px] font-semibold text-[#2C3B8D] bg-[#eef2ff] hover:bg-[#e0e7ff] border border-[#c7d2f8] transition-colors"
                    >
                      {t('consultation.showConversation', 'Show Conversation')}
                    </button> */}
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

          {/* Previous Symptoms — history tab */}
          {isAuthenticated && (
            <div className={activeTab === 'record' ? 'hidden lg:block' : 'block' }>
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
                        const sClass = SYMPTOM_SEVERITY_CLASSES[severity?.toLowerCase()] || SYMPTOM_SEVERITY_CLASSES.default;
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
                
                <div className='mt-4'>
              <ChatHistoryPanel />

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
    )
}

export default RecordingPanel;