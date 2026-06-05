import { useTranslation } from "react-i18next";

function Questions({ data, setData }) {
  const { triage } = data;
  const { t } = useTranslation(["triage", "common"]);

  const update = (updates) => {
    setData((prev) => ({ ...prev, triage: { ...prev.triage, ...updates } }));
  };

  const painOptions = [
    { value: 0, label: "No pain" },
    { value: 3, label: "Mild" },
    { value: 5, label: "Moderate" },
    { value: 8, label: "Severe" },
    { value: 10, label: "Worst possible" },
  ];

  const modifierOptions = [
    { key: "critical_look", label: "Looks very unwell / pale / struggling" },
    { key: "airway_breathing_circulation_issue", label: "Breathing, circulation, or airway looks unsafe" },
    { key: "worse_than_expected", label: "Feels worse than it looks" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#1e293b] text-center">
        {t("triage:questions.title", "Quick triage checks")}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:questions.pain", "How bad is the pain?")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {painOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ pain_score: opt.value })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  triage?.pain_score === opt.value
                    ? "bg-[#2C3B8D] text-white shadow-sm"
                    : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:questions.observe", "What do you see right now?")}
          </label>
          <div className="space-y-2">
            {modifierOptions.map((opt) => {
              const active = Boolean(triage?.[opt.key]);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => update({ [opt.key]: !active })}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    active
                      ? "bg-blue-50 border-blue-300 text-[#1e293b]"
                      : "bg-white border-[rgba(15,23,42,0.1)] text-[#475569] hover:border-[rgba(59,130,246,0.4)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:questions.subjective", "A short description in your own words")}
          </label>
          <textarea
            value={triage?.subjective || ""}
            onChange={(e) => update({ subjective: e.target.value })}
            rows={3}
            placeholder={t("triage:questions.subjectivePlaceholder", "What happened, when it started, and what worries you most")}
            className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">
            {t("triage:questions.objective", "Anything obvious the nurse can see?")}
          </label>
          <textarea
            value={triage?.objective || ""}
            onChange={(e) => update({ objective: e.target.value })}
            rows={3}
            placeholder={t("triage:questions.objectivePlaceholder", "Example: bleeding, rash, wheezing, swelling, unable to walk")}
            className="w-full border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
          />
        </div>
      </div>
    </div>
  );
}

export default Questions;
