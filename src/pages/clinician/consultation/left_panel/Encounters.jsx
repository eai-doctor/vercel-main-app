import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { CalendarIcon } from "@/components/ui/icons";

const formatEncounterDetails = (entry, t) => {
    const fields = [
        entry.provider ? `${t('clinic:consultation.provider', 'Provider')}: ${entry.provider}` : null,
        entry.hospital ? `${t('clinic:consultation.hospital', 'Hospital')}: ${entry.hospital}` : null,
        entry.reason ? `${t('clinic:consultation.reason', 'Reason')}: ${entry.reason}` : null,
        entry.summary ? `${t('clinic:consultation.summary', 'Summary')}: ${entry.summary}` : null,
        entry.relevance_to_focus ? `${t('clinic:consultation.relevance', 'Relevance')}: ${entry.relevance_to_focus}` : null,
        entry.admission_date ? `${t('clinic:consultation.admission', 'Admission')}: ${formatDate(entry.admission_date)}` : null,
        entry.discharge_date ? `${t('clinic:consultation.discharge', 'Discharge')}: ${formatDate(entry.discharge_date)}` : null,
    ].filter(Boolean);
    return fields.length ? fields.join("\n") : "";
};

export default function Encounters({ encounters }) {
  const { t } = useTranslation(['clinic', 'common']);

  const [showMoreEncounters, setShowMoreEncounters] = useState(false);
  const [expandedEncounters, setExpandedEncounters] = useState({});

  const toggleEncounter = (index) => {
    setExpandedEncounters(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const encounterList = (Array.isArray(encounters) ? encounters : [])
    .map(e => ({
      type: e.admission_date
        ? t('clinic:consultation.admissionType', 'Admission')
        : t('clinic:consultation.consultationType', 'Consultation'),
      date: e.date || e.admission_date,
      description: e.admission_date
        ? `${e.hospital} – ${e.reason}`
        : `${e.specialty} – ${e.reason}`,
      details: formatEncounterDetails(e, t),
    }))
    .filter(e => e.date)  // date 없는 항목 제외
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // ✅ 버그 수정: encounterList 기준으로 통일
  const visible = showMoreEncounters ? encounterList : encounterList.slice(0, 5);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <CalendarIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
          </div>
          <h2 className="text-[17px] font-semibold text-slate-800">
            {t('clinic:consultation.encounters', 'Encounters')}
          </h2>
          {/* ✅ encounterList.length 기준 */}
          {encounterList.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {encounterList.length}
            </span>
          )}
        </div>

        {/* ✅ encounterList.length 기준 */}
        {encounterList.length > 5 && (
          <button
            type="button"
            onClick={() => setShowMoreEncounters(prev => !prev)}
            className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
          >
            {showMoreEncounters
              ? t('clinic:consultation.showRecentOnly', 'Show recent only')
              : t('clinic:consultation.showAll', { count: encounterList.length, defaultValue: 'Show all ({{count}})' })}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        {/* ✅ encounterList.length 기준 */}
        {encounterList.length === 0 ? (
          <div className="px-2.5 py-3">
            <span className="text-[14px] text-slate-400 italic">
              {t('clinic:consultation.noDataFound', 'No data found')}
            </span>
          </div>
        ) : (
          <div>
            {visible.map((e, i) => {
              const isExpanded = expandedEncounters[i];
              const isAdmission = e.type === t('clinic:consultation.admissionType', 'Admission');

              return (
                <div
                  key={`${e.type}-${e.date}-${i}`}
                  className="[&+&]:border-t [&+&]:border-slate-100"
                >
                  <button
                    type="button"
                    onClick={() => toggleEncounter(i)}
                    className="w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors text-left"
                  >
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap
                      ${isAdmission
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#eef2ff] text-[#2C3B8D]'}`}
                    >
                      {e.type}
                    </span>

                    <span className="text-[12px] text-slate-500 whitespace-nowrap font-mono">
                      {e.date ? formatDate(e.date) : '—'}
                    </span>

                    <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                      {e.description}
                    </span>

                    {e.details && (
                      <span className={`text-[10px] text-slate-400 transition-transform duration-200 ml-auto
                        ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    )}
                  </button>

                  {isExpanded && e.details && (
                    <div className="mx-2.5 mb-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                      {e.details.split('\n').map((line, li) => {
                        const [label, ...rest] = line.split(': ');
                        return (
                          <div key={li} className="flex gap-2 py-1 [&+&]:border-t [&+&]:border-slate-100">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                              {label}
                            </span>
                            <span className="text-[13px] text-slate-700">
                              {rest.join(': ')}
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