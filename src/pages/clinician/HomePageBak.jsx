import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/context/AuthContext';
import { ProfileDropdown, LanguageSwitcher } from '@/components';
import { UserIcon, StethoscopeIcon, BooksIcon, SettingsIcon } from "@/components/ui/icons";

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation(['clinic', 'common']);

  const baseModules = [
    {
      id: "patient-browse",
      title: t('clinic:home.modules.consultation.title'),
      description: t('clinic:home.modules.consultation.description'),
      icon: UserIcon,
      route: "/patients",
      color: "from-blue-400 via-blue-500 to-blue-600"
    },
    {
      id: "consultation",
      title: t('clinic:home.modules.genetic.title'),
      description: t('clinic:home.modules.genetic.description'),
      icon: StethoscopeIcon,
      route: "/genetic",
      color: "from-blue-500 via-blue-600 to-blue-700"
    },
    {
      id: "function-libraries",
      title: t('clinic:home.modules.functionLibrary.title'),
      description: t('clinic:home.modules.functionLibrary.description'),
      icon: BooksIcon,
      route: "/function-libraries",
      color: "from-blue-400 to-blue-600"
    },
  ];

  const modules = user?.role === 'admin'
    ? [...baseModules, {
        id: "settings",
        title: t('clinic:home.modules.settings.title'),
        description: t('clinic:home.modules.settings.description'),
        icon: SettingsIcon,
        route: "/settings",
        color: "from-blue-500 to-blue-700"
      }]
    : baseModules;

  const handleModuleClick = (route) => {
    navigate(route);
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
              {/* 031226 saebyeok block
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#3b82f6] transition-colors"
              >
                ← {t('common:header.backToHome')}
              </button> */}
              <LanguageSwitcher />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-gradient-section">
        {/* Welcome Section */}
        <div className="text-center mb-12 bg-grid-pattern py-8 -mx-6 px-6">
          <h2 className="text-3xl font-semibold text-[#1e293b] mb-3">
            {t('clinic:home.welcome.title')}
          </h2>
          <p className="text-[#475569] max-w-2xl mx-auto">
            {t('clinic:home.welcome.subtitle')}
          </p>
        </div>

        <div className="gradient-divider max-w-5xl mx-auto" />

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module.route)}
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
    </div>
  );
}

export default HomePage;
