import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
    ClipboardListIcon 
} from "@/components/icons";

export default function InsuranceBilling({
    insuranceItems
}) {
    const { t } = useTranslation(['clinic', 'common']);
    
    return (
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
              <ClipboardListIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e293b]">
              {t('clinic:consultation.insuranceBilling', 'Insurance / Billing')}
            </h2>
          </div>
          {Array.isArray(insuranceItems) && insuranceItems.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-[#1e293b] space-y-1">
              {insuranceItems.map((item, i) => (
                <li key={item.id || item.plan || item.name || i}>
                  {item.name || item.plan || item.policy_id || "Insurance item"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#64748b] italic">
              {t('clinic:consultation.noInsurance', 'No insurance or billing records listed.')}
            </p>
          )}
        </section>
    )
}