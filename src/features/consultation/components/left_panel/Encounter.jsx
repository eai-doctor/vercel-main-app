import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import { formatDate } from "@/utils/DateUtils";

const formatEncounterDetails = (entry) => {
    const fields = [
        entry.provider ? `${t('clinic:consultation.provider', 'Provider')}: ${entry.provider}` : null,
        entry.hospital ? `${t('clinic:consultation.hospital', 'Hospital')}: ${entry.hospital}` : null,
        entry.reason ? `${t('clinic:consultation.reason', 'Reason')}: ${entry.reason}` : null,
        entry.summary ? `${t('clinic:consultation.summary', 'Summary')}: ${entry.summary}` : null,
        entry.relevance_to_focus ? `${t('clinic:consultation.relevance', 'Relevance')}: ${entry.relevance_to_focus}` : null,
        entry.admission_date ? `${t('clinic:consultation.admission', 'Admission')}: ${formatDate(entry.admission_date)}` : null,
        entry.discharge_date ? `${t('clinic:consultation.discharge', 'Discharge')}: ${formatDate(entry.discharge_date)}` : null,
    ].filter(Boolean);
    return fields.length ? fields.join("\n") : "";
};

import {
   CalendarIcon
} from "@/components/icons";

export default function Encounters({
    consultations,
    admissions
}){
    const { t } = useTranslation(['clinic', 'common']);

    const [showMoreEncounters, setShowMoreEncounters] = useState(false);
    const [expandedEncounters, setExpandedEncounters] = useState({});

    // Helper function to toggle encounter expansion
    const toggleEncounter = (index) => {
    setExpandedEncounters((prev) => ({
        ...prev,
        [index]: !prev[index]
    }));
    };

    const encounters = [
        ...(Array.isArray(consultations)
        ? consultations.map((c) => ({
            type: t('clinic:consultation.consultationType', 'Consultation'),
            date: c.date,
            description: `${c.specialty} – ${c.reason}`,
            details: formatEncounterDetails(c),
        }))
        : []),
        ...(Array.isArray(admissions)
        ? admissions.map((a) => ({
            type: t('clinic:consultation.admissionType', 'Admission'),
            date: a.admission_date,
            description: `${a.hospital} – ${a.reason}`,
            details: formatEncounterDetails(a),
        }))
        : []),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return (
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
            
            <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[rgba(5,7,10,0.08)] rounded-lg flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-[#3b82f6]" />
                </div>

                <h2 className="text-2xl font-bold text-gradient">
                {t('clinic:consultation.encounters', 'Encounters')}
                </h2>
            </div>

            {encounters.length > 5 && (
                <button
                type="button"
                onClick={() => setShowMoreEncounters((prev) => !prev)}
                className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
                >
                {showMoreEncounters
                    ? t('clinic:consultation.showRecentOnly', 'Show recent only')
                    : t('clinic:consultation.showAll', {
                        count: encounters.length,
                        defaultValue: 'Show all ({{count}})',
                    })}
                </button>
            )}
            </div>

            {/* 내용 영역 */}
            {encounters.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-2">
                No data found
            </div>
            ) : (
            <div className="space-y-2 text-sm">
                {(showMoreEncounters ? encounters : encounters.slice(0, 5)).map((e, i) => (
                <div
                    key={`${e.type}-${e.date}-${i}`}
                    className="border-b border-[rgba(15,23,42,0.1)] last:border-b-0"
                >
                    {/* 기존 encounter UI 그대로 */}
                </div>
                ))}
            </div>
            )}

        </section>
    )
}