import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";

import config from "./config";
import { useAuth } from '@/context/AuthContext';
import { HospitalIcon, UserIcon } from "@/components/icons";
import { LoginModal } from "@/features/modal";
import { useLanguage } from "@/hooks";

function LandingPage() {
  const navigate = useNavigate();
  const { getLanguageCode, changeLanguage } = useLanguage();

  const { t } = useTranslation(['landing', 'common']);
  const { logout, user, isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [userCount, setUserCount] = useState(null);

  // Fetch active user count
  useEffect(() => {
    axios.get(`${config.backendUrl}/api/stats`)
      .then(res => setUserCount(res.data.user_count))
      .catch(() => {});
  }, []);

  // If already authenticated, redirect based on stored portal preference (role-aware)
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const lastPortal = localStorage.getItem("last_portal");
      if (lastPortal) {
        // Don't send patients to the clinic portal
        if (lastPortal === "/clinics" && user?.role === "patient") {
          navigate("/personal");
        } else {
          navigate(lastPortal);
        }
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  const portals = [
    {
      id: "clinics",
      title: t('landing:portals.clinic.title'),
      description: t('landing:portals.clinic.description'),
      icon: HospitalIcon,
      route: "/clinics",
      color: "from-blue-400 via-blue-500 to-blue-600",
      defaultRole: "clinician",
    },
    {
      id: "personal",
      title: t('landing:portals.personal.title'),
      description: t('landing:portals.personal.description'),
      icon: UserIcon,
      route: "/personal",
      color: "from-blue-500 via-blue-600 to-blue-700",
      defaultRole: "patient",
    },
  ];

  const handlePortalClick = (portal) => {
    if (portal.id === "personal") {
      // Skip login — let patients browse freely
      navigate("/personal");
      return;
    }
    // Clinics portal requires login
    setSelectedPortal(portal);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (userData) => {
    if (!selectedPortal) return;

    // Clinic Portal requires clinician or admin role
    if (selectedPortal.id === "clinics" && userData.role !== "clinician" && userData.role !== "admin") {
      logout();
      // Keep modal open — LoginModal will show the error via its own state
      return;
    }

    localStorage.setItem("last_portal", selectedPortal.route);
    //260311 saebyeok
    //if language has a preset, use it; otherwise, set it to english
    const code = getLanguageCode(userData.preferences.language);
    changeLanguage(code)

    setShowLoginModal(false);
    setSelectedPortal(null);
    navigate(selectedPortal.route);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setSelectedPortal(null);
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
              <p className="text-sm text-[#475569] mt-1">{t('common:appSubtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* <LanguageSwitcher /> */}
              <img
                src="/images/medical-icons/Healthcare AI Logo Design.png"
                alt="Healthcare AI Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-gradient-section">
        {/* Welcome Section */}
        <div className="text-center mb-12 bg-grid-pattern py-8 -mx-6 px-6">
          <h2 className="text-3xl font-semibold text-[#1e293b] mb-3">
            {t('landing:welcome.title')}
          </h2>
          <p className="text-[#475569] max-w-2xl mx-auto">
            {t('landing:welcome.subtitle')}
          </p>
        </div>

        <div className="gradient-divider max-w-5xl mx-auto" />

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {portals.map((portal, index) => (
            <button
              key={portal.id}
              onClick={() => handlePortalClick(portal)}
              className="shimmer card-accent-top animate-fade-in-up group relative bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_25px_50px_rgba(15,23,42,0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]"
              style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-[rgba(59,130,246,0.08)] icon-glow rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.1)] transform group-hover:scale-110 transition-transform duration-300">
                    <portal.icon className="w-12 h-12 text-[#3b82f6]" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">
                  {portal.title}
                </h3>

                {/* Description */}
                <p className="text-[#475569] text-sm leading-relaxed">
                  {portal.description}
                </p>

                {/* Active user count for Personal Portal */}
                {portal.id === 'personal' && userCount !== null && (
                  <p className="text-[#475569] text-sm mt-2">
                    {t('landing:userCountBefore')}<span className="font-bold text-green-500">{userCount}</span>{t('landing:userCountAfter')}
                  </p>
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

        {/* Info Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.1)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse status-glow"></div>
            <span className="text-sm text-[#475569] font-medium">{t('common:states.systemOnline')}</span>
          </div>
        </div>

      </main>


      {/* Login/Register Modal */}
      <LoginModal
        isOpen={showLoginModal && !!selectedPortal}
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
        portalTitle={selectedPortal?.title || ""}
        portalIcon={selectedPortal?.icon}
        defaultRole={selectedPortal?.defaultRole || "clinician"}
      />

    </div>
  );
}

export default LandingPage;
