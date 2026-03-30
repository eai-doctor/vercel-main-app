import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  ChartIcon 
} from "@/components/icons";

import { formatDate } from "@/utils/DateUtils";

export default function VitalSigns({
    vital_signs,
    vitals
}){
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreVitals, setShowMoreVitals] = useState(false);
    
    // Sort vitals by date (most recent first) and limit display
    const vitalsRaw =
        vital_signs ||
        vitals ||
        []; // support either naming if backend adds later
    const sortedVitals = Array.isArray(vitalsRaw)
        ? [...vitalsRaw].sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];
    const vitalsToShow = showMoreVitals
        ? sortedVitals
        : sortedVitals.slice(0, 3); // Show 3 most recent by default

    return(
         <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                    <ChartIcon className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h2 className="text-2xl font-bold text-gradient">
                    {t('clinic:consultation.vitalSigns', 'Vital Signs')}
                </h2>
                </div>
                {sortedVitals.length > 3 && (
                <button
                    type="button"
                    onClick={() => setShowMoreVitals((prev) => !prev)}
                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
                >
                    {showMoreVitals ? t('clinic:consultation.showRecentOnly', 'Show recent only') : t('clinic:consultation.showAll', { count: sortedVitals.length, defaultValue: 'Show all ({{count}})' })}
                </button>
                )}
            </div>
            {sortedVitals.length > 0 ? (
                <div className="space-y-2 text-sm">
                {vitalsToShow.map((v, i) => (
                    <div
                    key={`${v.measurement || v.name}-${v.date || i}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(15,23,42,0.1)] pb-2 last:border-b-0"
                    >
                    <div className="flex-1">
                        <span className="font-medium text-gray-900">
                        {v.measurement || v.name || "Measurement"}
                        </span>
                        <span className="ml-2 text-[#1e293b]">
                        {v.value != null ? v.value : "—"}
                        {v.unit ? ` ${v.unit}` : ""}
                        </span>
                    </div>
                    <div className="text-xs text-[#64748b] mt-1 sm:mt-0 sm:text-right">
                        {v.date ? formatDate(v.date) : ""}
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-[#64748b] italic">
                {t('clinic:consultation.noVitalSigns', 'No vital signs recorded in the structured data.')}
                </p>
            )}
        </section>
    )
}