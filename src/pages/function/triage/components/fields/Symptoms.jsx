import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import triageEngineApi from "@/api/triageApi";

function Symptoms({ data, setData }) {
  const { symptoms } = data;
  const { t } = useTranslation(["triage", "common"]);

  const [chiefInput, setChiefInput] = useState("");
  const [additionalInput, setAdditionalInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const [showChief, setShowChief] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  // 🔥 autocomplete
  useEffect(() => {
    const query = showChief ? chiefInput : additionalInput;
    if (!query || query.length < 2) return;

    const timer = setTimeout(async () => {
      try {
        const res = await triageEngineApi.triageGetSymptoms(query);
        if (res.data?.success) {
          setSuggestions(res.data.symptoms || []);
        }
      } catch (err) {
        console.error("symptom fetch error", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [chiefInput, additionalInput, showChief]);

  

  // 🔥 select handler
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
    }
    setSuggestions([]);
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
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <input
                value={chiefInput}
                onChange={(e) => setChiefInput(e.target.value)}
                onFocus={() => setShowChief(true)}
                onBlur={() => setTimeout(() => setShowChief(false), 200)}
                className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
                placeholder={t("triage:fields.chiefComplaintPlaceholder")}
              />

              {showChief && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(s.term, true)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 flex justify-between"
                    >
                      <span>{s.term}</span>
                      <span className="text-xs text-gray-400">{s.category}</span>
                    </button>
                  ))}
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
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
            onFocus={() => setShowAdditional(true)}
            onBlur={() => setTimeout(() => setShowAdditional(false), 200)}
            disabled={!symptoms.chief_complaint}
            className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 disabled:bg-[#f8fafc]"
            placeholder={t("triage:fields.associatedSymptomsPlaceholder")}
          />

          {showAdditional && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(s.term, false)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 flex justify-between"
                >
                  <span>{s.term}</span>
                  <span className="text-xs text-gray-400">{s.category}</span>
                </button>
              ))}
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
                  className="ml-2"
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