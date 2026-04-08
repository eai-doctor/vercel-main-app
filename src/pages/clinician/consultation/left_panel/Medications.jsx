import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { PillIcon } from "@/components/ui/icons";

const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-700';
        case 'stopped':
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        case 'completed':
            return 'bg-[#eef2ff] text-[#2C3B8D]';
        default:
            return 'bg-slate-100 text-slate-500';
    }
};

export default function Medications({ medications }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMore, setShowMore] = useState(false);

    const sorted = Array.isArray(medications)
        ? [...medications].sort((a, b) => new Date(b.date) - new Date(a.date))
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
                        {visible.map((m, i) => (
                            <div
                                key={`${m.name}-${m.date}-${i}`}
                                className="flex items-center gap-x-3 px-2.5 py-3 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                {/* Status badge */}
                                {m.status && (
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusStyle(m.status)}`}>
                                        {m.status}
                                    </span>
                                )}

                                {/* Medication name */}
                                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                    {m.name || '—'}
                                </span>

                                {/* Dose (optional) */}
                                {m.dose && (
                                    <span className="text-[13px] text-slate-500 whitespace-nowrap">
                                        {m.dose}
                                    </span>
                                )}

                                {/* Date */}
                                {m.date && (
                                    <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                        {formatDate(m.date)}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}