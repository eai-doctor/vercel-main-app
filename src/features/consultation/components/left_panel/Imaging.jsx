import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  PillIcon,
} from "@/components/icons";

export default function Imaging({
    imaging
}) {
    const { t } = useTranslation(['clinic', 'common']);
    return (
       true && (
          <section className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] space-y-2">
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.imaging', 'Imaging')}</h2>
            { imaging?.length > 0 ? imaging
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((img, i) => (
                <details key={i} className="text-sm border-b pb-2">
                  <summary className="cursor-pointer font-medium text-[#3b82f6]">
                    {img.procedure} on {formatDate(img.date)}
                    {img.relevance_to_current_visit && (
                      <span
                        className={`ml-1 ${relevanceColor(
                          img.relevance_to_current_visit
                        )}`}
                      >
                        [{img.relevance_to_current_visit}]
                      </span>
                    )}
                  </summary>
                  <p>
                    <strong>{t('clinic:consultation.findings', 'Findings')}:</strong> {img.findings}
                  </p>
                  <p>
                    <strong>{t('clinic:consultation.impression', 'Impression')}:</strong> {img.impression}
                  </p>
                  <p>
                    <strong>{t('clinic:consultation.indication', 'Indication')}:</strong> {img.indication}
                  </p>
                  {img.recommendations && (
                    <p>
                      <strong>{t('clinic:consultation.recommendations', 'Recommendations')}:</strong> {img.recommendations}
                    </p>
                  )}
                </details>
              )) : <p className="text-sm text-[#64748b] italic">
                    No data found
                </p>}
          </section> )
    )
}