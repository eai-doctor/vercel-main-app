import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from "@/components/ProfileDropdown.jsx";
import { useAuthModal } from '@/context/AuthModalContext';

import { useMedicalReport } from './hooks/useMedicalReport';
import ChatPanel from './components/ChatPanel';
import ReportSidebar from './components/ReportSidebar';

const TABS = [
  { id: 'chat', label: 'Chat' },
  { id: 'reports', label: 'Reports' },
];

export default function MedicalReportAnalysis() {
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();
  const { openLogin } = useAuthModal();

  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const {
    reports,
    selectedReportId,
    selectedReport,
    fileInputRef,
    handleFileInputChange,
    handleSelectReport,
    isUploadingReport,
    messages,
    input,
    setInput,
    isLoadingChat,
    sendMessage,
    clearChat,
    testResults,
    isLoadingTests,
    updateTestResult,
    saveStatus,
  } = useMedicalReport();

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoadingChat]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-[#2C3B8D] shadow-sm mx-3 mt-3 mb-0 p-3 rounded-2xl lg:mx-6 lg:mt-6 lg:p-5">

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
              Medical Report Analysis
            </h1>
            <p className="text-white/60 text-[13px] mt-0.5">AI-powered report interpretation</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold rounded-xl transition-colors border border-white/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
            {isAuthenticated && isPatient
              ? <ProfileDropdown variant="dark" />
              : <button onClick={() => openLogin()} className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-[13px] font-semibold rounded-xl transition-colors border border-white/20">Sign In</button>
            }
          </div>
        </div>

        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center bg-white/15 rounded-lg border border-white/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <div>
              <h1 className="text-[16px] font-bold text-white leading-tight">Medical Report Analysis</h1>
              <p className="text-white/60 text-[11px]">AI-powered report interpretation</p>
            </div>
          </div>
          {isAuthenticated && isPatient
            ? <ProfileDropdown variant="dark" />
            : <button onClick={() => openLogin()} className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-[12px] font-semibold rounded-lg border border-white/20">Sign In</button>
          }
        </div>

        {/* Mobile tabs */}
        <div className="flex lg:hidden bg-white/10 rounded-xl p-1 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-[12px] font-semibold transition-all
                ${activeTab === tab.id ? 'bg-white text-[#2C3B8D]' : 'text-white/70 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-5 p-3 lg:p-6 max-w-screen-2xl mx-auto">
        <ChatPanel
          activeTab={activeTab}
          messages={messages}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          isLoadingChat={isLoadingChat}
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          selectedReport={selectedReport}
          clearChat={clearChat}
        />
        <ReportSidebar
          activeTab={activeTab}
          reports={reports}
          selectedReportId={selectedReportId}
          handleSelectReport={handleSelectReport}
          fileInputRef={fileInputRef}
          handleFileInputChange={handleFileInputChange}
          isUploadingReport={isUploadingReport}
          testResults={testResults}
          isLoadingTests={isLoadingTests}
          onUpdateTestResult={updateTestResult}
          saveStatus={saveStatus}
        />
      </div>
    </div>
  );
}
