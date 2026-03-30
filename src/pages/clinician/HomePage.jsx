import { useState } from "react";
import { useTranslation } from 'react-i18next';

import { MessageSquare, Dna, ClipboardList, LogIn } from "lucide-react";
import { FeatureCard, Header } from "@/components";
import { UserIcon, StethoscopeIcon, BooksIcon, SettingsIcon } from "@/components/ui/icons";

/* -------------------- Main Page -------------------- */
export default function HomePage() {
  const { t } = useTranslation(['clinic', 'common']);

  const baseModules = [
    {
      id: "patient-browse",
      title: t('clinic:home.modules.consultation.title'),
      description: t('clinic:home.modules.consultation.description'),
      icon: UserIcon,
      route: "/patients",
      color: "from-blue-400 via-blue-500 to-blue-600",
      disabled: false
    },
    {
      id: "consultation",
      title: t('clinic:home.modules.genetic.title'),
      description: t('clinic:home.modules.genetic.description'),
      icon: StethoscopeIcon,
      route: "/genetic",
      color: "from-blue-500 via-blue-600 to-blue-700",
      disabled: true
    },
    {
      id: "function-libraries",
      title: t('clinic:home.modules.functionLibrary.title'),
      description: t('clinic:home.modules.functionLibrary.description'),
      icon: BooksIcon,
      route: "/function-libraries",
      color: "from-blue-400 to-blue-600",
      disabled: true
    },
  ];


  const handleFeatureClick = (requiresAuth) => {

  };

  const handleOnSignInBtnClick = () => window.location.replace("/clinic-login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* ---------------- Header ---------------- */}
      <Header handleOnSignInBtnClick={handleOnSignInBtnClick} />
      
      {/* ---------------- Hero ---------------- */}
      <section className="max-w-5xl mx-auto px-4 py-14 text-center">
        <h2 className="text-4xl font-semibold text-gray-800 mb-3">
          {t('common:appName')}
        </h2>

        <p className="text-lg text-gray-500">
          {t('common:appSubtitle')}
        </p>
      </section>

      {/* ---------------- Feature Cards ---------------- */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          { baseModules.map(e => <FeatureCard
            disabled={e.disabled}
            icon={<MessageSquare className="w-8 h-8 text-blue-500" />}
            title={e.title}
            description={e.description}
            onClick={() => handleFeatureClick(true)}
          />) }

        </div>
      </section>

      {/* ---------------- Status ---------------- */}
      <div className="flex justify-center pb-16">
        <div className="flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600 text-sm">System Status: Online</span>
        </div>
      </div>
    </div>
  );
}