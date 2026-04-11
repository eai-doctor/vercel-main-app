import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AiIcon, XCircleIcon, LightbulbIcon, ClockIcon } from '@/components/ui/icons';
import chatApi from "@/api/chatApi";

export default function ChatboxModal({ isOpen, onClose, patientSummary }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { t } = useTranslation('functions');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen && patientSummary && messages.length === 0) fetchSuggestions();
  }, [isOpen, patientSummary]);

  const fetchSuggestions = async () => {
    try {
      const response = await chatApi.getSuggestions(patientSummary || '');
      if (response.data.success && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch {
      setSuggestions(t('chatbox.defaultSuggestions', { returnObjects: true }));
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await chatApi.sendMessage(textToSend, patientSummary || '', messages);
      if (response.data.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.response,
          formatted: response.data.formatted_response
        }]);
      } else throw new Error(response.data.error || 'Failed');
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('chatbox.errorMessage'),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (s) => { setInput(s); sendMessage(s); };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    fetchSuggestions();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl h-[700px] flex flex-col border border-slate-200 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <AiIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-slate-800 leading-tight">
                {t('chatbox.title', 'AI Clinical Assistant')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('chatbox.subtitle', 'Context-aware · Patient-specific')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500
                  hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <XCircleIcon className="w-3.5 h-3.5" />
                {t('common:buttons.clear', 'Clear')}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Messages ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">

          {/* Welcome */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-[#e6ecff] flex items-center justify-center mb-4">
                <AiIcon className="w-7 h-7 text-[#2C3B8D]" />
              </div>
              <h3 className="text-[17px] font-semibold text-slate-800 mb-1">
                {t('chatbox.welcome', 'How can I help?')}
              </h3>
              <p className="text-[13px] text-slate-500 max-w-sm leading-relaxed">
                {t('chatbox.welcomeSubtitle', 'Ask anything about this patient\'s case, medications, or differentials.')}
              </p>

              {patientSummary && (
                <div className="mt-4 bg-white border border-[#c7d2f8] rounded-xl px-4 py-3
                  text-left max-w-sm w-full">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2C3B8D] mb-1">
                    {t('chatbox.patientContextLoaded', 'Patient context loaded')}
                  </p>
                  <p className="text-[12px] text-slate-500 line-clamp-3">{patientSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-[#2C3B8D] text-white rounded-br-sm'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                  : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' && !msg.isError && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <AiIcon className="w-3.5 h-3.5 text-[#2C3B8D]" />
                    <span className="text-[11px] font-semibold text-[#2C3B8D]">EboAI</span>
                  </div>
                )}
                {msg.role === 'assistant' && msg.formatted ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: msg.formatted }}
                    className="prose prose-sm max-w-none"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AiIcon className="w-3.5 h-3.5 text-[#2C3B8D]" />
                  <span className="text-[11px] font-semibold text-[#2C3B8D]">EboAI</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#2C3B8D] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[#2C3B8D] rounded-full animate-bounce [animation-delay:100ms]" />
                  <div className="w-2 h-2 bg-[#2C3B8D] rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggestions ────────────────────────────────────── */}
        {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
          <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
              <LightbulbIcon className="w-3.5 h-3.5 text-[#2C3B8D]" />
              {t('chatbox.suggestedQuestions', 'Suggested questions')}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#2C3B8D]
                    text-[12px] font-semibold rounded-full border border-[#c7d2f8]
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ──────────────────────────────────────────── */}
        <div className="px-4 py-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('chatbox.inputPlaceholder', 'Ask about medications, differentials, next steps...')}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-[14px] border border-slate-200 rounded-xl
                focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
                text-slate-900 placeholder:text-slate-400 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px]
                font-semibold rounded-xl transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <ClockIcon className="w-4 h-4 animate-spin" />
                  {t('common:states.thinking', 'Thinking...')}
                </>
              ) : (
                <>
                  {t('common:buttons.send', 'Send')}
                  <span className="text-white/70">→</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">
            {t('chatbox.pressEnter', 'Press Enter to send')}
          </p>
        </div>
      </div>
    </div>
  );
}