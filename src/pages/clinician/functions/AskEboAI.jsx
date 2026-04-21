import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { AiIcon } from "@/components/ui/icons";
import chatApi from "@/api/chatApi";
import { NavBar } from "@/components";

const SUGGESTIONS = [
  "What are the EBO criteria for sepsis?",
  "How do I manage a patient with acute chest pain?",
  "What are the triage priorities for trauma patients?",
  "Summarize the Ottawa ankle rules",
];

function AskEboAI() {
  const { t } = useTranslation(['functions', 'common']);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory, isLoading]);

  useEffect(() => {
       window.scrollTo(0, 0)
     }, [])

  const handleSendMessage = async (overrideMessage) => {
    const userMessage = (overrideMessage ?? message).trim();
    if (!userMessage) return;

    setMessage("");
    setIsLoading(true);
    setError("");
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await chatApi.askAboAi(userMessage, chatHistory);
      if (response.data.success) {
        setChatHistory(prev => [...prev, { role: "assistant", content: response.data.response }]);
      } else {
        setError(t('functions:askEboAI.errorResponse', 'Failed to get response from EboAI'));
      }
    } catch (err) {
      setError(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isEmpty = chatHistory.length === 0;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
    <NavBar />
    <main className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-6 min-h-0">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-6 pb-4 min-h-0">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center pt-16 pb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#e6ecff] flex items-center justify-center mb-5">
                <AiIcon className="w-8 h-8 text-[#2C3B8D]" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {t('functions:askEboAI.welcome', 'Ask EBO AI')}
              </h2>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                {t('functions:askEboAI.welcomeSubtitle', 'Ask clinical questions and get evidence-based answers to support your decisions.')}
              </p>

              {/* Suggestion chips */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(s)}
                    className="text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-[#2C3B8D] hover:text-[#2C3B8D] hover:bg-[#f5f7ff] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#e6ecff] flex items-center justify-center shrink-0 mt-1">
                  <AiIcon className="w-4 h-4 text-[#2C3B8D]" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#2C3B8D] text-white rounded-tr-sm"
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
              }`}>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1 text-xs font-bold text-slate-500">
                  You
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#e6ecff] flex items-center justify-center shrink-0">
                <AiIcon className="w-4 h-4 text-[#2C3B8D]" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-auto max-w-md px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div ref={bottomRef} />   

        </div>

        {/* Input bar */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden focus-within:border-[#2C3B8D] transition-colors">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('functions:askEboAI.inputPlaceholder', 'Ask a clinical question…')}
            rows={2}
            disabled={isLoading}
            className="w-full px-4 pt-3 pb-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-transparent"
          />
          <div className="flex items-center justify-between px-3 pb-2.5">
            {chatHistory.length > 0 ? (
              <button
                onClick={() => { setChatHistory([]); setError(''); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {t('functions:askEboAI.clearChat', 'Clear conversation')}
              </button>
            ) : (
              <span className="text-xs text-slate-300">Shift+Enter for new line</span>
            )}
            <button
              onClick={() => handleSendMessage()}
              disabled={!message.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2C3B8D] hover:bg-[#233070] text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('common:buttons.send', 'Send')}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </main>

    </div>
  );
}

export default AskEboAI;