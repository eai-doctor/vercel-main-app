import React from 'react';
import ChatLogContent from './ChatLogContent';

function SymptomChatDrawer({ open, close, selectedSymptom, chatLogs, isLoading, expandedId, setExpandedId, SYMPTOM_SEVERITY_CLASSES }) {
  const severity = selectedSymptom?.severity || '';
  const sClass = SYMPTOM_SEVERITY_CLASSES?.[severity?.toLowerCase()] || SYMPTOM_SEVERITY_CLASSES?.default || '';

  return (
    <>
      {/* 오버레이 — 클릭으로 닫기 */}
      <div
        className={`hidden md:block fixed inset-0 z-40 bg-black/20 transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />

      {/* 드로어 패널 */}
      <div
        className={`hidden md:flex fixed top-0 right-0 h-full w-[400px] z-50 flex-col bg-white border-l border-slate-200
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* 헤더 */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide">Symptom history</p>
            <p className="text-[15px] font-semibold text-slate-800">
              {selectedSymptom?.symptom || ''}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {severity && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${sClass}`}>
                  {severity}
                </span>
              )}
              {selectedSymptom?.first_mentioned && (
                <span className="text-[11px] text-slate-400">
                  since {new Date(selectedSymptom.first_mentioned).toLocaleDateString()}
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                · {chatLogs.length} session{chatLogs.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <i className="ti ti-x" style={{ fontSize: 18 }} />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto">
          <ChatLogContent
            chatLogs={chatLogs}
            isLoading={isLoading}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        </div>
      </div>
    </>
  );
}

export default SymptomChatDrawer;