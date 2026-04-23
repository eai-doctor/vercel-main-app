import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/context/AuthContext";
import { FeatureCard, Header, SystemStatus } from "@/components";
import { ChatIcon, DnaIcon, AlertIcon, ClipboardListIcon, UserIcon } from "@/components/ui/icons";
import { AuthModalProvider, useAuthModal } from "@/context/AuthModalContext";

function PatientHomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation(["patient", "common", "auth"]);
  const { isPatient, isAuthenticated , loading, accessToken } = useAuth();
  const { openLogin } = useAuthModal();

  const handleFeatureClick = useCallback(
    (module) => {
      if (module.externalUrl) {
        if (isAuthenticated) {
          const url = accessToken
            ? `${module.externalUrl}?token=${encodeURIComponent(accessToken)}`
            : module.externalUrl;
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          window.open(module.externalUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }

      if (!module.requiresAuth || isPatient) {
        navigate(module.route);
        return;
      }

      if (!loading) {
        // setPendingRoute(module.route);
        window.location.replace("/clinic-login"); 
      }
    },
    [isPatient, loading, navigate, accessToken]
  );

  const modules = [
    {
      id: "personal-medical",
      title: t("patient:home.modules.healthConsultation.title"),
      description: t("patient:home.modules.healthConsultation.description"),
      icon: <ChatIcon className="w-8 h-8 text-blue-500" />,
      route: "/health-consultation",
      requiresAuth: false,
      dsiabled:false
    },
    {
      id: "genetic-consultation",
      title: t("patient:home.modules.geneticConsultation.title"),
      description: t("patient:home.modules.geneticConsultation.description"),
      icon: <DnaIcon className="w-8 h-8 text-blue-500" />,
      externalUrl:
        "https://genetic.e-ai.ca/dashboard",
        // "http://localhost:4200/dashboard",
      requiresAuth: false,
    },
    {
      id: "medical-profile",
      title: t("patient:home.modules.medicalProfile.title"),
      description: t("patient:home.modules.medicalProfile.description"),
      icon: <ClipboardListIcon className="w-8 h-8 text-blue-500" />,
      route: "/medical-profile",
      requiresAuth: !isPatient && true,
      disabled:false,
      onRequireAuth:() => openLogin({ route : "/medical-profile" })
    },
    {
      id: "self-triage",
      title: t("patient:home.modules.selfTriage.title"),
      description: t("patient:home.modules.selfTriage.description"),
      icon: <AlertIcon className="w-8 h-8 text-blue-500" />,
      route: "/triage-engine",
      requiresAuth: !isPatient && true,
      disabled:false,
      onRequireAuth:() => openLogin({ route : "/triage-engine" })
    },
  ];

  return (
    <div className="min-h-96 bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Header */}
      <Header  />

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
              isPatient={isPatient}
              onRequireAuth={module.onRequireAuth}
            />
          ))}
        </div>
      </section>

      {/* Status */}
      <SystemStatus />

    </div>
  );
}

export default PatientHomePage;