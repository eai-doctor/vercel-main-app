import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { NavBar, SystemStatus } from "@/components";
import { 
  AiIcon, 
  CalendarIcon, 
  SearchIcon, 
  ImageIcon, 
  AlertIcon, 
  BooksIcon, 
  DocumentIcon, 
  PillIcon, 
  MicroscopeIcon 
} from "@/components/ui/icons";

function FunctionSelector() {
  const navigate = useNavigate();
  const { t } = useTranslation(['functions', 'common']);

  const functions = [
    {
      id: "eboai",
      title: t('functions:cards.eboai.title'),
      description: t('functions:cards.eboai.description'),
      icon: <AlertIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/ask-ebo-ai",
      disabled : true
    },
    {
      id: "followups",
      title: t('functions:cards.followups.title'),
      description: t('functions:cards.followups.description'),
      icon: <CalendarIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/followups",
    },
    {
      id: "patient-query",
      title: t('functions:cards.patientQuery.title'),
      description: t('functions:cards.patientQuery.description'),
      icon: <SearchIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/patient-query",
    },
    {
      id: "skin-cancer-detection",
      title: "Skin Cancer Detection",
      description: "AI-powered skin lesion analysis using CLIP ViT-B/16 to classify and detect potential skin cancer from dermoscopy images.",
      icon: <MicroscopeIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/skin-cancer-detection",
    },
    {
      id: "retinal-disease-detection",
      title: "Retinal Disease Detection",
      description: "AI-powered retinal image analysis using Swin Tiny transformer to detect and classify retinal diseases from fundus photographs.",
      icon: <ImageIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/retinal-disease-detection",
    },
    {
      id: "triage-engine",
      title: t('functions:cards.triageEngine.title'),
      description: t('functions:cards.triageEngine.description'),
      icon: <AiIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/triage-engine",
    },
    {
      id: "merck-manual",
      title: t('functions:cards.merckManual.title'),
      description: t('functions:cards.merckManual.description'),
      icon: <BooksIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/merck-manual",

    },
    {
      id: "pubmed",
      title: t('functions:cards.pubmed.title'),
      description: t('functions:cards.pubmed.description'),
      icon: <DocumentIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/pubmed",
    },
    {
      id: "health-canada-drug-bank",
      title: t('functions:cards.drugBank.title'),
      description: t('functions:cards.drugBank.description'),
      icon: <PillIcon className="w-8 h-8 text-blue-500" />,
      route: "/functions/drug-bank",
    },
  ];

  const handleFunctionClick = (func) => {
    if (func.route.startsWith('http')) {
      window.open(func.route, '_blank', 'noopener,noreferrer');
    } else {
      navigate(func.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <NavBar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <h2 className="text-4xl font-semibold text-gray-800 mb-3">
          {t('functions:library.choose')}
        </h2>
        <p className="text-lg text-gray-500">
          {t('functions:library.chooseSubtitle')}
        </p>
      </section>

      {/* Feature Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {functions.map((func) => (
            <button
              key={func.id}
              onClick={() => !func.disabled && handleFunctionClick(func)}
              disabled={func.disabled}
              className={`group bg-white rounded-2xl border p-6 text-left flex flex-col gap-3 shadow-sm transition-all duration-200
                ${func.disabled
                  ? 'border-gray-100 opacity-50 cursor-not-allowed'
                  : 'border-gray-100 hover:border-blue-300 hover:-translate-y-0.5 cursor-pointer'
                }`}
            >
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${func.disabled ? 'bg-gray-50' : 'bg-blue-50'}`}>
                {func.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-medium text-gray-900">
                {func.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                {func.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  {func.isExternal && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                      {t('common:labels.externalLink', 'Link')}
                    </span>
                  )}
                  {func.disabled && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-400">
                      Coming Soon
                    </span>
                  )}
                </div>
                {!func.disabled && (
                  <span className="text-blue-500 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    →
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      <SystemStatus />
    </div>
  );
}
 
export default FunctionSelector;