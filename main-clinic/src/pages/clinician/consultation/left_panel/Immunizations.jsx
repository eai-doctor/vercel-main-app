import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { PillIcon } from "@/components/ui/icons";
import { formatDate } from "@/utils/DateUtils";

export default function Immunizations({ immunizations }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreImmunizations, setShowMoreImmunizations] = useState(false);

    const sortedImmunizations = Array.isArray(immunizations)
        ? [...immunizations].sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];

    const immunizationsToShow = showMoreImmunizations
        ? sortedImmunizations
        : sortedImmunizations.slice(0, 5);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                        <PillIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-slate-800">
                        {t('clinic:consultation.immunizations', 'Immunizations')}
                    </h2>
                    {sortedImmunizations.length > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
                            {sortedImmunizations.length}
                        </span>
                    )}
                </div>

                {sortedImmunizations.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setShowMoreImmunizations(prev => !prev)}
                        className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
                    >
                        {showMoreImmunizations
                            ? t('clinic:consultation.showRecentOnly', 'Show recent only')
                            : t('clinic:consultation.showAll', { count: sortedImmunizations.length, defaultValue: 'Show all ({{count}})' })}
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                {sortedImmunizations.length === 0 ? (
                    <div className="px-2.5 py-3">
                        <span className="text-[14px] text-slate-400 italic">
                            {t('clinic:consultation.noImmunizations', 'No immunizations recorded.')}
                        </span>
                    </div>
                ) : (
                    <div>
                        {immunizationsToShow.map((im, i) => (
                            <div
                                key={`${im.vaccine}-${im.date}-${i}`}
                                className="flex items-center gap-x-3 px-2.5 py-3 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                {/* Vaccine name */}
                                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                    {im.vaccine || '—'}
                                </span>

                                {/* Status badge */}
                                {im.status && (
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap
                                        ${im.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-[#eef2ff] text-[#2C3B8D]'}`}>
                                    </span>
                                )}

                                {/* Date */}
                                <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                    {im.date ? formatDate(im.date) : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}