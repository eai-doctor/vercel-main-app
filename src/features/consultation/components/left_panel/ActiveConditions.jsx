import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from "@/utils/DateUtils";

import {
  StethoscopeIcon,
} from "@/components/icons";

export default function ActiveConditions({ diagnoses }){    
    const { t } = useTranslation(['clinic', 'common']);

    // Derived data for new sections
    const activeConditions = useMemo(() => {
        if(!Array.isArray(diagnoses)) return [];
        return diagnoses.filter((d) => d.status === "active")
    }, [diagnoses]);

    return(
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <StethoscopeIcon className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <h2 className="text-2xl font-bold text-red-600">
                {t('clinic:consultation.activeConditions', 'Active Conditions')}
              </h2>
            </div>
            <div className="space-y-2 text-sm">
              {activeConditions.length === 0 ? (
                <div className="flex-1 min-w-[180px]">
                    <span className="font-semibold text-[#1e293b]">No data found</span>
                  </div>
                ) : activeConditions.map((d, i) => (
                <div
                  key={`${d.condition}-${d.icd_code}-${i}`}
                  className="flex flex-wrap items-center justify-between border-b border-[rgba(15,23,42,0.1)] pb-2 last:border-b-0"
                >
                  <div className="flex-1 min-w-[180px]">
                    <span className="font-semibold text-[#1e293b]">{d.condition}</span>
                  </div>
                  <div className="min-w-[110px] text-[#475569]">
                    <span className="font-mono text-xs bg-[#f8fafc] px-2 py-0.5 rounded-full">
                      {d.icd_code || "—"}
                    </span>
                  </div>
                  <div className="min-w-[90px] text-[#475569] capitalize">
                    {d.status || "—"}
                  </div>
                  <div className="min-w-[120px] text-[#64748b] text-xs text-right">
                    {t('clinic:consultation.onset', 'Onset')}: {d.date_diagnosed ? formatDate(d.date_diagnosed) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </section>

    )
}