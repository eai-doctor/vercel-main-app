import React, { useMemo, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import { formatDate } from "@/utils/DateUtils";
import { relevanceColor } from "@/utils/Colors"

import {
    StethoscopeIcon 
} from "@/components/icons";

export default function Diagnoises({diagnoses}){
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreDiagnoses, setShowMoreDiagnoses] = useState(false);

    const actvieDiagnoses = useMemo(()=>{
        if(!Array.isArray(diagnoses)) return [];
        return diagnoses
            .sort((a, b) => new Date(b.date_diagnosed) - new Date(a.date_diagnosed))
            .slice(0, showMoreDiagnoses ? diagnoses.length : 3)
    },[diagnoses, showMoreDiagnoses]);
    
    return(
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <StethoscopeIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-2xl font-bold text-red-600">{t('clinic:consultation.diagnoses', 'Diagnoses')}</h2>
            </div>
            {diagnoses?.length > 3 && (
            <button
                onClick={() => setShowMoreDiagnoses(!showMoreDiagnoses)}
                className="text-sm text-red-600 hover:text-red-800 font-medium underline" /* Keep red for diagnoses */
            >
                {showMoreDiagnoses ? t('clinic:consultation.showRecentOnly', 'Show recent only') : t('clinic:consultation.showAll', { count: diagnoses.length, defaultValue: 'Show all ({{count}})' })}
            </button>
            )}
        </div>
        {actvieDiagnoses.length === 0 ? (
            <div className="flex-1 min-w-[180px]">
                <span className="font-semibold text-[#1e293b]">No data found</span>
            </div>
            ) : actvieDiagnoses.map((d, i) => (
            <div key={i} className="border-b pb-2 mb-2">
                <div className="flex justify-between items-start">
                <span className={relevanceColor(d.relevance_to_focus)}>
                    {d.condition}
                </span>
                {d.date_diagnosed && (
                    <span className="text-xs text-[#64748b] ml-2">
                    {formatDate(d.date_diagnosed)}
                    </span>
                )}
                </div>
                {d.icd_code && (
                <span className="text-xs text-gray-400">ICD: {d.icd_code}</span>
                )}
            </div>
            ))}
        </section>
)
}