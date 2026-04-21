import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, MapPin, Activity, CheckCircle, ChevronRight } from 'lucide-react';

function Results({ result, restart }) {
  const { t } = useTranslation(['triage', 'common']);
  
  if (!result || !result.success) return null;

  const { triage, red_flags, differential_diagnoses, next_steps, disclaimer } = result;

  // Triage level theme mapping
  const getLevelStyles = (level) => {
    switch (level) {
      case 1: return { bg: 'bg-[#ef4444]', text: 'text-white', label: 'bg-red-700' };
      case 2: return { bg: 'bg-[#f97316]', text: 'text-white', label: 'bg-orange-700' };
      case 3: return { bg: 'bg-[#facc15]', text: 'text-[#1e293b]', label: 'bg-yellow-600' };
      case 4: return { bg: 'bg-[#3b82f6]', text: 'text-white', label: 'bg-[#2C3B8D]' }; // Your primary color
      default: return { bg: 'bg-[#22c55e]', text: 'text-white', label: 'bg-green-700' };
    }
  };


  const theme = getLevelStyles(triage.level);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Main Triage Banner (Consistent with your button styling) */}
      <div className={`${theme.bg} ${theme.text} rounded-xl p-8 shadow-sm text-center space-y-4`}>
        <div className="inline-block px-4 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2">
          {t('triage:results.triage_status')}
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          {triage.level_name}
        </h2>
        <p className="text-lg font-medium opacity-90">
          {triage.recommended_action}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Clock size={16} /> {triage.time_to_care}
          </div>
          <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-lg text-sm font-medium">
            <MapPin size={16} /> {triage.recommended_venue}
          </div>
        </div>
      </div>

      {/* 2. Assessment Summary Section */}
      <div className="bg-white rounded-xl p-6 border border-[rgba(15,23,42,0.1)] space-y-4">
        <h3 className="font-semibold text-[#1e293b] text-lg flex items-center gap-2">
          <Activity size={20} className="text-[#3b82f6]" />
          {t('triage:results.assessment_summary')}
        </h3>
        <p className="text-[#475569] text-sm leading-relaxed whitespace-pre-line">
          {triage.reasoning}
        </p>
      </div>

      {/* 3. Red Flags Section (Urgent Attention) */}
      {red_flags && red_flags.length > 0 && (
        <div className="bg-[#fff1f2] rounded-xl p-6 border border-[#fecdd3] space-y-4">
          <h3 className="font-semibold text-[#9f1239] text-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {t('triage:results.safety_alerts')}
          </h3>
          <div className="space-y-3">
            {red_flags.map((flag, idx) => (
              <div key={idx} className="flex gap-3 text-sm text-[#be123c] leading-snug italic">
                <span className="shrink-0">•</span>
                <p>{flag.concern}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Potential Considerations (Differential Diagnoses) */}
      <div className="bg-white rounded-xl p-6 border border-[rgba(15,23,42,0.1)] space-y-4">
        <h3 className="font-semibold text-[#1e293b] text-lg">
          {t('triage:results.potential_considerations')}
        </h3>
        <div className="grid gap-3">
          {differential_diagnoses.map((item, idx) => (
            <div key={idx} className="group p-4 rounded-lg bg-[#f8fafc] border border-[rgba(15,23,42,0.05)] hover:border-[#3b82f6]/30 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-[#1e293b]">{item.condition}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#475569] border border-[rgba(15,23,42,0.1)] uppercase">
                  {item.probability}
                </span>
              </div>
              <p className="text-xs text-[#64748b] leading-relaxed">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Next Steps List */}
      <div className="bg-white rounded-xl p-6 border border-[rgba(15,23,42,0.1)] space-y-4">
        <h3 className="font-semibold text-[#1e293b] text-lg flex items-center gap-2">
          <CheckCircle size={20} className="text-[#22c55e]" />
          {t('triage:results.next_steps')}
        </h3>
        <div className="grid gap-2">
          {next_steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-[#f0fdf4] text-[#166534] text-sm font-medium">
              <ChevronRight size={14} className="shrink-0 opacity-50" />
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Legal Disclaimer (Conservative Style) */}
      <div className="px-2">
        <div className="bg-[#f1f5f9] rounded-lg p-4">
          <p className="text-[11px] text-[#64748b] leading-normal text-center italic">
            {disclaimer}
          </p>
        </div>
      </div>

      {/* 7. Restart Button */}
      <button
        onClick={restart}
        className="w-full py-3 px-4 rounded-lg border border-[rgba(15,23,42,0.1)] bg-[#f8fafc] text-[#475569] font-medium hover:border-[rgba(59,130,246,0.4)] transition-all"
      >
        ← {t('triage:results.start_over')}
      </button>
      
    </div>
  );
}

export default Results;