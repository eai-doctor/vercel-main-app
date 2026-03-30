import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "./config";
import Header from "./components/Header";
import { AiIcon } from "./components/icons";

function AskEboAI() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const CHATBOX_SERVICE_URL = config.chatboxServiceUrl;

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setError("");

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await axios.post(
        `${CHATBOX_SERVICE_URL}/api/chat`,
        {
          message: userMessage,
          patient_summary: "",
          chat_history: chatHistory,
          mode: 'clinician'
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": config.chatboxApiKey
          }
        }
      );

      if (response.data.success) {
        setChatHistory(prev => [
          ...prev,
          { role: "assistant", content: response.data.response }
        ]);
      } else {
        setError(t('functions:askEboAI.errorResponse', 'Failed to get response from EboAI'));
      }
    } catch (err) {
      console.error("EboAI error:", err);
      setError(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:askEboAI.title')}
        subtitle={t('functions:askEboAI.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-4 h-[500px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-[#64748b] mt-20">
                <div className="flex justify-center mb-4"><AiIcon className="w-16 h-16 text-[#3b82f6]" /></div>
                <h3 className="text-xl font-semibold mb-2">{t('functions:askEboAI.welcome')}</h3>
                <p className="text-sm">{t('functions:askEboAI.welcomeSubtitle')}</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white"
                        : "bg-white border border-[rgba(15,23,42,0.1)] text-[#1e293b]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#64748b] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#64748b] rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-[#64748b] rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-center space-x-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('functions:askEboAI.inputPlaceholder')}
              className="flex-1 border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6] resize-none"
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common:buttons.send')}
            </button>
          </div>
        </div>

        {/* Clear Chat Button */}
        {chatHistory.length > 0 && (
          <div className="text-center">
            <button
              onClick={() => setChatHistory([])}
              className="px-4 py-2 bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] rounded-lg hover:opacity-90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(59,130,246,0.25)] transition-all text-sm"
            >
              {t('functions:askEboAI.clearChat')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AskEboAI;