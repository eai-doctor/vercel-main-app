import { useState } from 'react';

// Simple markdown-ish renderer for bold (**text**)
function renderContent(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ChatLogModal({ condition, chatLogs, onClose }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = chatLogs[selectedIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#f5f7ff] shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-800">Chat History</h3>
            <p className="text-[12px] text-slate-500 mt-0.5">{condition}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Consultation list sidebar */}
          <div className="w-[180px] shrink-0 border-r border-slate-100 overflow-y-auto bg-slate-50">
            {chatLogs.map((log, i) => (
              <button
                key={log.consultation_id}
                onClick={() => setSelectedIdx(i)}
                className={`w-full text-left px-3 py-3 border-b border-slate-100 transition-colors ${
                  selectedIdx === i
                    ? 'bg-[#eef2ff] text-[#2C3B8D]'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className={`text-[11px] font-semibold mb-0.5 ${selectedIdx === i ? 'text-[#2C3B8D]' : 'text-slate-400'}`}>
                  Consultation {i + 1}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {log.consultation_id.slice(0, 12)}…
                </div>
              </button>
            ))}
          </div>

          {/* Chat messages + summary */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 space-y-3">
              {selected.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#2C3B8D] text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {selected.summary && (
              <div className="shrink-0 border-t border-slate-100 bg-amber-50 px-4 py-3">
                <div className="text-[11px] font-semibold text-amber-700 mb-1.5 uppercase tracking-wide">
                  Consultation Summary
                </div>
                <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line">
                  {selected.summary}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}