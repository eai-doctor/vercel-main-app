import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "./config";

import { useAuth } from '@/context/AuthContext';
import { LoginModal } from "@/features/modal";
import { ProfileDropdown, LanguageSwitcher } from "@/components";
import { ChatIcon, DnaIcon, AlertIcon, ClipboardListIcon, UserIcon, CheckCircleIcon, XCircleIcon, CalendarIcon } from "./components/icons";

function PatientHomePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['patient', 'common', 'auth']);
  const { isAuthenticated, user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Consent gate for logged-in users: redirect to /consent if privacy policy not accepted
  useEffect(() => {
    if (isAuthenticated && !loading && user?.consents?.privacy_policy?.accepted !== true) {
      navigate('/consent', { replace: true });
    }
  }, [isAuthenticated, loading, user?.consents?.privacy_policy?.accepted, navigate]);

  // Role guard: redirect non-patient authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && !loading && user?.role && user.role !== 'patient') {
      navigate('/clinics', { replace: true });
    }
  }, [isAuthenticated, loading, user?.role, navigate]);

  const [pendingRoute, setPendingRoute] = useState(null);

  // Consultation summaries
  const [summaries, setSummaries] = useState([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [expandedSummaryId, setExpandedSummaryId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const modules = [
    {
      id: "personal-medical",
      title: t('patient:home.modules.healthConsultation.title'),
      description: t('patient:home.modules.healthConsultation.description'),
      icon: ChatIcon,
      route: "/personal-genetic",
      color: "from-blue-400 via-blue-500 to-blue-600",
      requiresAuth: false,
    },
    {
      id: "genetic-consultation",
      title: t('patient:home.modules.geneticConsultation.title'),
      description: t('patient:home.modules.geneticConsultation.description'),
      icon: DnaIcon,
      route: "/genetic",
      externalUrl: "https://vercel-genetic-frontend.vercel.app",
      color: "from-blue-500 via-blue-600 to-blue-700",
      requiresAuth: false,
    },
    {
      id: "medical-profile",
      title: t('patient:home.modules.medicalProfile.title'),
      description: t('patient:home.modules.medicalProfile.description'),
      icon: ClipboardListIcon,
      route: "/medical-profile",
      color: "from-emerald-400 via-emerald-500 to-green-600",
      requiresAuth: true,
    },
    {
      id: "self-triage",
      title: t('patient:home.modules.selfTriage.title'),
      description: t('patient:home.modules.selfTriage.description'),
      icon: AlertIcon,
      route: "/personal/triage-engine",
      color: "from-blue-400 to-blue-600",
      requiresAuth: true,
    },
  ];

  const handleModuleClick = (module) => {
    if (module.externalUrl) {
      window.open(module.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!module.requiresAuth || isAuthenticated) {
      navigate(module.route);
      return;
    }
    // Not authenticated and module requires auth — show login modal
    if (!loading) {
      setPendingRoute(module.route);
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    setShowLoginModal(false);
    if (userData?.role === 'clinician' || userData?.role === 'admin') {
      navigate('/clinics', { replace: true });
      return;
    }
    if (pendingRoute) {
      navigate(pendingRoute);
    }
    setPendingRoute(null);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setPendingRoute(null);
  };

  // Fetch summaries when authenticated
  const fetchSummaries = async () => {
    try {
      setLoadingSummaries(true);
      const response = await axios.get(`${config.backendUrl}/api/consultation-summaries/`);
      setSummaries(response.data.summaries || []);
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoadingSummaries(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSummaries();
    } else {
      setSummaries([]);
    }
  }, [isAuthenticated]);

  const handleDeleteSummary = async (summaryId) => {
    if (!window.confirm(t('patient:summaries.confirmDelete'))) return;
    try {
      setDeletingId(summaryId);
      await axios.delete(`${config.backendUrl}/api/consultation-summaries/${summaryId}`);
      setSummaries(prev => prev.filter(s => s._id !== summaryId));
      if (expandedSummaryId === summaryId) setExpandedSummaryId(null);
    } catch (error) {
      console.error('Error deleting summary:', error);
      alert(t('patient:summaries.failedDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] z-50" />
      {/* Header */}
      <header className="mt-[3px] bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient">
                {t('common:appName')}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{t('patient:home.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* 031226 <button
                onClick={() => navigate("/")}
                className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#3b82f6] transition-colors"
              >
                &larr; {t('common:header.backToHome')}
              </button> */}
              <LanguageSwitcher />
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <button
                  onClick={() => {
                    setPendingRoute(null);
                    setShowLoginModal(true);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  {t('common:buttons.signIn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-gradient-section">
        {/* Welcome Section */}
        <div className="text-center mb-12 bg-grid-pattern py-8 -mx-6 px-6">
          <h2 className="text-3xl font-semibold text-[#1e293b] mb-3">
            {t('patient:home.welcome.title')}
          </h2>
          <p className="text-[#475569] max-w-2xl mx-auto">
            {t('patient:home.welcome.subtitle')}
          </p>
        </div>

        <div className="gradient-divider max-w-5xl mx-auto" />

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module)}
              className="group relative bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_25px_50px_rgba(15,23,42,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] shimmer card-accent-top animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-[rgba(59,130,246,0.08)] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.1)] transform group-hover:scale-110 transition-transform duration-300 icon-glow">
                    <module.icon className="w-12 h-12 text-[#3b82f6]" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">
                  {module.title}
                </h3>

                {/* Description */}
                <p className="text-[#475569] text-sm leading-relaxed">
                  {module.description}
                </p>

                {/* Auth badge for gated modules */}
                {module.requiresAuth && !isAuthenticated && (
                  <div className="mt-2 inline-flex items-center space-x-1 text-xs text-[#94a3b8]">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{t('auth:signInRequired')}</span>
                  </div>
                )}

                {/* Hover Arrow */}
                <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[#3b82f6] font-semibold text-sm flex items-center">
                    {t('common:buttons.enter')}
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* My Consultation Summaries */}
        {isAuthenticated && (
          <div className="max-w-5xl mx-auto mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1e293b] flex items-center space-x-2">
                <ClipboardListIcon className="w-7 h-7 text-[#3b82f6]" />
                <span>{t('patient:summaries.title')}</span>
              </h2>
              <button
                onClick={fetchSummaries}
                disabled={loadingSummaries}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium disabled:opacity-50"
              >
                {loadingSummaries ? t('common:states.loading') : t('common:buttons.refresh')}
              </button>
            </div>

            {loadingSummaries && summaries.length === 0 ? (
              <div className="text-center py-8 text-[#475569]">
                <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                {t('patient:summaries.loading')}
              </div>
            ) : summaries.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.1)]">
                <p className="text-[#475569]">{t('patient:summaries.noSummaries')}</p>
                <p className="text-sm text-[#94a3b8] mt-1">
                  {t('patient:summaries.noSummariesHint')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {summaries.map((s) => (
                  <div
                    key={s._id}
                    className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-[0_4px_12px_rgba(15,23,42,0.1)] overflow-hidden transition-all"
                  >
                    {/* Summary Header (clickable) */}
                    <button
                      onClick={() => setExpandedSummaryId(expandedSummaryId === s._id ? null : s._id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[rgba(59,130,246,0.04)] transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-[#1e293b]">
                            {new Date(s.created_at).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(59,130,246,0.1)] text-[#3b82f6]">
                            {s.message_count} {t('common:labels.messages')}
                          </span>
                          {s.model_used && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[rgba(15,23,42,0.05)] text-[#64748b]">
                              {s.model_used}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#475569] mt-1 truncate">
                          {s.summary.slice(0, 120)}...
                        </p>
                      </div>
                      <svg
                        className={`w-5 h-5 text-[#94a3b8] flex-shrink-0 ml-3 transition-transform ${expandedSummaryId === s._id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded Content */}
                    {expandedSummaryId === s._id && (
                      <div className="border-t border-[rgba(15,23,42,0.1)] p-4 space-y-3">
                        <div className="bg-[#f8fafc] rounded-lg p-4 text-sm text-[#1e293b] whitespace-pre-wrap leading-relaxed">
                          {s.summary}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteSummary(s._id)}
                            disabled={deletingId === s._id}
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === s._id ? t('patient:summaries.deleting') : t('common:buttons.delete')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.1)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse status-glow"></div>
            <span className="text-sm text-[#475569] font-medium">{t('common:states.securePrivate')}</span>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
        portalTitle={t('patient:portal.title')}
        portalIcon={UserIcon}
        defaultRole="patient"
        message={pendingRoute ? t('auth:signInToAccess') : undefined}
      />
    </div>
  );
}

export default PatientHomePage;
