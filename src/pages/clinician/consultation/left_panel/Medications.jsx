import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { PillIcon } from "@/components/ui/icons";

export default function Medications({ medications }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMore, setShowMore] = useState(false);
    const [expandedItems, setExpandedItems] = useState({});

    const toggleItem = (index) => {
        setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const sorted = Array.isArray(medications)
        ? [...medications].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        : [];

    const visible = showMore ? sorted : sorted.slice(0, 5);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                        <PillIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-slate-800">
                        {t('clinic:consultation.medications', 'Medications')}
                    </h2>
                    {sorted.length > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
                            {sorted.length}
                        </span>
                    )}
                </div>

                {sorted.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setShowMore(prev => !prev)}
                        className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
                    >
                        {showMore
                            ? t('clinic:consultation.showRecentOnly', 'Show recent only')
                            : t('clinic:consultation.showAll', { count: sorted.length, defaultValue: 'Show all ({{count}})' })}
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                {sorted.length === 0 ? (
                    <div className="px-2.5 py-3">
                        <span className="text-[14px] text-slate-400 italic">
                            {t('clinic:consultation.noDataFound', 'No data found')}
                        </span>
                    </div>
                ) : (
                    <div>
                        {visible.map((m, i) => {
                            const isExpanded = expandedItems[i];
                            const hasDetails = m.dose || m.frequency || m.route || m.indication || m.end_date || m.code || m.code_system;

                            return (
                                <div
                                    key={`${m.name}-${m.start_date}-${i}`}
                                    className="[&+&]:border-t [&+&]:border-slate-100"
                                >
                                    {/* Main row */}
                                    <button
                                        type="button"
                                        onClick={() => hasDetails && toggleItem(i)}
                                        className={`w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl transition-colors text-left ${hasDetails ? 'hover:bg-[#f8faff] cursor-pointer' : 'cursor-default'}`}
                                    >
                                        {/* Code system badge */}
                                        {m.code_system && (
                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium whitespace-nowrap">
                                                {m.code_system}
                                            </span>
                                        )}

                                        {/* Medication name */}
                                        <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                            {m.name || '—'}
                                        </span>

                                        {/* Start date */}
                                        {m.start_date && (
                                            <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                                {formatDate(m.start_date)}
                                            </span>
                                        )}

                                        {/* Expand chevron */}
                                        {hasDetails && (
                                            <span className={`text-[10px] text-slate-400 transition-transform duration-200 ml-auto ${isExpanded ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        )}
                                    </button>

                                    {/* Expanded details */}
                                    {isExpanded && hasDetails && (
                                        <div className="mx-2.5 mb-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {[
                                                m.dose         && { label: t('clinic:consultation.dose',        'Dose'),        value: m.dose },
                                                m.frequency    && { label: t('clinic:consultation.frequency',   'Frequency'),   value: m.frequency },
                                                m.route        && { label: t('clinic:consultation.route',       'Route'),       value: m.route },
                                                m.indication   && { label: t('clinic:consultation.indication',  'Indication'),  value: m.indication },
                                                m.end_date     && { label: t('clinic:consultation.endDate',     'End date'),    value: formatDate(m.end_date) },
                                                m.code         && { label: t('clinic:consultation.code',        'Code'),        value: m.code },
                                            ].filter(Boolean).map((row, ri) => (
                                                <div key={ri} className="flex gap-2 py-1 [&+&]:border-t [&+&]:border-slate-100">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                                                        {row.label}
                                                    </span>
                                                    <span className="text-[13px] text-slate-700">
                                                        {row.value}
                                                    </span>
                                                </div>
                                            ))}
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