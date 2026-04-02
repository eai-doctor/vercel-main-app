import React, { useState } from "react";
import Fields from "./components/Fields";
import triageEngineApi from "@/api/TriageApi";
import { NavBar } from "@/components";
import { useTranslation } from 'react-i18next';

export const STEPS = {
  DEMOGRAPHICS: 0,
  SYMPTOMS: 1,
  QUESTIONS: 2,
  PROCESSING: 3,
  RESULTS: 4,
};

function TriageEngine() {
  const [currentStep, setCurrentStep] = useState(STEPS.DEMOGRAPHICS);
  const { t } = useTranslation(['triage', 'common']);
  const [data, setData] = useState({
    demographics: {},
    symptoms: { severity : 5 },
    medicalHistory: {}
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ validation (간단 버전)
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
      setLoading(true);
      try {
        const res = await triageEngineApi.triageAssess(data); 
        setResult(res.data);
        setCurrentStep(STEPS.RESULTS);
      } catch (err) {
        console.error("Triage failed:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavBar />

      <header className="max-w-4xl mx-auto pt-16 text-center px-6">
        <h1 className="text-[40px] font-bold text-[#1e293b] leading-tight mb-4">
          {t('triage:title')}
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 space-y-6">

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6">
          <Fields
            step={currentStep}
            data={data}
            setData={setData}
            result={result}
            loading={loading}
          />
        </div>

        {/* Navigation */}
        {currentStep !== STEPS.RESULTS && currentStep !== STEPS.PROCESSING && (
          <div className="flex gap-4">

            {/* Back */}
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 px-4 rounded-lg border border-[rgba(15,23,42,0.1)] bg-[#f8fafc] text-[#475569] font-medium hover:border-[rgba(59,130,246,0.4)] transition-all"
              >
                ← Back
              </button>
            )}

            {/* Next */}
            <button
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${
                  canProceed() && !loading
                    ? "bg-[#2C3B8D] text-white hover:bg-[#1f2a63] shadow-sm"
                    : "bg-[#f8fafc] text-[#94a3b8] border border-[rgba(15,23,42,0.1)] cursor-not-allowed"
                }
              `}
            >
              {loading ? "Processing..." : "Next →"}
            </button>
          </div>
        )}

      </main>

      {/* Footer Info */}
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