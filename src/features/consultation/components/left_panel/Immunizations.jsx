import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  PillIcon,
} from "@/components/icons";

export default function Immunizations({
    immuns
}) {
    const { t } = useTranslation(['clinic', 'common']);
    const [showMoreImmunizations, setShowMoreImmunizations] = useState(false);

    // Sort immunizations by date (most recent first)
    const sortedImmunizations = Array.isArray(immuns)
    ? [...immuns].sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
    const immunizationsToShow = showMoreImmunizations
    ? sortedImmunizations
        : sortedImmunizations.slice(0, 3); // Show 3 most recent by default

    return(
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                    <PillIcon className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h2 className="text-2xl font-bold text-gradient">
                    {t('clinic:consultation.immunizations', 'Immunizations')}
                </h2>
                </div>
                {sortedImmunizations.length > 3 && (
                <button
                    type="button"
                    onClick={() => setShowMoreImmunizations((prev) => !prev)}
                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
                >
                    {showMoreImmunizations ? t('clinic:consultation.showRecentOnly', 'Show recent only') : t('clinic:consultation.showAll', { count: sortedImmunizations.length, defaultValue: 'Show all ({{count}})' })}
                </button>
                )}
            </div>
            {sortedImmunizations.length > 0 ? (
                <div className="space-y-2 text-sm">
                {immunizationsToShow.map((im, i) => (
                    <div
                    key={`${im.vaccine || im.name}-${im.date || i}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[rgba(15,23,42,0.1)] pb-2 last:border-b-0"
                    >
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                        {im.vaccine || im.name || "Vaccine"}
                        </span>
                        <span className="font-mono text-xs bg-[#f8fafc] px-2 py-0.5 rounded-full">
                        {im.code || im.cvx || "—"}
                        </span>
                    </div>
                    <div className="text-xs text-[#64748b] mt-1 sm:mt-0 sm:text-right">
                        {im.date ? formatDate(im.date) : "—"}
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-sm text-[#64748b] italic">
                {t('clinic:consultation.noImmunizations', 'No immunizations recorded.')}
                </p>
            )}
        </section>
    )
}