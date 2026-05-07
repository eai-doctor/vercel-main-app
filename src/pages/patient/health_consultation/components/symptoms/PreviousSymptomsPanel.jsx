import React from 'react';
import { ClipboardIcon } from '@/components/ui/icons';
import { useSymptomChat } from './useSymptomChat';
import SymptomChatDrawer from './SymptomChatDrawer';
import SymptomChatSheet from './SymptomChatSheet';

function PreviousSymptomsPanel({ previousSymptoms, isSymptomsLoading, SYMPTOM_SEVERITY_CLASSES, t }) {
  const symptomChat = useSymptomChat();

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100dvh - 160px)' }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-[#f5f7ff]">
          <div className="w-[34px] h-[34px] rounded-[9px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <ClipboardIcon className="w-[16px] h-[16px] text-[#2C3B8D]" />
          </div>
          <h3 className="text-[14px] font-semibold text-slate-800">
            {t('consultation.previousSymptoms', 'Previous Symptoms')}
          </h3>
          {previousSymptoms.length > 0 && (
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {previousSymptoms.length}
            </span>
          )}
        </div>

        <div className="p-3">
          {isSymptomsLoading ? (
            <div className="flex items-center justify-center py-4 gap-2">
              <div className="w-4 h-4 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] text-slate-400">Loading...</span>
            </div>
          ) : previousSymptoms.length === 0 ? (
            <p className="text-[12px] text-slate-400 italic text-center py-2">
              No previous symptoms recorded.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {previousSymptoms.map((symptom, idx) => {
                const label = symptom.symptom || symptom.name || '';
                const severity = symptom.severity || '';
                const sClass = SYMPTOM_SEVERITY_CLASSES[severity?.toLowerCase()] || SYMPTOM_SEVERITY_CLASSES.default;
                const hasLogs = symptom.consultation_ids?.length > 0;

                return (
                  <li
                    key={idx}
                    onClick={() => hasLogs && symptomChat.openSymptom(symptom)}
                    className={`flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 transition-colors
                      ${hasLogs ? 'cursor-pointer hover:bg-[#eef2ff] hover:border-[#c7d2fe]' : ''}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2C3B8D] shrink-0" />
                    <span className="text-[12px] text-slate-800 flex-1 leading-snug">
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </span>
                    {severity && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${sClass}`}>
                        {severity}
                      </span>
                    )}
                    {symptom.first_mentioned && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(symptom.first_mentioned).toLocaleDateString()}
                      </span>
                    )}
                    {hasLogs && (
                      <i className="ti ti-chevron-right text-slate-300" style={{ fontSize: 14 }} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* 데스크탑 → Drawer, 모바일 → BottomSheet */}
      <SymptomChatDrawer
        {...symptomChat}
        SYMPTOM_SEVERITY_CLASSES={SYMPTOM_SEVERITY_CLASSES}
      />
      <SymptomChatSheet
        {...symptomChat}
        SYMPTOM_SEVERITY_CLASSES={SYMPTOM_SEVERITY_CLASSES}
      />
    </>
  );
}

export default PreviousSymptomsPanel;