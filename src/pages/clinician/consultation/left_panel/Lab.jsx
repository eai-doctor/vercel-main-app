import React, { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { PlusCircleIcon } from "@/components/ui/icons";

export default function Lab({ labs, patientId, setPatientData }) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreLabs, setShowMoreLabs] = useState(false);
    const [showAddLabModal, setShowAddLabModal] = useState(false);

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

                <div className="flex items-center gap-3">
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
                    {/* <button
                        type="button"
                        onClick={() => setShowAddLabModal(true)}
                        className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg bg-[#2C3B8D] text-white hover:bg-[#233070] transition-colors"
                    >
                        <PlusCircleIcon className="w-[14px] h-[14px]" />
                        {t('clinic:consultation.addLabResult', 'Add Lab Result')}
                    </button> */}
                </div>
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
                                key={`${lab.measurement}-${lab.date}-${i}`}
                                className="flex items-center gap-x-3 px-2.5 py-3 rounded-xl [&+&]:border-t [&+&]:border-slate-100"
                            >
                                {/* Measurement name */}
                                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                                    {lab.measurement || '—'}
                                </span>

                                {/* Value + unit */}
                                <span className="text-[14px] text-slate-700 font-mono whitespace-nowrap">
                                    {lab.value != null ? lab.value : '—'}
                                    {lab.unit ? ` ${lab.unit}` : ''}
                                </span>

                                {/* Date */}
                                <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap">
                                    {lab.date ? formatDate(lab.date) : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Lab Modal */}
            {/* {showAddLabModal && (
                <AddLabModal
                    setShowAddLabModal={setShowAddLabModal}
                    setPatientData={setPatientData}
                    patientId={patientId}
                />
            )} */}
        </section>
    );
}