import { AiIcon, ClockIcon } from '@/components/ui/icons';

function ChatPanel({
  activeTab,
  messages,
  messagesContainerRef,
  messagesEndRef,
  isLoadingChat,
  input,
  setInput,
  sendMessage,
  selectedReport,
  clearChat,
}) {
  return (
    <div
      className={`w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col
        ${activeTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
      style={{ height: 'calc(100dvh - 160px)' }}
    >
      {/* Subheader */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#f5f7ff] rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <AiIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[14px] font-semibold text-slate-800">EboAI</h2>
            <p className="text-[10px] text-slate-400">Report analysis assistant</p>
          </div>
          {selectedReport && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D] font-semibold truncate max-w-[140px]">
              {selectedReport.filename}
            </span>
          )}
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-[#e6ecff] flex items-center justify-center mb-3">
              <AiIcon className="w-6 h-6 text-[#2C3B8D]" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Report Analysis Ready</h3>
            <p className="text-[12px] text-slate-500 max-w-sm">
              Select a report from the sidebar, then ask questions about the findings.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-[#2C3B8D] text-white rounded-br-sm'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'
                }`}
            >
              {msg.role === 'assistant' && !msg.isError && (
                <div className="flex items-center gap-1 mb-1.5">
                  <AiIcon className="w-3 h-3 text-[#2C3B8D]" />
                  <span className="text-[10px] font-semibold text-[#2C3B8D]">EboAI</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoadingChat && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-3 py-2.5">
              <div className="flex items-center gap-1 mb-1.5">
                <AiIcon className="w-3 h-3 text-[#2C3B8D]" />
                <span className="text-[10px] font-semibold text-[#2C3B8D]">EboAI</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#2C3B8D] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#2C3B8D] rounded-full animate-bounce [animation-delay:100ms]" />
                <div className="w-1.5 h-1.5 bg-[#2C3B8D] rounded-full animate-bounce [animation-delay:200ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={selectedReport ? `Ask about ${selectedReport.filename}...` : 'Select a report to begin...'}
            disabled={isLoadingChat || !selectedReport}
            className="flex-1 min-w-0 px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl
              focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
              text-slate-900 placeholder:text-slate-400 transition-colors disabled:opacity-50 disabled:bg-slate-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoadingChat || !input.trim() || !selectedReport}
            className="shrink-0 px-3.5 py-2.5 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[13px]
              font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoadingChat
              ? <ClockIcon className="w-4 h-4 animate-spin" />
              : <><span className="hidden sm:inline">Send</span><span>→</span></>
            }
          </button>
        </div>
        {!selectedReport && (
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Upload and select a report to start the conversation
          </p>
        )}
      </div>
    </div>
  );
}

export default ChatPanel;
