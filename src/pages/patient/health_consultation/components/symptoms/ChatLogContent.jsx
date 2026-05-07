import React from 'react';
import ReactMarkdown from 'react-markdown';

function ChatLogContent({ chatLogs, isLoading, expandedId, setExpandedId }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
        <span className="text-[12px] text-slate-400">Loading consultations...</span>
      </div>
    );
  }

  if (!chatLogs.length) {
    return (
      <p className="text-[12px] text-slate-400 text-center py-10">No chat logs found.</p>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {chatLogs.map((log, idx) => {
        const isExpanded = expandedId === log.consultation_id;
        return (
          <div key={log.consultation_id}>
            {/* consultation 헤더 */}
            <button
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
              onClick={() => setExpandedId(isExpanded ? null : log.consultation_id)}
            >
              <div>
                <p className="text-[13px] font-semibold text-slate-700">
                  Session {chatLogs.length - idx}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : 'Unknown date'}
                  {' · '}{log.messages?.length || 0} messages
                </p>
              </div>
              <i
                className={`ti ${isExpanded ? 'ti-chevron-up' : 'ti-chevron-down'} text-slate-300`}
                style={{ fontSize: 16 }}
              />
            </button>

            {isExpanded && (
              <div>
                {/* summary */}
                {log.summary && (
                    <div className="mx-4 mb-3 p-3 bg-[#f5f7ff] rounded-xl border border-[#e0e7ff]">
                        <p className="text-[10px] font-semibold text-[#2C3B8D] mb-1 uppercase tracking-wide">
                        Summary
                        </p>
                        <div className="text-[12px] text-slate-600 leading-relaxed prose prose-sm max-w-none
                        prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-slate-700">
                        <ReactMarkdown>{log.summary}</ReactMarkdown>
                        </div>
                    </div>
                    )}

                {/* chat bubbles */}
                <div className="px-4 pb-4 space-y-2">
                  {(log.messages || []).map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[78%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed
                          ${msg.role === 'user'
                            ? 'bg-[#2C3B8D] text-white rounded-br-sm'
                            : 'bg-slate-100 text-slate-700 rounded-bl-sm'}`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ChatLogContent;