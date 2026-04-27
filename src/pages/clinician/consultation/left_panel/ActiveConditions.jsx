import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { formatDate } from "@/utils/DateUtils";
import { isSensitiveDiagnosis } from '@/utils/sensitiveConditions';

import {
  StethoscopeIcon,
} from "@/components/ui/icons";

export default function ActiveConditions({ diagnoses }) {
  const { t } = useTranslation(['clinic', 'common']);

  const activeConditions = useMemo(() => {
    if (!Array.isArray(diagnoses)) return [];
    return diagnoses
      .filter((d) => d.status === "active")
      .sort((a, b) => {
        const da = a.date_diagnosed || "";
        const db = b.date_diagnosed || "";
        return db.localeCompare(da);
      });
  }, [diagnoses]);

  return (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

    {/* Header */}
    <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
      <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
        <StethoscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
      </div>
      <h2 className="text-[17px] font-semibold text-slate-800">
        {t('clinic:consultation.activeConditions', 'Active conditions')}
      </h2>
    </div>

    {/* Body */}
    <div className="p-3">
      {activeConditions.length === 0 ? (
        <div className="px-2.5 py-3">
          <span className="text-[14px] text-slate-400 italic">
            {t('clinic:consultation.noDataFound', 'No data found')}
          </span>
        </div>
      ) : (
        <div>
          {activeConditions.map((d, i) => {
            const sensitive = isSensitiveDiagnosis(d.code);

            return (
              <div
                key={`${d.condition}-${d.code}-${i}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors [&+&]:border-t [&+&]:border-slate-100"
              >
                {/* Condition name */}
                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                  {d.condition}
                </span>

                {/* Code badge + code_system label */}
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-[12px] px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D] font-semibold whitespace-nowrap ${sensitive ? 'blur-sm hover:blur-none transition-all duration-200' : ''}`}>
                    {d.code || "—"}
                  </span>
                  {d.code_system && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium whitespace-nowrap">
                      {d.code_system}
                    </span>
                  )}
                </div>

                {sensitive && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
                    Sensitive Content
                  </span>
                )}

                {/* Status badge */}
                <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold capitalize whitespace-nowrap">
                  {d.status || "—"}
                </span>

                {/* Onset date */}
                <span className="text-[12px] text-slate-500 whitespace-nowrap">
                  {t('clinic:consultation.onset', 'Onset')}: {d.date_diagnosed ? formatDate(d.date_diagnosed) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </section>
  );
}