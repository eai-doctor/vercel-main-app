import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import config from '../../config';
import { AiIcon, XCircleIcon, LightbulbIcon, ClockIcon } from '@/components/icons';

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch suggestions when modal opens
  useEffect(() => {
    if (isOpen && patientSummary && messages.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen, patientSummary]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.post(
        `${config.chatboxServiceUrl}/api/chat/suggestions`,
        {
          patient_summary: patientSummary || '',
          mode: 'clinician'
        },
        {
          headers: {
            'X-API-Key': config.chatboxApiKey
          }
        }
      );

      if (response.data.success && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Use default suggestions
      setSuggestions(t('chatbox.defaultSuggestions', { returnObjects: true }));
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await axios.post(
        `${config.chatboxServiceUrl}/api/chat`,
        {
          message: textToSend,
          patient_summary: patientSummary || '',
          chat_history: messages,
          mode: 'clinician'
        },
        {
          headers: {
            'X-API-Key': config.chatboxApiKey
          }
        }
      );

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.response,
          formatted: response.data.formatted_response
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: t('chatbox.errorMessage'),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    sendMessage(suggestion);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    fetchSuggestions();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] w-full max-w-3xl h-[700px] flex flex-col border border-[rgba(15,23,42,0.1)]">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] p-4 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] backdrop-blur-sm rounded-lg flex items-center justify-center">
              <AiIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">{t('chatbox.title')}</h2>
              <p className="text-blue-100 text-xs">{t('chatbox.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear chat history"
              >
                <XCircleIcon className="w-4 h-4 inline-block mr-1" /> {t('common:buttons.clear')}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f4f8]">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center"><AiIcon className="w-16 h-16 text-[#3b82f6]" /></div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-2">{t('chatbox.welcome')}</h3>
              <p className="text-[#475569] mb-4">
                {t('chatbox.welcomeSubtitle')}
              </p>
              {patientSummary && (
                <div className="bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-lg p-3 text-sm text-left max-w-md mx-auto card-hover">
                  <p className="font-semibold text-[#1e293b] mb-1">{t('chatbox.patientContextLoaded')}</p>
                  <p className="text-[#475569] text-xs line-clamp-3">{patientSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] ${
                  msg.role === 'user'
                    ? 'bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white'
                    : msg.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-white text-[#1e293b] border border-[rgba(15,23,42,0.1)]'
                }`}
              >
                {msg.role === 'user' && (
                  <div className="flex items-center space-x-2 mb-1 opacity-80">
                    <span className="text-xs font-semibold">{t('chatbox.you')}</span>
                  </div>
                )}
                {msg.role === 'assistant' && !msg.isError && (
                  <div className="flex items-center space-x-2 mb-2">
                    <AiIcon className="w-5 h-5 text-[#3b82f6]" />
                    <span className="text-xs font-semibold text-[#3b82f6]">EboAI</span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  {msg.role === 'assistant' && msg.formatted ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.formatted }}
                      className="text-sm leading-relaxed"
                    />
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)]">
                <div className="flex items-center space-x-2">
                  <AiIcon className="w-5 h-5 text-[#3b82f6]" />
                  <span className="text-xs font-semibold text-[#3b82f6]">EboAI</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {showSuggestions && suggestions.length > 0 && messages.length === 0 && (
          <div className="px-4 py-3 bg-[rgba(59,130,246,0.04)] border-t border-[rgba(15,23,42,0.1)]">
            <p className="text-xs font-semibold text-[#1e293b] mb-2 flex items-center gap-1"><LightbulbIcon className="w-4 h-4 text-[#3b82f6]" /> {t('chatbox.suggestedQuestions')}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-white hover:bg-[rgba(59,130,246,0.08)] text-[#3b82f6] rounded-full text-xs border border-[rgba(59,130,246,0.2)] hover:border-[rgba(59,130,246,0.4)] transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.1)] card-hover"
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[rgba(15,23,42,0.1)] bg-white rounded-b-xl">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('chatbox.inputPlaceholder')}
              className="flex-1 px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] text-sm transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm btn-glow transition-all duration-250 ease"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 animate-spin" />
                  <span>{t('common:states.thinking')}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>{t('common:buttons.send')}</span>
                  <span>→</span>
                </span>
              )}
            </button>
          </div>
          <p className="text-xs text-[#94a3b8] mt-2 text-center">
            {t('chatbox.pressEnter')}
          </p>
        </div>
      </div>
    </div>
  );
}