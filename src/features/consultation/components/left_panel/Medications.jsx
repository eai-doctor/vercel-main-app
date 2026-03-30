import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";

export default function Medications({medications}){
    const { t } = useTranslation(['clinic', 'common']);

    const med = medications ?? [];

    return (
          <section className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] space-y-2">
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.medications', 'Medications')}</h2>
            {med.length === 0 ? (
            <div className="flex-1 min-w-[180px]">
                <span className="font-semibold text-[#1e293b]">No data found</span>
            </div>
            ) : med.map((m, i) => (
              <div key={i} className="text-sm border-b pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <strong>{m.name}</strong> {m.dose} {m.route} {m.frequency}
                    {m.indication && <span> ({m.indication})</span>}
                  </div>
                  <div className="text-xs text-[#64748b] ml-4 text-right whitespace-nowrap">
                    {m.start_date && (
                      <div>{t('clinic:consultation.started', 'Started')}: {formatDate(m.start_date)}</div>
                    )}
                    {m.end_date && (
                      <div>{t('clinic:consultation.ended', 'Ended')}: {formatDate(m.end_date)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )
}