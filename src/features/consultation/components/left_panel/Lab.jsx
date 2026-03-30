import React, { useMemo, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  PlusCircleIcon
} from "@/components/icons";
import { formatDate } from "@/utils/DateUtils";

import AddLabModal from "./lab/AddLabModal";

export default function Lab({ 
    patientData,
    setPatientData
}){
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreLabs, setShowMoreLabs] = useState(false);
    const [showAddLabModal, setShowAddLabModal] = useState(false);
    
    
    // Sort labs by date (most recent first) and limit display to 3
    const labsToShow = useMemo(() => {
        if (!Array.isArray(patientData.labs)) return [];

        const sorted = [...patientData.labs].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        return showMoreLabs ? sorted : sorted.slice(0, 3);
    }, [patientData, showMoreLabs]);

    return(
        <section className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.labResults', 'Lab Results')}</h2>
                <div className="flex items-center space-x-3">
                <button
                    type="button"
                    onClick={() => setShowAddLabModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>{t('clinic:consultation.addLabResult', 'Add Lab Result')}</span>
                </button>
                {patientData.labs.length > 3 && (
                    <button
                    type="button"
                    onClick={() => setShowMoreLabs((prev) => !prev)}
                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
                    >
                    {showMoreLabs ? t('clinic:consultation.showRecentOnly', 'Show recent only') : t('clinic:consultation.showAll', { count: patientData.labs.length, defaultValue: 'Show all ({{count}})' })}
                    </button>
                )}
                </div>
            </div> 

            {labsToShow.length === 0 ? (
            <div className="flex-1 min-w-[180px]">
                <span className="font-semibold text-[#1e293b]">No data found</span>
            </div>
            ) : labsToShow.length > 0 ? (
                <div className="space-y-2">
                {labsToShow.map((lab, i) => (
                    <div key={`lab-${i}`} className="text-sm border-b pb-2">
                    <strong>{lab.test_name}</strong> — {lab.result} {lab.unit}{" "}
                    {lab.reference_range && `(ref: ${lab.reference_range})`} on {formatDate(lab.date)}
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-[#64748b] italic">
                {t('clinic:consultation.noLabResults', 'No lab results recorded.')}
                </p>
            )}

            
            {/* Add Lab Result Modal */}
            {showAddLabModal && (
                <AddLabModal 
                    setShowAddLabModal={setShowAddLabModal}
                    setPatientData={setPatientData}
                    patientData={patientData}
                />
            )}
        </section>
        )
}