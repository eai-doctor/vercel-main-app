import React, { useState, useEffect } from "react";
import Fields from "./components/Fields";
import triageEngineApi from "@/api/triageApi";
import { NavBar } from "@/components";
import { useTranslation } from 'react-i18next';
import useLanguage from '@/hooks/useLanguage';

export const STEPS = {
  DEMOGRAPHICS: 0,
  SYMPTOMS: 1,
  QUESTIONS: 2,
  PROCESSING: 3,
  RESULTS: 4,
};

// Processing messages per language — cycles during AI analysis
const PROCESSING_MESSAGES = {
  en: [
    "Analyzing your symptoms…",
    "Reviewing clinical patterns…",
    "Checking for critical indicators…",
    "Generating care guidance…",
    "Almost done…",
  ],
  fr: [
    "Analyse de vos symptômes…",
    "Examen des schémas cliniques…",
    "Vérification des indicateurs critiques…",
    "Génération des conseils de soins…",
    "Presque terminé…",
  ],
  zh: [
    "正在分析您的症状…",
    "正在审查临床模式…",
    "正在检查关键指标…",
    "正在生成护理建议…",
    "即将完成…",
  ],
};

function ProcessingScreen({ language = 'en' }) {
  const messages = PROCESSING_MESSAGES[language] ?? PROCESSING_MESSAGES.en;
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out → swap → fade in
      setVisible(false);
      setTimeout(() => {
        setMsgIndex(prev => (prev + 1) % messages.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 select-none">

      {/* Animated pulse ring + icon */}
      <div className="relative mb-10">
        {/* Outer pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#2C3B8D] opacity-10 animate-ping" />
        <span
          className="absolute inset-0 rounded-full bg-[#2C3B8D] opacity-10 animate-ping"
          style={{ animationDelay: "0.4s" }}
        />
        {/* Core circle */}
        <div className="relative w-20 h-20 rounded-full bg-[#2C3B8D] flex items-center justify-center shadow-lg">
          {/* ECG / heartbeat icon */}
          <svg viewBox="0 0 40 24" className="w-10 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="0,12 7,12 10,4 14,20 18,8 22,16 26,12 40,12" />
          </svg>
        </div>
      </div>

      {/* Cycling message */}
      <p
        className="text-[#1e293b] text-lg font-medium text-center mb-2 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {messages[msgIndex]}
      </p>

      {/* Subtle sub-label */}
      <p className="text-[#94a3b8] text-sm text-center">
        {language === 'fr'
          ? "Veuillez patienter, cela prend environ 10–20 secondes."
          : language === 'zh'
          ? "请稍候，分析约需 10–20 秒。"
          : "Please wait — this usually takes 10–20 seconds."}
      </p>

      {/* Thin animated progress bar */}
      <div className="mt-10 w-56 h-1 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#2C3B8D] rounded-full"
          style={{
            animation: "indeterminate 2s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes indeterminate {
          0%   { transform: translateX(-100%) scaleX(0.4); }
          50%  { transform: translateX(60%)  scaleX(0.6); }
          100% { transform: translateX(200%) scaleX(0.4); }
        }
      `}</style>
    </div>
  );
}

function TriageEngine() {
  const [currentStep, setCurrentStep] = useState(STEPS.DEMOGRAPHICS);
  const { t } = useTranslation(['triage', 'common']);
  const { currentLanguage } = useLanguage();

  const [data, setData] = useState({
    demographics: {},
    symptoms: { severity: 5 },
    medicalHistory: {},
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case STEPS.DEMOGRAPHICS:
        return data.demographics?.age && data.demographics?.sex;
      case STEPS.SYMPTOMS:
        return data.symptoms?.chief_complaint;
      case STEPS.QUESTIONS:
        return data.symptoms?.severity && data.symptoms?.progression;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (currentStep === STEPS.QUESTIONS) {
      // ✅ Immediately switch to PROCESSING screen — no more ambiguous button state
      setCurrentStep(STEPS.PROCESSING);
      setLoading(true);
      try {
        const res = await triageEngineApi.triageAssess(data, currentLanguage.code);
        setResult(res.data);
        setCurrentStep(STEPS.RESULTS);
      } catch (err) {
        console.error("Triage failed:", err);
        // On error: step back so user can retry
        setCurrentStep(STEPS.QUESTIONS);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && currentStep !== STEPS.PROCESSING) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const restart = () => {
    setCurrentStep(STEPS.DEMOGRAPHICS);
    setResult(null);
    setData({
      demographics: {},
      symptoms: { severity: 5 },
      medicalHistory: {},
    });
  };

  const isProcessing = currentStep === STEPS.PROCESSING;

  return (
    <div className="min-h-96 bg-[#f8fafc]">
      <NavBar />

      <header className="max-w-4xl mx-auto pt-16 text-center px-6">
        <h1 className="text-[40px] font-bold text-[#1e293b] leading-tight mb-4">
          {t('triage:title')}
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-6">

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6">
          {isProcessing ? (
            <ProcessingScreen language={currentLanguage.code} />
          ) : (
            <Fields
              step={currentStep}
              data={data}
              setData={setData}
              result={result}
              loading={loading}
              restart={restart}
            />
          )}
        </div>

        {/* Navigation — hidden during processing and on results */}
        {!isProcessing && currentStep !== STEPS.RESULTS && (
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 px-4 rounded-lg border border-[rgba(15,23,42,0.1)] bg-[#f8fafc] text-[#475569] font-medium hover:border-[rgba(59,130,246,0.4)] transition-all"
              >
                ← {t('common:buttons.back')}
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${canProceed()
                  ? "bg-[#2C3B8D] text-white hover:bg-[#1f2a63] shadow-sm"
                  : "bg-[#f8fafc] text-[#94a3b8] border border-[rgba(15,23,42,0.1)] cursor-not-allowed"
                }
              `}
            >
              {t('common:buttons.next')} →
            </button>
          </div>
        )}

      </main>

      <div className="mt-6 text-center text-sm pb-10 text-[#64748b]">
        <p>
          {t('triage:results.disclaimer', 'If you are experiencing a life-threatening emergency,')}{" "}
          <a href="tel:911" className="text-red-600 font-medium">
            {t('common:call911', 'call 911 immediately')}
          </a>
        </p>
      </div>
    </div>
  );
}

export default TriageEngine;