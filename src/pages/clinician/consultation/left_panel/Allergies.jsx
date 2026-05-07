import { useTranslation } from 'react-i18next';

import { formatDate } from "@/utils/DateUtils";
import { StethoscopeIcon } from "@/components/ui/icons";

export default function Allergies({ allergies }) {
  const { t } = useTranslation(['clinic', 'common']);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
          <StethoscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
        </div>
        <h2 className="text-[17px] font-semibold text-slate-800">
          {t('clinic:consultation.allergies', 'Allergies')}
        </h2>
      </div>

      <div className="p-3">
        {!allergies || allergies.length === 0 ? (
          <div className="px-2.5 py-3">
            <span className="text-[14px] text-slate-400 italic">
              {t('clinic:consultation.noDataFound', 'No data found')}
            </span>
          </div>
        ) : (
          <div>
            {allergies.map((a, i) => (
              <div
                key={`${a.allergy || a.substance}-${a.code}-${i}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors [&+&]:border-t [&+&]:border-slate-100"
              >
                <span className="flex-1 min-w-[160px] text-[15px] font-semibold text-slate-900">
                  {a.allergy || a.substance || a.primary || 'Allergy'}
                </span>

                {a.criticality && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold capitalize whitespace-nowrap">
                    {a.criticality}
                  </span>
                )}

                {a.status && (
                  <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold capitalize whitespace-nowrap">
                    {a.status}
                  </span>
                )}

                {a.type && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium capitalize whitespace-nowrap">
                    {a.type}
                  </span>
                )}

                <span className="text-[12px] text-slate-500 whitespace-nowrap">
                  {t('clinic:consultation.onset', 'Onset')}: {a.date_diagnosed ? formatDate(a.date_diagnosed) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
