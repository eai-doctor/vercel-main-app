import {
  AiIcon, MicrophoneIcon, ClipboardIcon, LightbulbIcon,
  MailIcon, CheckCircleIcon, XCircleIcon, ClockIcon, UserIcon
} from '@/components/ui/icons';

function ChatSummaryModal({ setShowChatSummaryModal, setSaveSummaryResult, chatSummary, saveSummaryResult, handleSaveSummary, isSavingSummary }) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ModalHeader 
                title={t('chat.chatSummary', 'Chat Summary')} 
                subtitle={t('chat.aiGeneratedSummary', 'AI-generated summary')} 
                badge={summaryModelUsed || undefined} 
                onClose={() => { setShowChatSummaryModal(false); setSaveSummaryResult(null); }} />
            <div className="p-5 space-y-4">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="text-[14px] text-slate-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-slate-800 prose-strong:text-slate-800 prose-ul:my-1 prose-li:my-0.5 prose-p:my-1.5">
                    <ReactMarkdown>{chatSummary}</ReactMarkdown>
                </div>
                </div>
                {saveSummaryResult && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[13px] font-semibold ${saveSummaryResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {saveSummaryResult.success ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
                    {saveSummaryResult.message}
                </div>
                )}
                <div className="flex gap-3 pt-2">
                <button onClick={handleSaveSummary} disabled={isSavingSummary || saveSummaryResult?.success}
                    className="flex-1 py-3 rounded-xl bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSavingSummary ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('common:states.saving')}</> : saveSummaryResult?.success ? <><CheckCircleIcon className="w-4 h-4" />{t('common:states.saved')}</> : <><ClipboardIcon className="w-4 h-4" />{t('chat.saveToMyRecords', 'Save to My Records')}</>}
                </button>
                <button onClick={() => { setShowChatSummaryModal(false); setSaveSummaryResult(null); }} className="px-5 py-3 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[14px] font-semibold transition-colors">
                    {t('common:buttons.close', 'Close')}
                </button>
                </div>
            </div>
            </div>
        </div>
    )
}

export default ChatSummaryModal;