import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { PlusCircleIcon } from "@/components/ui/icons";

export default function Lab({ labs, requestedLabs = [], patientId, setPatientData }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreLabs, setShowMoreLabs] = useState(false);

    const sorted = useMemo(() => {
        if (!Array.isArray(labs)) return [];
        return [...labs].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );
    }, [labs]);

    const visible = showMoreLabs ? sorted : sorted.slice(0, 5);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                        <PlusCircleIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-slate-800">
                        {t('clinic:consultation.labResults', 'Lab Results')}
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
                        onClick={() => setShowMoreLabs(prev => !prev)}
                        className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
                    >
                        {showMoreLabs
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
                            {t('clinic:consultation.noLabResults', 'No lab results recorded.')}
                        </span>
                    </div>
                ) : (
                    <div>
                        {visible.map((lab, i) => (
                            <div
                                key={`${lab.test_name}-${lab.date}-${i}`}
                                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2.5 py-3 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                {/* Test name */}
                                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                    {lab.test_name || '—'}
                                </span>

                                {/* Result + unit */}
                                <span className="text-[14px] text-slate-700 font-mono whitespace-nowrap">
                                    {lab.result ? lab.result : '—'}
                                    {lab.result && lab.unit ? ` ${lab.unit}` : ''}
                                </span>

                                {/* Reference range */}
                                {lab.reference_range && (
                                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium whitespace-nowrap">
                                        {t('clinic:consultation.ref', 'Ref')}: {lab.reference_range}
                                    </span>
                                )}

                                {/* Date */}
                                <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                    {lab.date ? formatDate(lab.date) : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {requestedLabs.length > 0 && (
                    <div className={sorted.length > 0 ? "mt-3 border-t border-slate-100 pt-3" : ""}>
                        <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide px-2.5 mb-1.5">
                            Requested
                        </p>
                        {requestedLabs.map((lab, i) => (
                            <div
                                key={`requested-${lab.test_name}-${i}`}
                                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                <span className="flex-1 text-[14px] font-medium text-slate-800">
                                    {lab.test_name}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 whitespace-nowrap">
                                    Pending
                                </span>
                                {lab.date && (
                                    <span className="text-[12px] text-slate-400 font-mono whitespace-nowrap">
                                        {formatDate(lab.date)}
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