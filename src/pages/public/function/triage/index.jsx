import React, { useEffect, useState } from "react";
import Fields from "./components/Fields";
import triageEngineApi from "@/api/triageApi";
import { NavBar } from "@/components";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";

export const STEPS = {
  DEMOGRAPHICS: 0,
  SYMPTOMS: 1,
  QUESTIONS: 2,
  PROCESSING: 3,
  RESULTS: 4,
};

const PROCESSING_MESSAGES = {
  en: ["Reviewing the first look", "Checking symptoms and warning signs", "Applying CTAS rules", "Finishing triage"],
  fr: ["Reviewing the first look", "Checking symptoms and warning signs", "Applying CTAS rules", "Finishing triage"],
  zh: ["Reviewing the first look", "Checking symptoms and warning signs", "Applying CTAS rules", "Finishing triage"],
};

function ProcessingScreen({ language = "en" }) {
  const messages = PROCESSING_MESSAGES[language] ?? PROCESSING_MESSAGES.en;
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 select-none">
      <div className="w-16 h-16 rounded-full bg-[#2C3B8D] text-white flex items-center justify-center mb-8 shadow-lg">
        <span className="text-2xl font-bold">CT</span>
      </div>
      <p className="text-[#1e293b] text-lg font-medium text-center mb-3">{messages[msgIndex]}</p>
      <p className="text-[#94a3b8] text-sm text-center">This usually takes a few seconds.</p>
      <div className="mt-8 w-56 h-1 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div className="h-full bg-[#2C3B8D] rounded-full animate-pulse" />
      </div>
    </div>
  );
}

function TriageEngine() {
  const [currentStep, setCurrentStep] = useState(STEPS.DEMOGRAPHICS);
  const { t } = useTranslation(["triage", "common"]);
  const { currentLanguage } = useLanguage();

  const [data, setData] = useState({
    demographics: {},
    schema: null,
    triage: {
      chief_complaint: "",
      chief_complaint_text: "",
      symptoms: [],
      pain_score: 0,
      critical_look: false,
      airway_breathing_circulation_issue: false,
      subjective: "",
      objective: "",
      first_order_modifiers: [],
      second_order_modifiers: [],
      vitals: {},
    },
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadSchema = async () => {
      try {
        const res = await triageEngineApi.triageGetSchema();
        if (mounted && res.data?.success) {
          setData((prev) => ({ ...prev, schema: res.data }));
        }
      } catch (err) {
        console.error("Failed to load CTAS schema:", err);
      }
    };
    loadSchema();
    return () => {
      mounted = false;
    };
  }, []);

  const canProceed = () => {
    if (currentStep === STEPS.DEMOGRAPHICS) return Boolean(data.demographics?.age && data.demographics?.sex);
    if (currentStep === STEPS.SYMPTOMS) return Boolean(data.triage?.chief_complaint);
    return true;
  };

  const nextStep = async () => {
    if (currentStep === STEPS.QUESTIONS) {
      setCurrentStep(STEPS.PROCESSING);
      setLoading(true);
      try {
        const payload = {
          demographics: data.demographics,
          ...data.triage,
          age: data.demographics?.age,
          sex: data.demographics?.sex,
          language: currentLanguage.code,
          symptoms: [data.triage.chief_complaint, ...(data.triage.symptoms || [])].filter(Boolean),
        };
        const res = await triageEngineApi.triageAssess(payload, currentLanguage.code);
        setResult(res.data);
        setCurrentStep(STEPS.RESULTS);
      } catch (err) {
        console.error("Triage failed:", err);
        setCurrentStep(STEPS.QUESTIONS);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && currentStep !== STEPS.PROCESSING) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const restart = () => {
    setCurrentStep(STEPS.DEMOGRAPHICS);
    setResult(null);
    setData({
      demographics: {},
      schema: data.schema,
      triage: {
        chief_complaint: "",
        chief_complaint_text: "",
        symptoms: [],
        pain_score: 0,
        critical_look: false,
        airway_breathing_circulation_issue: false,
        subjective: "",
        objective: "",
        first_order_modifiers: [],
        second_order_modifiers: [],
        vitals: {},
      },
    });
  };

  const isProcessing = currentStep === STEPS.PROCESSING;

  return (
    <div className="min-h-96 bg-[#f8fafc]">
      <NavBar />

      <header className="max-w-4xl mx-auto pt-16 text-center px-6">
        <h1 className="text-[40px] font-bold text-[#1e293b] leading-tight mb-4">{t("triage:title", "CTAS Triage")}</h1>
        <p className="text-[#64748b] max-w-2xl mx-auto">
          {t("triage:subtitle", "Use plain language to describe what is happening. We will sort by urgency, not diagnosis.")}
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-6">
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6">
          {isProcessing ? (
            <ProcessingScreen language={currentLanguage.code} />
          ) : (
            <Fields step={currentStep} data={data} setData={setData} result={result} loading={loading} restart={restart} />
          )}
        </div>

        {!isProcessing && currentStep !== STEPS.RESULTS && (
          <div className="flex gap-4">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 px-4 rounded-lg border border-[rgba(15,23,42,0.1)] bg-[#f8fafc] text-[#475569] font-medium hover:border-[rgba(59,130,246,0.4)] transition-all"
              >
                {t("common:buttons.back", "Back")}
              </button>
            )}

            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                canProceed()
                  ? "bg-[#2C3B8D] text-white hover:bg-[#1f2a63] shadow-sm"
                  : "bg-[#f8fafc] text-[#94a3b8] border border-[rgba(15,23,42,0.1)] cursor-not-allowed"
              }`}
            >
              {currentStep === STEPS.QUESTIONS ? t("triage:results.submit", "Assess CTAS") : t("common:buttons.next", "Next")}
            </button>
          </div>
        )}
      </main>

      <div className="mt-6 text-center text-sm pb-10 text-[#64748b]">
        <p>
          {t("triage:results.lifeThreatening", "If this feels life-threatening,")}{" "}
          <a href="tel:911" className="text-red-600 font-medium">
            {t("common:call911", "call 911 immediately")}
          </a>
        </p>
      </div>
    </div>
  );
}

export default TriageEngine;
