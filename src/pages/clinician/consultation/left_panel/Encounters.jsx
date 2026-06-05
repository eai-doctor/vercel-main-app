import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/utils/DateUtils";
import { CalendarIcon } from "@/components/ui/icons";

const formatEncounterDetails = (entry, t) => {
  const fields = [
    entry.status
      ? `${t("clinic:consultation.status", "Status")}: ${entry.status}`
      : null,
    entry.provider
      ? `${t("clinic:consultation.provider", "Provider")}: ${entry.provider}`
      : null,
    entry.reason
      ? `${t("clinic:consultation.reason", "Reason")}: ${entry.reason}`
      : null,
    entry.specialty
      ? `${t("clinic:consultation.specialty", "Specialty")}: ${entry.specialty}`
      : null,
    entry.summary
      ? `${t("clinic:consultation.summary", "Summary")}: ${entry.summary}`
      : null,
    entry.relevance_to_focus
      ? `${t("clinic:consultation.relevance", "Relevance")}: ${entry.relevance_to_focus}`
      : null,
    entry.date
      ? `${t("clinic:consultation.start", "Start")}: ${formatDate(entry.date)}`
      : null,
    entry.end
      ? `${t("clinic:consultation.end", "End")}: ${formatDate(entry.end)}`
      : null,
  ].filter(Boolean);

  return fields.length ? fields.join("\n") : "";
};

export default function Encounters({ encounters, consultations, admissions }) {
  const { t } = useTranslation(["clinic", "common"]);

  const [showMoreEncounters, setShowMoreEncounters] = useState(false);
  const [expandedEncounters, setExpandedEncounters] = useState({});

  const toggleEncounter = (key) => {
    setExpandedEncounters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const encounterList = Array.isArray(encounters)
    ? encounters.map((e) => ({
        id: e.id,
        type: e.type || t("clinic:consultation.encounterType", "Encounter"),
        date: e.date,
        end: e.end,
        provider: e.provider,
        reason: e.reason,
        status: e.status,
        specialty: e.specialty,
        summary: e.summary,
        relevance_to_focus: e.relevance_to_focus,
        description:
          e.type ||
          e.summary ||
          e.reason ||
          e.provider ||
          t("clinic:consultation.encounterType", "Encounter"),
        details: formatEncounterDetails(e, t),
      }))
    : [
        ...(Array.isArray(consultations)
          ? consultations.map((c) => ({
              id: c.id,
              type: t("clinic:consultation.consultationType", "Consultation"),
              date: c.date,
              end: c.end,
              provider: c.provider,
              reason: c.reason,
              status: c.status,
              specialty: c.specialty,
              summary: c.summary,
              relevance_to_focus: c.relevance_to_focus,
              description:
                c.type ||
                c.summary ||
                `${c.specialty || ""}${c.reason ? ` - ${c.reason}` : ""}` ||
                t("clinic:consultation.consultationType", "Consultation"),
              details: formatEncounterDetails(c, t),
            }))
          : []),
        ...(Array.isArray(admissions)
          ? admissions.map((a) => ({
              id: a.id,
              type: t("clinic:consultation.admissionType", "Admission"),
              date: a.date || a.admission_date,
              end: a.end || a.discharge_date,
              provider: a.provider || a.hospital,
              reason: a.reason,
              status: a.status,
              specialty: a.specialty,
              summary: a.summary,
              relevance_to_focus: a.relevance_to_focus,
              description:
                a.type ||
                a.summary ||
                `${a.hospital || a.provider || ""}${a.reason ? ` - ${a.reason}` : ""}` ||
                t("clinic:consultation.admissionType", "Admission"),
              details: formatEncounterDetails(a, t),
            }))
          : []),
      ];

  const sortedEncounters = encounterList
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const visible = showMoreEncounters
    ? sortedEncounters
    : sortedEncounters.slice(0, 5);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
          </div>

          <h2 className="text-[17px] font-semibold text-slate-800">
            {t("clinic:consultation.encounters", "Encounters")}
          </h2>

          {sortedEncounters.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {sortedEncounters.length}
            </span>
          )}
        </div>

        {sortedEncounters.length > 5 && (
          <button
            type="button"
            onClick={() => setShowMoreEncounters((prev) => !prev)}
            className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
          >
            {showMoreEncounters
              ? t("clinic:consultation.showRecentOnly", "Show recent only")
              : t("clinic:consultation.showAll", {
                  count: sortedEncounters.length,
                  defaultValue: "Show all ({{count}})",
                })}
          </button>
        )}
      </div>

      <div className="p-3">
        {sortedEncounters.length === 0 ? (
          <div className="px-2.5 py-3">
            <span className="text-[14px] text-slate-400 italic">
              {t("clinic:consultation.noDataFound", "No data found")}
            </span>
          </div>
        ) : (
          <div>
            {visible.map((e, i) => {
              const key = e.id || `${e.type}-${e.date}-${i}`;
              const isExpanded = expandedEncounters[key];

              return (
                <div
                  key={key}
                  className="[&+&]:border-t [&+&]:border-slate-100"
                >
                  <button
                    type="button"
                    onClick={() => toggleEncounter(key)}
                    className="w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors text-left"
                  >
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap bg-[#eef2ff] text-[#2C3B8D]">
                      {e.status || t("clinic:consultation.encounterType", "Encounter")}
                    </span>

                    <span className="text-[12px] text-slate-500 whitespace-nowrap font-mono">
                      {formatDate(e.date)}
                    </span>

                    <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                      {e.description}
                    </span>

                    {e.provider && (
                      <span className="text-[12px] text-slate-500">
                        {e.provider}
                      </span>
                    )}

                    {e.details && (
                      <span
                        className={`text-[10px] text-slate-400 transition-transform duration-200 ml-auto ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    )}
                  </button>

                  {isExpanded && e.details && (
                    <div className="mx-2.5 mb-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                      {e.details.split("\n").map((line, li) => {
                        const [label, ...rest] = line.split(": ");

                        return (
                          <div
                            key={li}
                            className="flex gap-2 py-1 [&+&]:border-t [&+&]:border-slate-100"
                          >
                            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                              {label}
                            </span>
                            <span className="text-[13px] text-slate-700">
                              {rest.join(": ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
