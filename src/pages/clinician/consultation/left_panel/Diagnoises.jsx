import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { StethoscopeIcon } from "@/components/ui/icons";

const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
        case 'active':
            return 'bg-red-100 text-red-700';
        case 'resolved':
            return 'bg-green-100 text-green-700';
        case 'inactive':
            return 'bg-slate-100 text-slate-500';
        default:
            return 'bg-[#eef2ff] text-[#2C3B8D]';
    }
};

export default function Diagnoses({ diagnoses }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreDiagnoses, setShowMoreDiagnoses] = useState(false);

    const activeDiagnoses = useMemo(() => {
        if (!Array.isArray(diagnoses)) return [];
        return [...diagnoses].sort(
            (a, b) => new Date(b.date_diagnosed) - new Date(a.date_diagnosed)
        );
    }, [diagnoses]);

    const visible = showMoreDiagnoses
        ? activeDiagnoses
        : activeDiagnoses.slice(0, 5);

    return (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
                <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                        <StethoscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
                    </div>
                    <h2 className="text-[17px] font-semibold text-slate-800">
                        {t('clinic:consultation.diagnoses', 'Diagnoses')}
                    </h2>
                    {activeDiagnoses.length > 0 && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
                            {activeDiagnoses.length}
                        </span>
                    )}
                </div>

                {activeDiagnoses.length > 5 && (
                    <button
                        type="button"
                        onClick={() => setShowMoreDiagnoses(prev => !prev)}
                        className="text-[13px] text-[#2C3B8D] hover:text-[#233070] font-medium transition-colors"
                    >
                        {showMoreDiagnoses
                            ? t('clinic:consultation.showRecentOnly', 'Show recent only')
                            : t('clinic:consultation.showAll', { count: activeDiagnoses.length, defaultValue: 'Show all ({{count}})' })}
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-3">
                {activeDiagnoses.length === 0 ? (
                    <div className="px-2.5 py-3">
                        <span className="text-[14px] text-slate-400 italic">
                            {t('clinic:consultation.noDataFound', 'No data found')}
                        </span>
                    </div>
                ) : (
                    <div>
                        {visible.map((d, i) => (
                            <div
                                key={`${d.condition}-${d.date_diagnosed}-${i}`}
                                className="flex items-center gap-x-3 px-2.5 py-3 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                {/* Status badge */}
                                {d.status && (
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusStyle(d.status)}`}>
                                        {d.status}
                                    </span>
                                )}

                                {/* Condition name */}
                                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                    {d.condition || '—'}
                                </span>

                                {/* ICD code (optional) */}
                                {d.icd_code && (
                                    <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                                        {d.icd_code}
                                    </span>
                                )}

                                {/* Date */}
                                {d.date_diagnosed && (
                                    <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                        {formatDate(d.date_diagnosed)}
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