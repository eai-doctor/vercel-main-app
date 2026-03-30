import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  ImageIcon,
} from "@/components/icons";

export default function Images({
    
}) {
    const { t } = useTranslation(['clinic', 'common']);
    
    return(
        <section className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] space-y-2">
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.images', 'Images')}</h2>
          </div>
          <p className="text-sm text-[#64748b] italic">
            {t('clinic:consultation.noImages', 'No image attachments are available in the current structured data. This section is reserved for future image integration (X-ray photos, scans, etc.).')}
          </p>
        </section>
    )
}