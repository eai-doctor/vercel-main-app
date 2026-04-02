import { useTranslation } from "react-i18next";

function Questions({ data, setData }) {
  const { symptoms } = data;
  const { t } = useTranslation(["triage", "common"]);

  const ONSET_OPTIONS = [
    { value: "just_now", label: t("triage:onset.justNow") },
    { value: "hours_ago", label: t("triage:onset.hoursAgo") },
    { value: "days_ago", label: t("triage:onset.daysAgo") },
    { value: "weeks_ago", label: t("triage:onset.weeksAgo") },
    { value: "months_ago", label: t("triage:onset.monthsAgo") },
  ];

  const PROGRESSION_OPTIONS = [
    { value: "better", label: t("triage:progression.gettingBetter") },
    { value: "same", label: t("triage:progression.stayingSame") },
    { value: "worse", label: t("triage:progression.gettingWorse") },
  ];

  const CHARACTER_OPTIONS = [
    { value: "sharp", label: t("triage:character.sharp") },
    { value: "dull", label: t("triage:character.dull") },
    { value: "burning", label: t("triage:character.burning") },
    { value: "throbbing", label: t("triage:character.throbbing") },
    { value: "pressure", label: t("triage:character.pressure") },
    { value: "cramping", label: t("triage:character.cramping") },
    { value: "other", label: t("triage:character.other") },
  ];

  const updateSymptoms = (updates) => {
    setData((prev) => ({
      ...prev,
      symptoms: { ...prev.symptoms, ...updates },
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1e293b] text-center">
        {t("triage:steps.details")}
      </h2>

      <div className="space-y-5">

        {/* Onset */}
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:fields.onset")} *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ONSET_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateSymptoms({ onset: opt.value })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  symptoms.onset === opt.value
                    ? "bg-[#2C3B8D] text-white shadow-sm"
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
            {t("triage:severity.label")} * ({symptoms.severity || 5}/10)
          </label>

          <input
            type="range"
            min="1"
            max="10"
            value={symptoms.severity || 5}
            onChange={(e) =>
              updateSymptoms({ severity: parseInt(e.target.value) }) 
            }
            className="w-full h-3 bg-[#f8fafc] rounded-lg appearance-none cursor-pointer accent-[#2C3B8D]"
          />

          <div className="flex justify-between text-xs text-[#64748b] mt-1">
            <span>{t("triage:severity.mild")}</span>
            <span>{t("triage:severity.moderate")}</span>
            <span>{t("triage:severity.severe")}</span>
          </div>
        </div>

        {/* Progression */}
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:fields.progression")} *
          </label>

          <div className="grid grid-cols-3 gap-2">
            {PROGRESSION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateSymptoms({ progression: opt.value })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  symptoms.progression === opt.value
                    ? "bg-[#2C3B8D] text-white shadow-sm"
                    : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        {/* 040126 saebyeok - block for minimizing collecting data
         <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:fields.additionalNotes")}
          </label>

          <input
            type="text"
            value={symptoms.note || ""}
            onChange={(e) => updateSymptoms({ note: e.target.value })}
            className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-2 focus:outline-none focus:border-[#3b82f6]"
            placeholder={t("triage:fields.additionalNotesPlaceholder")}
          />
        </div> */}

        {/* Character */}
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:fields.painCharacter")}
          </label>

          <div className="flex flex-wrap gap-2">
            {CHARACTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateSymptoms({ character: opt.value })}
                className={`py-1.5 px-3 rounded-full text-sm font-medium transition-all ${
                  symptoms.character === opt.value
                    ? "bg-[#2C3B8D] text-white shadow-sm"
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
}

export default Questions;