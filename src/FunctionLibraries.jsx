import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Header from "./components/Header";
import { MicrophoneIcon, AiIcon, CalendarIcon, SearchIcon, HospitalIcon, ImageIcon, AlertIcon, BooksIcon, DocumentIcon, PillIcon, BookOpenIcon, MicroscopeIcon } from "./components/icons";

function FunctionLibraries() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);

  const functions = [
    //{id: "transcribe",title: t('functions:cards.transcribe.title'),description: t('functions:cards.transcribe.description'),icon: MicrophoneIcon,route: "/functions/transcribe",color: "from-blue-400 via-blue-500 to-blue-600"},
    {
      id: "eboai",
      title: t('functions:cards.eboai.title'),
      description: t('functions:cards.eboai.description'),
      icon: AlertIcon,
      route: "/functions/eboai",
      color: "from-blue-500 via-blue-600 to-blue-700"
    },
    {
      id: "followups",
      title: t('functions:cards.followups.title'),
      description: t('functions:cards.followups.description'),
      icon: CalendarIcon,
      route: "/functions/followups",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: "patient-query",
      title: t('functions:cards.patientQuery.title'),
      description: t('functions:cards.patientQuery.description'),
      icon: SearchIcon,
      route: "/functions/patient-query",
      color: "from-blue-500 to-blue-700"
    },
    // { id: "appointments", title: "Appointment Calendar", description: "View and manage patient appointment requests. Accept, decline, and suggest alternative time slots.", icon: CalendarIcon, route: "/functions/appointments", color: "from-indigo-400 via-indigo-500 to-indigo-600" },
    // { id: "skin-cancer-detection", title: "Skin Cancer Detection", description: "AI-powered skin lesion analysis using CLIP ViT-B/16 to classify and detect potential skin cancer from dermoscopy images.", icon: MicroscopeIcon, route: "https://clipvitb16-skin-api-647783808407.northamerica-northeast1.run.app/app/", color: "from-blue-400 via-blue-500 to-blue-600" },
    // { id: "retinal-disease-detection", title: "Retinal Disease Detection", description: "AI-powered retinal image analysis using Swin Tiny transformer to detect and classify retinal diseases from fundus photographs.", icon: ImageIcon, route: "https://swintiny-api-647783808407.northamerica-northeast1.run.app/app/", color: "from-blue-500 via-blue-600 to-blue-700" },
    {
      id: "triage-engine",
      title: t('functions:cards.triageEngine.title'),
      description: t('functions:cards.triageEngine.description'),
      icon: AiIcon,
      route: "/functions/triage-engine",
      color: "from-blue-400 to-blue-600"
    },
    {
      id: "merck-manual",
      title: t('functions:cards.merckManual.title'),
      description: t('functions:cards.merckManual.description'),
      icon: BooksIcon,
      route: "/functions/merck-manual",
      color: "from-blue-500 to-blue-700"
    },
    {
      id: "pubmed",
      title: t('functions:cards.pubmed.title'),
      description: t('functions:cards.pubmed.description'),
      icon: DocumentIcon,
      route: "/functions/pubmed",
      color: "from-blue-400 via-blue-500 to-blue-600"
    },
    {
      id: "health-canada-drug-bank",
      title: t('functions:cards.drugBank.title'),
      description: t('functions:cards.drugBank.description'),
      icon: PillIcon,
      route: "/functions/drug-bank",
      color: "from-blue-400 to-blue-600"
    }
  ];

  const handleFunctionClick = (route) => {
    if (route.startsWith('http')) {
      window.open(route, '_blank', 'noopener,noreferrer');
    } else {
      navigate(route);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        title={t('functions:library.title')}
        subtitle={t('functions:library.subtitle')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-gradient-section">
        {/* Welcome Section */}
        <div className="text-center mb-12 bg-grid-pattern py-8 -mx-6 px-6">
          <h2 className="text-3xl font-semibold text-[#1e293b] mb-3">
            {t('functions:library.choose')}
          </h2>
          <p className="text-[#475569] max-w-2xl mx-auto">
            {t('functions:library.chooseSubtitle')}
          </p>
        </div>

        <div className="gradient-divider max-w-6xl mx-auto" />

        {/* Function Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {functions.map((func, index) => (
            <button
              key={func.id}
              onClick={() => !func.comingSoon && func.route && handleFunctionClick(func.route)}
              disabled={func.comingSoon}
              className={`group relative bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] transition-all duration-300 overflow-hidden border border-[rgba(15,23,42,0.1)] shimmer card-accent-top animate-fade-in-up ${
                func.comingSoon
                  ? "cursor-not-allowed opacity-75"
                  : "hover:shadow-[0_25px_50px_rgba(15,23,42,0.15)] hover:-translate-y-1 hover:border-[rgba(59,130,246,0.4)]"
              }`}
              style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
            >
              {/* Coming Soon Badge */}
              {func.comingSoon && (
                <div className="absolute top-3 right-3 z-10 bg-[#1e293b] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {t('common:labels.comingSoon')}
                </div>
              )}

              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] opacity-0 ${!func.comingSoon && "group-hover:opacity-[0.04]"} transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-16 h-16 bg-[rgba(59,130,246,0.08)] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.1)] transform ${!func.comingSoon && "group-hover:scale-110"} transition-transform duration-300 ${func.comingSoon && "grayscale-[30%]"} icon-glow`}>
                    <func.icon className="w-12 h-12 text-[#3b82f6]" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#1e293b] mb-2">
                  {func.title}
                </h3>

                {/* Description */}
                <p className="text-[#475569] text-sm leading-relaxed">
                  {func.description}
                </p>

                {/* Hover Arrow */}
                {!func.comingSoon && (
                  <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[#3b82f6] font-semibold text-sm flex items-center">
                      {t('common:buttons.accessFunction')}
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-[0_1px_3px_rgba(15,23,42,0.08)] border border-[rgba(15,23,42,0.1)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-[#475569] font-medium">{t('common:states.systemOnline')}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FunctionLibraries;