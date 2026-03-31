import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

import config from "@/config";
import { useAuth } from "@/context/AuthContext";
import { FeatureCard, Header } from "@/components";
import { LoginModal } from "@/components/modal";
import { ChatIcon, DnaIcon, AlertIcon, ClipboardListIcon, UserIcon } from "@/components/ui/icons";

function PatientHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["patient", "common", "auth"]);
  const { isAuthenticated, user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [pendingRoute, setPendingRoute] = useState(null);

  const handleFeatureClick = useCallback(
    (module) => {
      if (module.externalUrl) {
        window.open(module.externalUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (!module.requiresAuth || isAuthenticated) {
        navigate(module.route);
        return;
      }

      if (!loading) {
        setPendingRoute(module.route);
        window.location.replace("/clinic-login"); 
      }
    },
    [isAuthenticated, loading, navigate]
  );

  const handleOnSignInBtnClick = () => setShowLoginModal(true);

  const handleCloseModal = () => setShowLoginModal(false);
  const handleLoginSuccess = () => setShowLoginModal(false);

  
  const modules = [
    {
      id: "personal-medical",
      title: t("patient:home.modules.healthConsultation.title"),
      description: t("patient:home.modules.healthConsultation.description"),
      icon: <ChatIcon className="w-8 h-8 text-blue-500" />,
      route: "/personal-genetic",
      requiresAuth: false,
      disabled:true
    },
    {
      id: "genetic-consultation",
      title: t("patient:home.modules.geneticConsultation.title"),
      description: t("patient:home.modules.geneticConsultation.description"),
      icon: <DnaIcon className="w-8 h-8 text-blue-500" />,
      route: "/genetic",
      externalUrl:
        "https://ai-doctor-genetic-frontend-647783808407.northamerica-northeast1.run.app",
      requiresAuth: false,
      disabled:true,
    },
    {
      id: "medical-profile",
      title: t("patient:home.modules.medicalProfile.title"),
      description: t("patient:home.modules.medicalProfile.description"),
      icon: <ClipboardListIcon className="w-8 h-8 text-blue-500" />,
      route: "/medical-profile",
      requiresAuth: !user && true,
      disabled:false,
      onRequireAuth:()=>setShowLoginModal(true)
    },
    {
      id: "self-triage",
      title: t("patient:home.modules.selfTriage.title"),
      description: t("patient:home.modules.selfTriage.description"),
      icon: <AlertIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/triage-engine",
      requiresAuth: !user && true,
      disabled:false,
      onRequireAuth:()=>setShowLoginModal(true)
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Header */}
      <Header handleOnSignInBtnClick={handleOnSignInBtnClick} />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-14 text-center">
        <h2 className="text-4xl font-semibold text-gray-800 mb-3">
          {t("patient:home.welcome.title")}
        </h2>
        <p className="text-lg text-gray-500">
          {t("patient:home.welcome.subtitle")}
        </p>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {modules.map((module) => (
            <FeatureCard
              key={module.id}
              icon={module.icon}
              title={module.title}
              description={module.description}
              onClick={() => handleFeatureClick(module)}
              disabled={module.disabled}
              requiresAuth={module.requiresAuth}
              onRequireAuth={module.onRequireAuth}
            />
          ))}
        </div>
      </section>

      {/* Status */}
      <div className="flex justify-center pb-16">
        <div className="flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600 text-sm">
            System Status: Online
          </span>
        </div>
      </div>

    </div>
  );
}

export default PatientHomePage;