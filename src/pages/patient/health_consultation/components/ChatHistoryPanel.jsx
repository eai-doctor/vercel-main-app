import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClockIcon } from '@/components/ui/icons';
import { useChatHistory } from '../hooks/useChatHistory';

const formatDate = (dateStr) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const toKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

  const [year, month, day] = dateStr.split('-').map(Number);
  const dKey = `${year}-${month}-${day}`;

  if (dKey === toKey(today)) return 'Today';
  if (dKey === toKey(yesterday)) return 'Yesterday';

  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatTime = (isoStr) =>
  new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

function DateHeader({ date, count, isExpanded, onClick, mobile }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 text-left transition-colors
        ${mobile
          ? 'py-2 bg-slate-50 border-t border-slate-100'
          : 'py-2.5 bg-slate-50 hover:bg-[#f5f7ff]'
        }`}
    >
      <span className={`font-semibold ${mobile ? 'text-[11px] text-slate-500' : 'text-[12px] text-[#2C3B8D]'}`}>
        {formatDate(date)}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400">
          {count} {mobile ? 'msgs' : 'messages'}
        </span>
        <svg
          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''} ${mobile ? 'w-3 h-3' : 'w-3.5 h-3.5'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
}

function HistoryItem({ item, mobile }) {
  return (
    <div className={`px-4 space-y-1.5 ${mobile ? 'py-2.5' : 'py-3 space-y-2'}`}>
      {/* 질문 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 flex-1 min-w-0">
          {!mobile && (
            <span className="text-[10px] font-semibold text-[#2C3B8D] mt-0.5 shrink-0">Q</span>
          )}
          <p className={`text-slate-800 leading-relaxed ${mobile ? 'text-[12px] font-medium flex-1' : 'text-[12px]'}`}>
            {item.message}
          </p>
        </div>
        <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">
          {formatTime(item.created_at)}
        </span>
      </div>
      <div className="flex items-start gap-1.5">
        {!mobile && (
          <span className="text-[10px] font-semibold text-emerald-600 mt-0.5 shrink-0">A</span>
        )}
        <p className={`text-slate-500 leading-relaxed line-clamp-${mobile ? 2 : 3} ${mobile ? 'text-[11px]' : 'text-[11px]'}`}>
          {item.response}
        </p>
      </div>
    </div>
  );
}

function PanelHeader({ historyDates, mobile, isOpen, onToggle }) {
  if (mobile) {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <ClockIcon className="w-3.5 h-3.5 text-[#2C3B8D]" />
          <span className="text-[12px] font-semibold text-slate-700">Chat History</span>
          {historyDates.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {historyDates.length}d
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
      <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
        <ClockIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
      </div>
      <h3 className="text-[14px] font-semibold text-slate-800">Chat History</h3>
      {historyDates.length > 0 && (
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
          {historyDates.length}d
        </span>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-6 gap-2">
      <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
      <span className="text-[12px] text-slate-400">Loading...</span>
    </div>
  );
}

function EmptyState({ mobile }) {
  return (
    <p className={`text-[12px] text-slate-400 italic text-center py-4 ${mobile ? '' : 'px-3'}`}>
      No chat history yet.
    </p>
  );
}

function ChatHistoryPanel({ isAuthenticated, userId, mobile = false }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const { isChatHistoryLoading, groupedHistory, historyDates } = useChatHistory(
    isAuthenticated,
    false,
    userId,
  );

  const isMobileOpen = expandedDate === 'open' || historyDates.some(d => d === expandedDate);

  if (!isAuthenticated) return null;

  const renderDates = () => {
    if (isChatHistoryLoading) return <LoadingSpinner />;
    if (historyDates.length === 0) return <EmptyState mobile={mobile} />;

    return historyDates.map(date => {
      const isExpanded = expandedDate === date;
      const toggleDate = () => {
        if (mobile) {
          setExpandedDate(prev => (prev === date ? 'open' : date));
        } else {
          setExpandedDate(prev => (prev === date ? null : date));
        }
      };

      return (
        <div key={date}>
          <DateHeader
            date={date}
            count={groupedHistory[date].length}
            isExpanded={isExpanded}
            onClick={toggleDate}
            mobile={mobile}
          />
          {isExpanded && (
            <div className={`divide-y divide-slate-50 ${mobile ? '' : 'max-h-64 overflow-y-auto'}`}>
              {groupedHistory[date].map((item, idx) => (
                <HistoryItem key={idx} item={item} mobile={mobile} />
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (mobile) {
    return (
      <div className="border-t border-slate-100 bg-white rounded-b-none shrink-0">
        <PanelHeader
          historyDates={historyDates}
          mobile
          isOpen={expandedDate === 'open' || historyDates.includes(expandedDate)}
          onToggle={() => setExpandedDate(prev => (prev === 'open' ? null : 'open'))}
        />
        {(expandedDate === 'open' || historyDates.includes(expandedDate)) && (
          <div className="max-h-72 overflow-y-auto border-t border-slate-100">
            {renderDates()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <PanelHeader historyDates={historyDates} />
      <div className="divide-y divide-slate-100">
        {renderDates()}
      </div>
    </div>
  );
}

export default ChatHistoryPanel;
