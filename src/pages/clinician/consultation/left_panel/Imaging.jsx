import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { ScanIcon } from "@/components/ui/icons";

const relevanceStyle = (relevance) => {
    switch (relevance?.toLowerCase()) {
        case 'high':
            return 'bg-red-100 text-red-700';
        case 'moderate':
            return 'bg-amber-100 text-amber-700';
        case 'low':
            return 'bg-slate-100 text-slate-500';
        default:
            return 'bg-[#eef2ff] text-[#2C3B8D]';
    }
};

export default function Imaging({ imaging }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMore, setShowMore] = useState(false);
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (i) => {
        setExpanded(prev => ({ ...prev, [i]: !prev[i] }));
    };

    const sorted = Array.isArray(imaging)
        ? [...imaging].sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];

    const visible = showMore ? sorted : sorted.slice(0, 5);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                        <ScanIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-slate-800">
                        {t('clinic:consultation.imaging', 'Imaging')}
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
                        {visible.map((img, i) => {
                            const isExpanded = expanded[i];
                            const hasDetails = img.findings || img.impression || img.indication || img.recommendations;

                            return (
                                <div
                                    key={`${img.procedure}-${img.date}-${i}`}
                                    className="[&+&]:border-t [&+&]:border-slate-100"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(i)}
                                        className="w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors text-left"
                                    >
                                        {/* Relevance badge */}
                                        {img.relevance_to_current_visit && (
                                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap ${relevanceStyle(img.relevance_to_current_visit)}`}>
                                                {img.relevance_to_current_visit}
                                            </span>
                                        )}

                                        {/* Procedure name */}
                                        <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                            {img.procedure || '—'}
                                        </span>

                                        {/* Region */}
                                        {img.region && (
                                            <span className="text-[12px] text-slate-400 whitespace-nowrap">
                                                {img.region}
                                            </span>
                                        )}

                                        {/* Date */}
                                        <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                            {img.date ? formatDate(img.date) : '—'}
                                        </span>

                                        {/* Chevron */}
                                        {hasDetails && (
                                            <span className={`text-[10px] text-slate-400 transition-transform duration-200 ml-auto ${isExpanded ? 'rotate-180' : ''}`}>
                                                ▼
                                            </span>
                                        )}
                                    </button>

                                    {/* Expanded details */}
                                    {isExpanded && hasDetails && (
                                        <div className="mx-2.5 mb-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                                            {img.findings && (
                                                <div className="flex gap-2 py-1 [&+&]:border-t [&+&]:border-slate-100">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                                                        {t('clinic:consultation.findings', 'Findings')}
                                                    </span>
                                                    <span className="text-[13px] text-slate-700">{img.findings}</span>
                                                </div>
                                            )}
                                            {img.impression && (
                                                <div className="flex gap-2 py-1 border-t border-slate-100">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                                                        {t('clinic:consultation.impression', 'Impression')}
                                                    </span>
                                                    <span className="text-[13px] text-slate-700">{img.impression}</span>
                                                </div>
                                            )}
                                            {img.indication && (
                                                <div className="flex gap-2 py-1 border-t border-slate-100">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                                                        {t('clinic:consultation.indication', 'Indication')}
                                                    </span>
                                                    <span className="text-[13px] text-slate-700">{img.indication}</span>
                                                </div>
                                            )}
                                            {img.recommendations && (
                                                <div className="flex gap-2 py-1 border-t border-slate-100">
                                                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[90px] pt-0.5">
                                                        {t('clinic:consultation.recommendations', 'Recommendations')}
                                                    </span>
                                                    <span className="text-[13px] text-slate-700">{img.recommendations}</span>
                                                </div>
                                            )}
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