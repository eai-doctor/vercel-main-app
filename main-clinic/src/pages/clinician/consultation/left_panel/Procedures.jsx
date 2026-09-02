import { useTranslation } from 'react-i18next';

import { formatDate } from "@/utils/DateUtils";
import { StethoscopeIcon } from "@/components/ui/icons";

export default function Procedures({ procedures }) {
  const { t } = useTranslation(['clinic', 'common']);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
          <StethoscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
        </div>
        <h2 className="text-[17px] font-semibold text-slate-800">
          {t('clinic:consultation.procedures', 'Procedures')}
        </h2>
      </div>

      <div className="p-3">
        {!procedures || procedures.length === 0 ? (
          <div className="px-2.5 py-3">
            <span className="text-[14px] text-slate-400 italic">
              {t('clinic:consultation.noDataFound', 'No data found')}
            </span>
          </div>
        ) : (
          <div>
            {procedures.map((p, i) => (
              <div
                key={`${p.procedure || p.display}-${p.code}-${i}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors [&+&]:border-t [&+&]:border-slate-100"
              >
                <span className="flex-1 min-w-[180px] text-[15px] font-semibold text-slate-900">
                  {p.procedure || p.display || p.primary || 'Procedure'}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[12px] px-2.5 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D] font-semibold whitespace-nowrap">
                    {p.code || '—'}
                  </span>

                  {p.code_system && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium whitespace-nowrap">
                      {p.code_system}
                    </span>
                  )}
                </div>

                {p.status && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold capitalize whitespace-nowrap">
                    {p.status}
                  </span>
                )}

                {p.reason && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
                    {p.reason}
                  </span>
                )}

                <span className="text-[12px] text-slate-500 whitespace-nowrap">
                  {t('clinic:consultation.performed', 'Performed')}: {p.date_performed ? formatDate(p.date_performed) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
