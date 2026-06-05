import { useTranslation } from "react-i18next";

const LEVEL_STYLES = {
  1: "bg-red-600 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-amber-500 text-white",
  4: "bg-sky-600 text-white",
  5: "bg-emerald-600 text-white",
};

function Results({ result, restart }) {
  const { t } = useTranslation(["triage", "common"]);

  if (!result || !result.success) return null;

  const ctas = result.ctas_result || {};
  const ctasLevels = [
    { level: 1, title: t("triage:results.level1Title", "Level 1 - Resuscitation"), summary: t("triage:results.level1Summary", "Immediate resuscitation and continuous nursing care.") },
    { level: 2, title: t("triage:results.level2Title", "Level 2 - Emergent"), summary: t("triage:results.level2Summary", "Needs care within 15 minutes.") },
    { level: 3, title: t("triage:results.level3Title", "Level 3 - Urgent"), summary: t("triage:results.level3Summary", "Needs care within 30 minutes.") },
    { level: 4, title: t("triage:results.level4Title", "Level 4 - Less Urgent"), summary: t("triage:results.level4Summary", "Needs care within 60 minutes.") },
    { level: 5, title: t("triage:results.level5Title", "Level 5 - Non-Urgent"), summary: t("triage:results.level5Summary", "Needs care within 120 minutes.") },
  ];

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 ${LEVEL_STYLES[ctas.level] || LEVEL_STYLES[5]}`}>
        <p className="text-xs uppercase tracking-wider opacity-80 mb-2">
          {t("triage:results.ctasResult", "CTAS result")}
        </p>
        <h2 className="text-3xl font-bold mb-2">{ctas.level_name}</h2>
        <p className="text-sm opacity-90">{ctas.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#64748b] mb-1">
            {t("triage:results.priority", "Priority")}
          </p>
          <p className="text-lg font-semibold text-[#1e293b]">{ctas.priority}</p>
        </div>
        <div className="rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-[#64748b] mb-1">
            {t("triage:results.reassessment", "Reassessment")}
          </p>
          <p className="text-lg font-semibold text-[#1e293b]">{ctas.reassessment}</p>
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#334155] mb-3">
          {t("triage:results.levelGuideTitle", "What the CTAS levels mean")}
        </h3>
        <div className="space-y-2">
          {ctasLevels.map((item) => {
            const active = item.level === ctas.level;
            return (
              <div
                key={item.level}
                className={`rounded-lg border px-4 py-3 transition-all ${
                  active
                    ? "border-[#2C3B8D] bg-[#eef2ff]"
                    : "border-[rgba(15,23,42,0.08)] bg-[#f8fafc]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm font-semibold ${active ? "text-[#1e293b]" : "text-[#475569]"}`}>
                    {item.title}
                  </p>
                  {active && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2C3B8D]">
                      {t("triage:results.current", "Current")}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${active ? "text-[#334155]" : "text-[#64748b]"}`}>
                  {item.summary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(15,23,42,0.08)] bg-[#f8fafc] p-4">
        <h3 className="text-sm font-semibold text-[#334155] mb-2">
          {t("triage:results.whatDrove", "What drove this result")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {(ctas.matched_labels || []).length > 0 ? (
            ctas.matched_labels.map((item, index) => (
              <span key={index} className="px-3 py-1 rounded-full bg-white border border-[rgba(15,23,42,0.1)] text-sm text-[#475569]">
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-[#64748b]">
              {t("triage:results.noHighAcuity", "No high-acuity warning sign was selected.")}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-4 space-y-2">
        <h3 className="text-sm font-semibold text-[#334155]">
          {t("triage:results.operationalNote", "Operational note")}
        </h3>
        <p className="text-sm text-[#64748b]">
          {t(
            "triage:results.operationalNoteBody",
            "If the patient changes while waiting, document the change and update priority as needed, but keep the original triage record."
          )}
        </p>
      </div>

      <button
        onClick={restart}
        className="w-full py-3 px-4 rounded-lg border border-[rgba(15,23,42,0.1)] bg-[#f8fafc] text-[#475569] font-medium hover:border-[rgba(59,130,246,0.4)] transition-all"
      >
        {t("triage:results.start_over", "Start over")}
      </button>
    </div>
  );
}

export default Results;
