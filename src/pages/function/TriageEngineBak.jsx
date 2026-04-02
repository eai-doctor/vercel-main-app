import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "@/config";
import { Header, SystemStatus } from "@/components";
import { WarningIcon } from "@/components/ui/icons";

const STEPS = {
  DEMOGRAPHICS: 0,
  SYMPTOMS: 1,
  QUESTIONS: 2,
  PROCESSING: 3,
  RESULTS: 4,
};

const TRIAGE_COLORS = {
  1: { bg: "bg-red-600", text: "text-white", border: "border-red-600" },
  2: { bg: "bg-orange-500", text: "text-white", border: "border-orange-500" },
  3: { bg: "bg-yellow-500", text: "text-black", border: "border-yellow-500" },
  4: { bg: "bg-green-500", text: "text-white", border: "border-green-500" },
  5: { bg: "bg-blue-500", text: "text-white", border: "border-blue-500" },
};

function TriageEngine() {
  const { t } = useTranslation(['triage', 'common']);

  const [currentStep, setCurrentStep] = useState(STEPS.DEMOGRAPHICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Option arrays inside component so they can use t()
  const ONSET_OPTIONS = [
    { value: "just_now", label: t('triage:onset.justNow') },
    { value: "hours_ago", label: t('triage:onset.hoursAgo') },
    { value: "days_ago", label: t('triage:onset.daysAgo') },
    { value: "weeks_ago", label: t('triage:onset.weeksAgo') },
    { value: "months_ago", label: t('triage:onset.monthsAgo') },
  ];

  const PROGRESSION_OPTIONS = [
    { value: "better", label: t('triage:progression.gettingBetter') },
    { value: "same", label: t('triage:progression.stayingSame') },
    { value: "worse", label: t('triage:progression.gettingWorse') },
  ];

  const CHARACTER_OPTIONS = [
    { value: "sharp", label: t('triage:character.sharp') },
    { value: "dull", label: t('triage:character.dull') },
    { value: "burning", label: t('triage:character.burning') },
    { value: "throbbing", label: t('triage:character.throbbing') },
    { value: "pressure", label: t('triage:character.pressure') },
    { value: "cramping", label: t('triage:character.cramping') },
    { value: "other", label: t('triage:character.other') },
  ];

  const STEP_LABELS = [
    t('triage:steps.info'),
    t('triage:steps.symptoms'),
    t('triage:steps.details'),
    t('triage:steps.results'),
  ];

  // Form data
  const [demographics, setDemographics] = useState({ age: "", sex: "" });
  const [symptoms, setSymptoms] = useState({
    chief_complaint: "",
    additional_symptoms: [],
    onset: "",
    severity: 5,
    progression: "",
    location: "",
    character: "",
    modifying_factors: "",
    previous_occurrence: "",
  });
  const [medicalHistory, setMedicalHistory] = useState({
    conditions: [],
    medications: [],
  });

  // Autocomplete - separate state for each input
  const [symptomSuggestions, setSuggestionSymptoms] = useState([]);
  const [chiefComplaintInput, setChiefComplaintInput] = useState("");
  const [additionalSymptomInput, setAdditionalSymptomInput] = useState("");
  const [showChiefSuggestions, setShowChiefSuggestions] = useState(false);
  const [showAdditionalSuggestions, setShowAdditionalSuggestions] = useState(false);

  // Results
  const [triageResult, setTriageResult] = useState(null);

  const API_URL = config.backendUrl;

  // Debounced fetch symptom suggestions for chief complaint
  useEffect(() => {
    if (chiefComplaintInput.length >= 2) {
      const timer = setTimeout(() => {
        fetchSymptomSuggestions(chiefComplaintInput);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestionSymptoms([]);
    }
  }, [chiefComplaintInput]);

  // Debounced fetch symptom suggestions for additional symptoms
  useEffect(() => {
    if (additionalSymptomInput.length >= 2) {
      const timer = setTimeout(() => {
        fetchSymptomSuggestions(additionalSymptomInput);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestionSymptoms([]);
    }
  }, [additionalSymptomInput]);

  const fetchSymptomSuggestions = async (query) => {
    try {
      const response = await axios.get(`${API_URL}/api/triage/symptoms`, {
        params: { q: query },
      });
      if (response.data.success) {
        setSuggestionSymptoms(response.data.symptoms || []);
      }
    } catch (err) {
      console.error("Error fetching symptoms:", err);
    }
  };

  const handleSymptomSelect = (symptom, isChief = false) => {
    if (isChief) {
      setSymptoms({ ...symptoms, chief_complaint: symptom });
      setChiefComplaintInput("");
      setShowChiefSuggestions(false);
    } else {
      if (!symptoms.additional_symptoms.includes(symptom)) {
        setSymptoms({
          ...symptoms,
          additional_symptoms: [...symptoms.additional_symptoms, symptom],
        });
      }
      setAdditionalSymptomInput("");
      setShowAdditionalSuggestions(false);
    }
    setSuggestionSymptoms([]);
  };

  const removeAdditionalSymptom = (symptom) => {
    setSymptoms({
      ...symptoms,
      additional_symptoms: symptoms.additional_symptoms.filter((s) => s !== symptom),
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case STEPS.DEMOGRAPHICS:
        return demographics.age && demographics.sex;
      case STEPS.SYMPTOMS:
        return symptoms.chief_complaint;
      case STEPS.QUESTIONS:
        return symptoms.onset && symptoms.severity && symptoms.progression;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep === STEPS.QUESTIONS) {
      performTriage();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const performTriage = async () => {
    setCurrentStep(STEPS.PROCESSING);
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/triage`, {
        demographics,
        symptoms,
        medical_history: medicalHistory,
        include_evidence: true,
      });

      if (response.data.success) {
        setTriageResult(response.data);
        setCurrentStep(STEPS.RESULTS);
      } else {
        setError(response.data.error || "Triage failed");
        setCurrentStep(STEPS.QUESTIONS);
      }
    } catch (err) {
      console.error("Triage error:", err);
      setError(err.response?.data?.error || "Failed to perform triage");
      setCurrentStep(STEPS.QUESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const resetTriage = () => {
    setCurrentStep(STEPS.DEMOGRAPHICS);
    setDemographics({ age: "", sex: "" });
    setSymptoms({
      chief_complaint: "",
      additional_symptoms: [],
      onset: "",
      severity: 5,
      progression: "",
      location: "",
      character: "",
      modifying_factors: "",
      previous_occurrence: "",
    });
    setMedicalHistory({ conditions: [], medications: [] });
    setTriageResult(null);
    setError("");
    setChiefComplaintInput("");
    setAdditionalSymptomInput("");
    setSuggestionSymptoms([]);
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.DEMOGRAPHICS:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e293b] text-center">
              {t('triage:fields.age')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.age')}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={demographics.age}
                  onChange={(e) => setDemographics({ ...demographics, age: e.target.value })}
                  className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-[#3b82f6]"
                  placeholder={t('triage:fields.age')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.sex')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "male", label: t('triage:fields.male') },
                    { value: "female", label: t('triage:fields.female') },
                    { value: "other", label: t('triage:character.other') },
                  ].map((sex) => (
                    <button
                      key={sex.value}
                      type="button"
                      onClick={() => setDemographics({ ...demographics, sex: sex.value })}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        demographics.sex === sex.value
                          ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white"
                          : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                      }`}
                    >
                      {sex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case STEPS.SYMPTOMS:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e293b] text-center">
              {t('triage:fields.chiefComplaint')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.chiefComplaint')} *
                </label>
                <div className="relative">
                  {symptoms.chief_complaint ? (
                    <div className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 bg-[#f8fafc] flex items-center justify-between">
                      <span className="text-[#1e293b]">{symptoms.chief_complaint}</span>
                      <button
                        type="button"
                        onClick={() => setSymptoms({ ...symptoms, chief_complaint: "" })}
                        className="text-[#64748b] hover:text-[#475569]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={chiefComplaintInput}
                        onChange={(e) => setChiefComplaintInput(e.target.value)}
                        onFocus={() => setShowChiefSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowChiefSuggestions(false), 200)}
                        className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
                        placeholder={t('triage:fields.chiefComplaintPlaceholder')}
                      />
                      {showChiefSuggestions && symptomSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-[rgba(15,23,42,0.1)] rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)] max-h-48 overflow-y-auto">
                          {symptomSuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSymptomSelect(s.term, true)}
                              className="w-full text-left px-4 py-2 hover:bg-[rgba(59,130,246,0.08)] flex justify-between items-center"
                            >
                              <span>{s.term}</span>
                              <span className="text-xs text-[#64748b]">{s.category}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.associatedSymptoms')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={additionalSymptomInput}
                    onChange={(e) => setAdditionalSymptomInput(e.target.value)}
                    onFocus={() => setShowAdditionalSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAdditionalSuggestions(false), 200)}
                    disabled={!symptoms.chief_complaint}
                    className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6] disabled:bg-[#f8fafc]"
                    placeholder={t('triage:fields.associatedSymptomsPlaceholder')}
                  />
                  {showAdditionalSuggestions && symptomSuggestions.length > 0 && symptoms.chief_complaint && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-[rgba(15,23,42,0.1)] rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.1)] max-h-48 overflow-y-auto">
                      {symptomSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSymptomSelect(s.term, false)}
                          className="w-full text-left px-4 py-2 hover:bg-[rgba(59,130,246,0.08)] flex justify-between items-center"
                        >
                          <span>{s.term}</span>
                          <span className="text-xs text-[#64748b]">{s.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {symptoms.additional_symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {symptoms.additional_symptoms.map((sym, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] rounded-full text-sm"
                      >
                        {sym}
                        <button
                          type="button"
                          onClick={() => removeAdditionalSymptom(sym)}
                          className="ml-2 text-[#3b82f6] hover:text-[#2563eb]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case STEPS.QUESTIONS:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1e293b] text-center">
              {t('triage:steps.details')}
            </h2>
            <div className="space-y-5">
              {/* Onset */}
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.onset')} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ONSET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSymptoms({ ...symptoms, onset: opt.value })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        symptoms.onset === opt.value
                          ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white"
                          : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:severity.label')} * ({symptoms.severity}/10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={symptoms.severity}
                  onChange={(e) => setSymptoms({ ...symptoms, severity: parseInt(e.target.value) })}
                  className="w-full h-3 bg-[#f8fafc] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
                />
                <div className="flex justify-between text-xs text-[#64748b] mt-1">
                  <span>{t('triage:severity.mild')}</span>
                  <span>{t('triage:severity.moderate')}</span>
                  <span>{t('triage:severity.severe')}</span>
                </div>
              </div>

              {/* Progression */}
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.progression')} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PROGRESSION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSymptoms({ ...symptoms, progression: opt.value })}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        symptoms.progression === opt.value
                          ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white"
                          : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.additionalNotes')}
                </label>
                <input
                  type="text"
                  value={symptoms.location}
                  onChange={(e) => setSymptoms({ ...symptoms, location: e.target.value })}
                  className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:border-[#3b82f6]"
                  placeholder={t('triage:fields.additionalNotesPlaceholder')}
                />
              </div>

              {/* Character */}
              <div>
                <label className="block text-sm font-medium text-[#475569] mb-2">
                  {t('triage:fields.painCharacter')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CHARACTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSymptoms({ ...symptoms, character: opt.value })}
                      className={`py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                        symptoms.character === opt.value
                          ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white"
                          : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case STEPS.PROCESSING:
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3b82f6] mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-2">{t('triage:steps.details')}...</h2>
            <p className="text-[#475569]">{t('triage:subtitle')}</p>
          </div>
        );

      case STEPS.RESULTS:
        if (!triageResult) return null;
        const { triage, red_flags, differential_diagnoses, next_steps, evidence } = triageResult;
        const colors = TRIAGE_COLORS[triage.level] || TRIAGE_COLORS[5];

        return (
          <div className="space-y-6">
            {/* Triage Level Card */}
            <div className={`${colors.bg} ${colors.text} rounded-xl p-6 text-center`}>
              <div className="text-lg opacity-90 mb-1">{t('triage:results.triageLevel')} {triage.level}</div>
              <div className="text-3xl font-bold mb-2">{triage.level_name}</div>
              <div className="text-xl">{triage.recommended_action}</div>
              <div className="mt-3 text-lg opacity-90">
                {t('triage:results.recommendations')}: {triage.recommended_venue}
              </div>
            </div>

            {/* Red Flags Alert */}
            {red_flags && red_flags.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-center mb-2">
                  <WarningIcon className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" />
                  <h3 className="font-bold text-red-700">{t('triage:results.redFlags')}</h3>
                </div>
                <ul className="space-y-1">
                  {red_flags.map((flag, idx) => (
                    <li key={idx} className="text-red-700 text-sm">
                      • {flag.concern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {next_steps && next_steps.length > 0 && (
              <div className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] p-5">
                <h3 className="font-bold text-[#1e293b] mb-3">{t('triage:results.recommendations')}</h3>
                <ol className="space-y-2">
                  {next_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-[#475569]">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Differential Diagnoses */}
            {differential_diagnoses && differential_diagnoses.length > 0 && (
              <div className="bg-white rounded-xl border border-[rgba(15,23,42,0.1)] p-5">
                <h3 className="font-bold text-[#1e293b] mb-3">{t('triage:results.differentialDiagnosis')}</h3>
                <div className="space-y-2">
                  {differential_diagnoses.map((dx, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 border-b border-[rgba(15,23,42,0.05)] last:border-0"
                    >
                      <span className="text-[#1e293b]">{dx.diagnosis}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          dx.probability === "high"
                            ? "bg-red-100 text-red-700"
                            : dx.probability === "moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-[#f8fafc] text-[#475569]"
                        }`}
                      >
                        {dx.probability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PubMed Evidence */}
            {evidence && evidence.papers && evidence.papers.length > 0 && (
              <div className="bg-[rgba(59,130,246,0.08)] rounded-xl border border-[rgba(59,130,246,0.2)] p-5">
                <h3 className="font-bold text-[#1e293b] mb-3">{t('triage:results.assessment')}</h3>
                <div className="space-y-3">
                  {evidence.papers.map((paper, idx) => (
                    <a
                      key={idx}
                      href={paper.pubmed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white rounded-lg border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] transition-colors"
                    >
                      <div className="text-sm font-medium text-[#3b82f6] line-clamp-2">
                        {paper.title}
                      </div>
                      <div className="text-xs text-[#64748b] mt-1">
                        {paper.journal} ({paper.year})
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-[#f8fafc] rounded-lg p-4 text-sm text-[#475569]">
              <strong>{t('triage:results.disclaimer')}:</strong> {triageResult.disclaimer}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetTriage}
                className="flex-1 py-3 px-4 bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] rounded-lg font-medium hover:border-[rgba(59,130,246,0.4)] transition-colors"
              >
                {t('common:startOver', 'Start Over')}
              </button>
              {triage.level <= 2 && (
                <a
                  href="tel:911"
                  className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium text-center hover:bg-red-700 transition-colors"
                >
                  {t('common:call911', 'Call 911')}
                </a>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('triage:title')}
        subtitle={t('triage:subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        {currentStep !== STEPS.RESULTS && currentStep !== STEPS.PROCESSING && (
          <div className="flex items-center justify-center mb-8">
            {STEP_LABELS.map((label, index) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index < currentStep
                        ? "bg-green-500 text-white"
                        : index === currentStep
                        ? "bg-[#3b82f6] text-white"
                        : "bg-[#f8fafc] text-[#64748b] border border-[rgba(15,23,42,0.1)]"
                    }`}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <span className="text-xs mt-1 text-[#475569]">{label}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      index < currentStep ? "bg-green-500" : "bg-[rgba(15,23,42,0.1)]"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6 md:p-8 card-hover">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep !== STEPS.PROCESSING && currentStep !== STEPS.RESULTS && (
            <div className="flex gap-4 mt-8">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] rounded-lg font-medium hover:border-[rgba(59,130,246,0.4)] transition-colors"
                >
                  {t('common:back', 'Back')}
                </button>
              )}
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  canProceed()
                    ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white hover:opacity-90 btn-glow"
                    : "bg-[#f8fafc] text-[#64748b] cursor-not-allowed border border-[rgba(15,23,42,0.1)]"
                }`}
              >
                {currentStep === STEPS.QUESTIONS ? t('triage:steps.results') : t('common:continue', 'Continue')}
              </button>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {currentStep !== STEPS.RESULTS && (
          <div className="mt-6 text-center text-sm text-[#64748b]">
            <p>
              {t('triage:results.disclaimer', 'If you are experiencing a life-threatening emergency,')}{" "}
              <a href="tel:911" className="text-red-600 font-medium">
                {t('common:call911', 'call 911 immediately')}
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default TriageEngine;
