import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { ChartIcon } from "@/components/ui/icons";
import { formatDate } from "@/utils/DateUtils";

export default function VitalSigns({ vital_signs }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreVitals, setShowMoreVitals] = useState(false);

    const sortedVitals = Array.isArray(vital_signs)
        ? [...vital_signs].sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];

    const vitalsToShow = showMoreVitals
        ? sortedVitals
        : sortedVitals.slice(0, 5);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                        <ChartIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-slate-800">
                        {t('clinic:consultation.vitalSigns', 'Vital Signs')}
                    </h2>
                    {sortedVitals.length > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
                            {sortedVitals.length}
                        </span>
                    )}
                </div>

                {sortedVitals.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setShowMoreVitals(prev => !prev)}
                        className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
                    >
                        {showMoreVitals
                            ? t('clinic:consultation.showRecentOnly', 'Show recent only')
                            : t('clinic:consultation.showAll', { count: sortedVitals.length, defaultValue: 'Show all ({{count}})' })}
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                {sortedVitals.length === 0 ? (
                    <div className="px-2.5 py-3">
                        <span className="text-[14px] text-slate-400 italic">
                            {t('clinic:consultation.noVitalSigns', 'No vital signs recorded.')}
                        </span>
                    </div>
                ) : (
                    <div>
                        {vitalsToShow.map((v, i) => (
                            <div
                                key={`${v.measurement}-${v.date}-${i}`}
                                className="flex items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                {/* Measurement name */}
                                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                    {v.measurement || '—'}
                                </span>

                                {/* Value + unit */}
                                <span className="text-[14px] text-slate-700 font-mono whitespace-nowrap">
                                    {v.value != null ? v.value : '—'}
                                    {v.unit ? ` ${v.unit}` : ''}
                                </span>

                                {/* Date */}
                                <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                    {v.date ? formatDate(v.date) : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}