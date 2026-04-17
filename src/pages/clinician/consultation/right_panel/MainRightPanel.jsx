import { useTranslation } from 'react-i18next';

import {
  DocumentIcon,
  AiIcon,
  StethoscopeIcon,
  ChartIcon,
  ClipboardIcon,
  MicroscopeIcon,
  MicrophoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightbulbIcon,
  AlertIcon
} from "@/components/ui/icons";

export default function MainRightPanel({
  consulting, setConsulting, showSuccess,
  transcriptHistory, interimTranscript, isCaptionAvailable,
  latestSummaryRef, conversationSummary, setConversationSummary,
  soapNote, isLoadingSoap, nbqList, differentials, setShowMcGillModal
}) {
  const { t } = useTranslation(['clinic', 'common']);

  return (
    <>
      {/* Start / Stop Consultation Button */}
      <section className="space-y-3">
        <button
          onClick={() => setConsulting(!consulting)}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2
            ${consulting
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {consulting
            ? <><XCircleIcon className="w-5 h-5" />{t('clinic:consultation.stopConsultation', 'Stop Consultation')}</>
            : <><MicrophoneIcon className="w-5 h-5" />{t('clinic:consultation.startConsultation', 'Start Consultation')}</>}
        </button>

        {showSuccess && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircleIcon className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="text-[15px] font-semibold text-green-700">
                {t('clinic:consultation.processingComplete', 'Processing Complete!')}
              </p>
              <p className="text-[13px] text-green-600">
                {t('clinic:consultation.transcriptUpdated', 'Transcript updated successfully')}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Live Transcription */}
      {(consulting || transcriptHistory) && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-[18px] border-b border-slate-100 bg-amber-50">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${consulting ? 'bg-amber-500 animate-pulse' : 'bg-amber-300'}`} />
            <div className="w-[38px] h-[38px] rounded-[10px] bg-amber-100 flex items-center justify-center shrink-0">
              <MicrophoneIcon className="w-[18px] h-[18px] text-amber-600" />
            </div>
            <h2 className="text-[17px] font-semibold text-slate-800">
              {consulting
                ? t('clinic:consultation.liveTranscription', 'Live Transcription')
                : t('clinic:consultation.transcription', 'Transcription')}
            </h2>
          </div>
          <div className="p-4 max-h-48 overflow-y-auto">
            <p className="text-[14px] text-slate-400 italic text-center py-2">
                {t('clinic:consultation.audioRecording', 'We are listening ...')}
              </p>
            {/* {!isCaptionAvailable ? (
              <p className="text-[14px] text-slate-400 italic text-center py-2">
                {t('clinic:consultation.audioRecording', 'We are listening ...')}
              </p>
            ) : (transcriptHistory || interimTranscript) ? (
              <div className="text-[14px] whitespace-pre-wrap leading-relaxed text-slate-800 bg-amber-50 p-3 rounded-xl border border-amber-100">
                {transcriptHistory}
                {interimTranscript && (
                  <span className="text-slate-400 italic">
                    {transcriptHistory ? ' ' : ''}{interimTranscript}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[14px] text-slate-400 italic text-center py-2">
                {t('clinic:consultation.listeningSpeakHere', 'Listening... speak to see transcription here')}
              </p>
            )} */}
          </div>
        </section>
      )}

      {/* Next Best Questions */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <LightbulbIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
          </div>
          <h2 className="text-[17px] font-semibold text-slate-800">
            {nbqList.length > 0
              ? t('clinic:consultation.nextBestQuestions', 'Next Best Questions')
              : t('clinic:consultation.aiQuestionList', 'AI Generated Question List')}
          </h2>
          {nbqList.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {nbqList.length}
            </span>
          )}
        </div>
        <div className="p-3">
          {nbqList.length === 0 ? (
            <p className="text-[14px] text-slate-400 italic px-2.5 py-3">
              {t('clinic:consultation.aiQuestionsWillAppear', 'AI-generated follow-up questions will appear here once available.')}
            </p>
          ) : (
            <div className="space-y-1.5">
              {nbqList
                .sort((a, b) => b.info_gain - a.info_gain)
                .map(q => (
                  <div
                    key={q.id}
                    className={`flex items-start gap-2.5 px-3 py-3 rounded-xl text-[14px] transition-colors
                      ${q.red_flag
                        ? 'bg-red-50 border border-red-200'
                        : 'hover:bg-[#f8faff] border border-transparent'}`}
                  >
                    {q.red_flag && <AlertIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                    <span className={`${q.red_flag ? 'font-semibold text-red-800' : 'text-slate-800'}`}>
                      {q.text}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Differential Diagnoses */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <MicroscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
          </div>
          <h2 className="text-[17px] font-semibold text-slate-800">
            {differentials.length > 0
              ? t('clinic:consultation.differentialDiagnoses', 'Differential Diagnoses')
              : t('clinic:consultation.topDiagnoses', 'Top Diagnoses')}
          </h2>
          {differentials.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {differentials.length}
            </span>
          )}
        </div>
        <div className="p-3">
          {differentials.length === 0 ? (
            <p className="text-[14px] text-slate-400 italic px-2.5 py-3">
              {t('clinic:consultation.rankedDiagnosesWillAppear', 'Ranked diagnoses will be displayed here when AI insights are ready.')}
            </p>
          ) : (
            <div>
              {differentials.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-2.5 py-3 rounded-xl hover:bg-[#f8faff] transition-colors [&+&]:border-t [&+&]:border-slate-100"
                >
                  {/* Rank */}
                  <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#2C3B8D] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-slate-900">{d.name}</p>
                    <p className="text-[12px] text-slate-400 font-mono">ICD-10: {d.icd10}</p>
                  </div>
                  {/* Probability bar */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2C3B8D] rounded-full"
                        style={{ width: `${(d.prob * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <span className="text-[15px] font-bold text-[#2C3B8D] min-w-[42px] text-right">
                      {(d.prob * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SOAP Note */}
      {(soapNote.subjective || soapNote.objective || soapNote.assessment || soapNote.plan || isLoadingSoap) && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <StethoscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
            </div>
            <h2 className="text-[17px] font-semibold text-slate-800">
              {t('clinic:consultation.soapNoteTitle', 'SOAP Note')}
            </h2>
            {isLoadingSoap && (
              <span className="ml-auto text-[12px] text-slate-400 animate-pulse">
                {t('common:states.generating', 'Generating...')}
              </span>
            )}
          </div>
          <div className="p-3 space-y-1.5">
            {[
              { key: 'subjective',  label: t('clinic:consultation.subjective',  'Subjective'),  letter: 'S', color: 'bg-blue-600' },
              { key: 'objective',   label: t('clinic:consultation.objective',   'Objective'),   letter: 'O', color: 'bg-emerald-600' },
              { key: 'assessment',  label: t('clinic:consultation.assessment',  'Assessment'),  letter: 'A', color: 'bg-violet-600' },
              { key: 'plan',        label: t('clinic:consultation.plan',        'Plan'),        letter: 'P', color: 'bg-amber-600' },
            ].map(({ key, label, letter, color }) => (
              <div key={key} className="px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`${color} text-white w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0`}>
                    {letter}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                </div>
                <p className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap pl-7">
                  {isLoadingSoap
                    ? <span className="text-slate-400 italic">{t(`clinic:consultation.generating${label}`, `Generating ${label.toLowerCase()} section...`)}</span>
                    : soapNote[key] || <span className="text-slate-400 italic">{t(`clinic:consultation.no${label}Data`, `No ${label.toLowerCase()} data available`)}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* McGill Prediction Model */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <ChartIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
          </div>
          <h2 className="text-[17px] font-semibold text-slate-800">
            {t('clinic:consultation.mcGillPredictionModel', 'McGill Prediction Model')}
          </h2>
        </div>
        <div className="p-5">
          <p className="text-[14px] text-slate-500 mb-4">
            {t('clinic:consultation.mcGillDescription', 'Generate statistical predictions based on the McGill prediction model.')}
          </p>
          <button
            onClick={() => setShowMcGillModal(true)}
            className="cursor-pointer text-white w-full bg-[#233070] hover:bg-[#2f3f91] font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ChartIcon className="w-5 h-5" />
            <span>{t('clinic:consultation.predictionFromStatistics', 'Prediction from Statistics')}</span>
          </button>
        </div>
      </section>
    </>
  );
}
