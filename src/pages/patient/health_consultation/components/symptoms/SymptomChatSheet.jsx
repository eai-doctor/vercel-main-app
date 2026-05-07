import React, { useRef, useState, useEffect } from 'react';
import ChatLogContent from './ChatLogContent';

function SymptomChatSheet({ open, close, selectedSymptom, chatLogs, isLoading, expandedId, setExpandedId, SYMPTOM_SEVERITY_CLASSES }) {
  const severity = selectedSymptom?.severity || '';
  const sClass = SYMPTOM_SEVERITY_CLASSES?.[severity?.toLowerCase()] || SYMPTOM_SEVERITY_CLASSES?.default || '';

  // 드래그로 높이 조절
  const [sheetHeight, setSheetHeight] = useState(55); // vh
  const dragStartY = useRef(null);
  const dragStartH = useRef(null);

  const onDragStart = (e) => {
    dragStartY.current = e.touches?.[0]?.clientY ?? e.clientY;
    dragStartH.current = sheetHeight;
  };

  const onDragMove = (e) => {
    if (dragStartY.current === null) return;
    const currentY = e.touches?.[0]?.clientY ?? e.clientY;
    const deltaVh = ((dragStartY.current - currentY) / window.innerHeight) * 100;
    const newH = Math.min(95, Math.max(30, dragStartH.current + deltaVh));
    setSheetHeight(newH);
  };

  const onDragEnd = () => {
    if (sheetHeight < 35) close();        // 30vh 이하로 내리면 닫힘
    else if (sheetHeight > 75) setSheetHeight(93); // 75vh 이상이면 풀스크린
    else setSheetHeight(55);              // 중간이면 절반으로 스냅
    dragStartY.current = null;
  };

  // 열릴 때 기본 높이 리셋
  useEffect(() => {
    if (open) setSheetHeight(55);
  }, [open]);

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-300
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />

      {/* 시트 */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl border-t border-slate-200
          transition-transform duration-300 ease-out flex flex-col
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: `${sheetHeight}vh` }}
      >
        {/* 드래그 핸들 */}
        <div
          className="shrink-0 flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        >
          <div className="w-8 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* 헤더 */}
        <div className="px-5 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                {selectedSymptom?.symptom || ''}
              </p>
              <div className="flex items-center gap-2 mt-1">
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
              className="text-slate-400 p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <i className="ti ti-x" style={{ fontSize: 16 }} />
            </button>
          </div>
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

export default SymptomChatSheet;