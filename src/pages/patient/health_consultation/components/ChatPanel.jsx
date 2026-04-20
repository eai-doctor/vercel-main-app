import {
  AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon,
  MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
} from '@/components/ui/icons';

function ChatPanel({
    messages, 
    messagesContainerRef,
    messagesEndRef ,
    generateChatSummary, 
    handleClearChat, 
    isGeneratingChatSummary, 
    activeTab, 
    t, 
    isLoadingChat, 
    suggestions, 
    showSuggestions, 
    handleSuggestionClick, 
    input, 
    setInput, 
    sendMessage, 
    plusMenuRef, 
    showPlusMenu, 
    setShowPlusMenu ,
    isUploadingReport, 
    isAuthenticated, 
    labReportInputRef, 
    openLogin, 
    loading,
    uploadLabReport,
    FREE_MESSAGE_LIMIT,
    getStoredMessageCount   
}) {
    return (
        <div
            className={`w-full lg:w-2/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col
            ${activeTab !== 'chat' ? 'hidden lg:flex' : 'flex'}`}
            style={{ height: 'calc(100dvh - 160px)' }}
        >
            {/* Chat subheader */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#f5f7ff] rounded-t-2xl shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                    <AiIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
                    </div>
                    <div>
                    <h2 className="text-[14px] font-semibold text-slate-800">{t('chat.assistantName', 'EboAI')}</h2>
                    <p className="text-[10px] text-slate-400">{t('chat.assistantSubtitle', 'Patient health assistant')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={generateChatSummary} disabled={isGeneratingChatSummary}
                        className="cursor-pointer text-[11px] font-semibold text-[#2C3B8D] px-2.5 py-1.5 rounded-lg hover:bg-[#eef2ff] transition-colors disabled:opacity-50">
                        {isGeneratingChatSummary ? t('common:states.generating') : t('chat.summarize', 'Summarize')}
                    </button>
                    {/* {messages.some(m => m.role === 'user') && (
                    <button onClick={generateChatSummary} disabled={isGeneratingChatSummary}
                        className="text-[11px] font-semibold text-[#2C3B8D] px-2.5 py-1.5 rounded-lg hover:bg-[#eef2ff] transition-colors disabled:opacity-50">
                        {isGeneratingChatSummary ? t('common:states.generating') : t('chat.summarize', 'Summarize')}
                    </button>
                    )} */}
                    {messages.length > 0 && (
                    <button onClick={handleClearChat}
                        className="cursor-pointer text-[11px] text-slate-400 hover:text-slate-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                        {t('common:buttons.clear', 'Clear')}
                    </button>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 min-h-0">
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#e6ecff] flex items-center justify-center mb-3">
                    <AiIcon className="w-6 h-6 text-[#2C3B8D]" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-800 mb-1">{t('chat.welcomeTitle', 'How can I help?')}</h3>
                  <p className="text-[12px] text-slate-500 max-w-sm">{t('chat.welcomeDescription', 'Ask about your symptoms, medications, or upcoming appointment.')}</p>
                </div>
              )}
  
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-[#2C3B8D] text-white rounded-br-sm'
                      : msg.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'}`}>
                    {msg.role === 'assistant' && !msg.isError && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <AiIcon className="w-3 h-3 text-[#2C3B8D]" />
                        <span className="text-[10px] font-semibold text-[#2C3B8D]">EboAI</span>
                      </div>
                    )}
                    {msg.role === 'assistant' && msg.formatted
                      ? <div dangerouslySetInnerHTML={{ __html: msg.formatted }} className="prose prose-sm max-w-none" />
                      : <p className="whitespace-pre-wrap">{msg.content}</p>
                    }
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
  
            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
              <div className="px-3 py-2.5 bg-white border-t border-slate-100 shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button key={idx} onClick={() => handleSuggestionClick(s)} disabled={isLoadingChat}
                      className="px-2.5 py-1 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#2C3B8D] text-[11px] font-semibold rounded-full border border-[#c7d2f8] transition-colors disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
  
            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-100 bg-white rounded-b-2xl shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  type="text" value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={t('chat.inputPlaceholder', 'Ask about your symptoms...')}
                  disabled={isLoadingChat}
                  className="flex-1 min-w-0 px-3 py-2.5 text-[13px] border border-slate-200 rounded-xl
                    focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
                    text-slate-900 placeholder:text-slate-400 transition-colors disabled:opacity-50"
                />
                <div className="relative shrink-0" ref={plusMenuRef}>
                  <button
                    onClick={() => setShowPlusMenu(p => !p)} disabled={isUploadingReport}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200
                      bg-slate-50 hover:bg-[#eef2ff] hover:border-[#2C3B8D] text-slate-500
                      hover:text-[#2C3B8D] transition-all disabled:opacity-50 text-lg font-light"
                  >
                    {isUploadingReport
                      ? <div className="w-3.5 h-3.5 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
                      : '+'}
                  </button>
                  {showPlusMenu && (
                    <div className="absolute bottom-12 right-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-[170px] z-20">
                      <button
                        onClick={() => isAuthenticated && labReportInputRef.current?.click()}
                        disabled={!isAuthenticated}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors
                          ${isAuthenticated ? 'text-slate-700 hover:bg-[#f5f7ff]' : 'text-slate-400 cursor-not-allowed'}`}
                      >
                        <span>📋</span><span>Upload lab report</span>
                        {!isAuthenticated && <span className="ml-auto text-[10px]">🔒</span>}
                      </button>
                    </div>
                  )}
                  <input ref={labReportInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={uploadLabReport} />
                </div>
                <button
                  onClick={() => sendMessage()} disabled={isLoadingChat || !input.trim()}
                  className="shrink-0 px-3.5 py-2.5 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[13px]
                    font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isLoadingChat
                    ? <ClockIcon className="w-4 h-4 animate-spin" />
                    : <><span className="hidden sm:inline">{t('common:buttons.send', 'Send')}</span><span>→</span></>
                  }
                </button>
              </div>
              {!isAuthenticated && !loading && (
                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  {t('chat.freeMessagesRemaining', { count: Math.max(0, FREE_MESSAGE_LIMIT - getStoredMessageCount()) })} —{' '}
                  <button onClick={() => openLogin()} className="text-[#2C3B8D] hover:underline font-medium">{t('common:buttons.signIn', 'sign in')}</button>{' '}
                  {t('chat.forUnlimited', 'for unlimited')}
                </p>
              )}
            </div>
      </div>)
}

export default ChatPanel;