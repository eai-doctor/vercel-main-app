import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import triageEngineApi from "@/api/triageApi";
import { useLanguage } from "@/hooks";

function Symptoms({ data, setData }) {
  const { symptoms } = data;
  const { t } = useTranslation(["triage", "common", "functions"]);
  const { currentLanguage } = useLanguage();

  const [chiefInput, setChiefInput] = useState("");
  const [additionalInput, setAdditionalInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [defaultSuggestions, setDefaultSuggestions] = useState([]);

  const [showChief, setShowChief] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chiefInputRef = useRef(null);
  const additionalInputRef = useRef(null);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await triageEngineApi.triageGetSymptoms("", currentLanguage.code);
        if (res.data?.success) {
          setDefaultSuggestions(res.data.symptoms.slice(0, 10) || []);
        }
      } catch (err) {
        console.error("default symptom fetch error", err);
      }
    };
    fetchDefaults();
  }, [currentLanguage.code]);

  useEffect(() => {
    const query = showChief ? chiefInput : additionalInput;

    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await triageEngineApi.triageGetSymptoms(query, currentLanguage.code);
        if (res.data?.success) {
          setSuggestions(res.data.symptoms || []);
        }
      } catch (err) {
        console.error("symptom fetch error", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [chiefInput, additionalInput, showChief]);

  const getDisplaySuggestions = (query) => {
    if (query && query.length >= 2) return suggestions;
    return defaultSuggestions;
  };

  const handleSelect = (term, isChief) => {
    if (isChief) {
      setData(prev => ({
        ...prev,
        symptoms: { ...prev.symptoms, chief_complaint: term }
      }));
      setChiefInput("");
      setShowChief(false);
    } else {
      if (!symptoms.additional_symptoms?.includes(term)) {
        setData(prev => ({
          ...prev,
          symptoms: {
            ...prev.symptoms,
            additional_symptoms: [...(prev.symptoms.additional_symptoms || []), term]
          }
        }));
      }
      setAdditionalInput("");
      setShowAdditional(false);
      additionalInputRef.current?.focus();
    }
    setSuggestions([]);
  };

  const confirmChiefInput = () => {
    const val = chiefInput.trim();
    if (val) {
      setData(prev => ({
        ...prev,
        symptoms: { ...prev.symptoms, chief_complaint: val }
      }));
      setChiefInput("");
      setShowChief(false);
      setSuggestions([]);
    }
  };

  const confirmAdditionalInput = () => {
    const val = additionalInput.trim();
    if (val && !symptoms.additional_symptoms?.includes(val)) {
      setData(prev => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          additional_symptoms: [...(prev.symptoms.additional_symptoms || []), val]
        }
      }));
      setAdditionalInput("");
      setSuggestions([]);
      setTimeout(() => additionalInputRef.current?.focus(), 50);
    }
  };

  const handleChiefKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmChiefInput();
    } else if (e.key === "Escape") {
      setShowChief(false);
    }
  };

  const handleAdditionalKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmAdditionalInput();
    } else if (e.key === "Escape") {
      setShowAdditional(false);
    }
  };

  const removeAdditional = (sym) => {
    setData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        additional_symptoms: prev.symptoms.additional_symptoms.filter(s => s !== sym)
      }
    }));
  };

  const displayChiefSuggestions = getDisplaySuggestions(chiefInput);
  const displayAdditionalSuggestions = getDisplaySuggestions(additionalInput);

  return (
    <div className="space-y-6">

      {/* Chief Complaint */}
      <div>
        <label className="block text-sm font-medium text-[#475569] mb-2">
          {t("triage:fields.chiefComplaint")} *
        </label>

        <div className="relative">
          {symptoms.chief_complaint ? (
            <div className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 bg-[#f8fafc] flex items-center justify-between">
              <span>{symptoms.chief_complaint}</span>
              <button
                onClick={() =>
                  setData(prev => ({
                    ...prev,
                    symptoms: { ...prev.symptoms, chief_complaint: "" }
                  }))
                }
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <input
                ref={chiefInputRef}
                value={chiefInput}
                onChange={(e) => setChiefInput(e.target.value)}
                onFocus={() => setShowChief(true)}
                onBlur={() => setTimeout(() => {
                  setShowChief(false);
                  // blur 시 자유입력 확정
                  confirmChiefInput();
                }, 200)}
                onKeyDown={handleChiefKeyDown}
                className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
                placeholder={t("triage:fields.chiefComplaintPlaceholder")}
              />

              {/* 힌트 텍스트 */}
              {chiefInput.length > 0 && chiefInput.length < 2 && (
                <p className="text-xs text-gray-400 mt-1">
                  {t("triage:labels.inputHints")}
                </p>
              )}

              {showChief && (displayChiefSuggestions.length > 0 || isLoading) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-[rgba(15,23,42,0.1)] rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {!chiefInput || chiefInput.length < 2 ? (
                    <div className="px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50">
                      {t("triage:labels.commonSymptoms")}
                    </div>
                  ) : (
                    <div className="px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50">
                      {t("triage:labels.suggestedSymptoms")}
                    </div>
                  )}

                  {isLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-400">{t("common:states.searching")}</div>
                  ) : displayChiefSuggestions.length > 0 ? (
                    displayChiefSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(s.term, true)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex justify-between items-center transition-colors"
                      >
                        <span className="text-sm">{s.term}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{s.category}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      {t("triage:noSuggestedSymptoms", { input: chiefInput })}
                    </div>
                  )}

                  {chiefInput.trim() && (
                    <div className="border-t border-gray-100">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(chiefInput.trim(), true)}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2 transition-colors text-sm text-blue-600"
                      >
                        <span>✎</span>
                        <span>"{chiefInput.trim()}" 직접 입력</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Additional Symptoms */}
      <div>
        <label className="block text-sm font-medium text-[#475569] mb-2">
          {t("triage:fields.associatedSymptoms")}
        </label>

        <div className="relative">
          <input
            ref={additionalInputRef}
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
            onFocus={() => setShowAdditional(true)}
            onBlur={() => setTimeout(() => setShowAdditional(false), 200)}
            onKeyDown={handleAdditionalKeyDown}
            disabled={!symptoms.chief_complaint}
            className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 disabled:bg-[#f8fafc] focus:outline-none focus:border-[#3b82f6]"
            placeholder={t("triage:fields.associatedSymptomsPlaceholder")}
          />

          {showAdditional && (displayAdditionalSuggestions.length > 0 || isLoading) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-[rgba(15,23,42,0.1)] rounded-lg shadow-lg max-h-52 overflow-y-auto">
              {!additionalInput || additionalInput.length < 2 ? (
                <div className="px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50">
                  {t("triage:labels.commonSymptoms")}
                </div>
              ) : (
                <div className="px-4 py-2 text-xs font-medium text-gray-400 border-b border-gray-100 bg-gray-50">
                  {t("triage:labels.suggestedSymptoms")}
                </div>
              )}

              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-400">{t("common:states.searching")}</div>
              ) : displayAdditionalSuggestions.length > 0 ? (
                displayAdditionalSuggestions
                  .filter(s => !symptoms.additional_symptoms?.includes(s.term))
                  .map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(s.term, false)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex justify-between items-center transition-colors"
                    >
                      <span className="text-sm">{s.term}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{s.category}</span>
                    </button>
                  ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  <span className="font-medium text-blue-500">"{additionalInput}"</span> 관련 추천 증상이 없습니다
                  <br />
                  <span className="text-xs text-gray-400">Enter를 눌러 직접 입력하세요</span>
                </div>
              )}

              {/* 자유입력 옵션 */}
              {additionalInput.trim() && (
                <div className="border-t border-gray-100">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(additionalInput.trim(), false)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2 transition-colors text-sm text-blue-600"
                  >
                    <span>✎</span>
                    <span>"{additionalInput.trim()}" 직접 입력</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chips */}
        {symptoms.additional_symptoms?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {symptoms.additional_symptoms.map((sym, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
              >
                {sym}
                <button
                  onClick={() => removeAdditional(sym)}
                  className="ml-2 hover:text-blue-800 transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Symptoms;