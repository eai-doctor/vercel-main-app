  import {
  AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon,
  MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
} from '@/components/ui/icons';
  
  const ModalHeader = ({ title, subtitle, badge, onClose }) => (
    <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff] sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
          <AiIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
        </div>
        <div>
          <h2 className="text-[17px] font-semibold text-slate-800">{title}</h2>
          <div className="flex items-center gap-2">
            {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
            {badge && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">{badge}</span>}
          </div>
        </div>
      </div>
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );

function EmailSummaryModal({ t, setShowEndConsultationModal, patientEmail, setPatientEmail, isGeneratingSummary, emailResult, setAiSummary, aiSummary, handleSendEmail, isSendingEmail }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <ModalHeader title={t('consultation.sendSummary', 'Send Summary')} subtitle={t('consultation.emailSummaryToPatient', 'Email consultation summary')} onClose={() => setShowEndConsultationModal(false)} />
        <div className="p-5 space-y-4">
            <div className="space-y-1.5">
            <label className="text-[12px] font-medium uppercase tracking-wide text-slate-400">{t('consultation.patientEmailAddress', 'Patient Email')}</label>
            <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="patient@example.com"
                className="w-full px-4 py-3 text-[14px] border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10 text-slate-900 placeholder:text-slate-400" />
            </div>
            <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium uppercase tracking-wide text-slate-400">{t('consultation.consultationSummary', 'Summary')}</label>
                {isGeneratingSummary && (
                <div className="flex items-center gap-1.5 text-[12px] text-[#2C3B8D]">
                    <div className="w-3 h-3 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin" />
                    {t('common:states.generating', 'Generating...')}
                </div>
                )}
            </div>
            <textarea value={aiSummary} onChange={(e) => setAiSummary(e.target.value)} placeholder={t('consultation.summaryPlaceholder', 'Summary will appear here...')} rows={10}
                className="w-full px-4 py-3 text-[13px] font-mono border border-slate-200 rounded-xl focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10 resize-none" />
            </div>
            {emailResult && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[13px] font-semibold ${emailResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {emailResult.success ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                <div>
                <p>{emailResult.success ? t('consultation.emailSentSuccess') : t('consultation.emailSentFailed')}</p>
                {emailResult.message && <p className="text-[11px] font-normal mt-0.5 opacity-80">{emailResult.message}</p>}
                </div>
            </div>
            )}
            <div className="flex gap-3 pt-2">
            <button onClick={handleSendEmail} disabled={isSendingEmail || !patientEmail || !aiSummary}
                className="flex-1 py-3 rounded-xl bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {isSendingEmail ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common:states.sending')}</> : <><MailIcon className="w-4 h-4" />{t('consultation.sendEmail', 'Send Email')}</>}
            </button>
            <button onClick={() => setShowEndConsultationModal(false)} className="px-5 py-3 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[14px] font-semibold transition-colors">
                {t('common:buttons.close', 'Close')}
            </button>
            </div>
        </div>
        </div>
    </div>
    )
}

export default EmailSummaryModal;