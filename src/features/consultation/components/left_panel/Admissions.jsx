import { useTranslation } from 'react-i18next';
import { formatDate } from "@/utils/DateUtils";
import { relevanceColor } from "@/utils/Colors"

export default function Admissions({
    admissions
}) {
    const { t } = useTranslation(['clinic', 'common']);

    const ads = admissions ?? [];

    return (
        <section className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] space-y-2">
            <h2 className="text-xl font-semibold text-[#1e293b]">
              {t('clinic:consultation.pastAdmissions', 'Past Admissions')}
            </h2>
            {ads.length === 0 ? (
                <p className="text-sm text-[#64748b] italic">
                    No data found
                </p>
            ) : ads
              .sort(
                (a, b) =>
                  new Date(b.admission_date) - new Date(a.admission_date)
              )
              .map((a, i) => (
                <details key={i} className="text-sm border-b-pb-2">
                  <summary className="cursor-pointer font-medium text-[#3b82f6]">
                    {a.hospital} — {formatDate(a.admission_date)} {t('clinic:consultation.to', 'to')}{" "}
                    {formatDate(a.discharge_date)}
                    <span
                      className={`ml-1 ${relevanceColor(a.relevance_to_focus)}`}
                    >
                      [{a.relevance_to_focus}]
                    </span>
                  </summary>
                  <p>
                    <strong>{t('clinic:consultation.reason', 'Reason')}:</strong> {a.reason}
                  </p>
                  <p>
                    <strong>{t('clinic:consultation.summary', 'Summary')}:</strong> {a.summary}
                  </p>
                </details>
              ))}
          </section>
    )
    
}