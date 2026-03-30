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
} from "@/components/icons";


export default function MainRightPanel({
    patientData,
    consulting,
    setConsulting,
    transcriptHistory,
    interimTranscript,
    latestSummaryRef,
    conversationSummary,
    setConversationSummary,
    snapshot,
    setSnapshot,
    soapNote,
    isLoadingSoap,
    nbqList,
    differentials,
    showSuccess,
    setShowMcGillModal
}){
    const { t } = useTranslation(['clinic', 'common']);
    

    return (
    <>
        {/* AI Assistant Controls (moved to bottom) */}
        <section className="space-y-4">
        <button
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 ${consulting
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            }`} /* Keep green/red for start/stop */
            onClick={() => setConsulting(!consulting)}
        >
            <span className="flex items-center justify-center space-x-2">{consulting ? <><XCircleIcon className="w-5 h-5" /><span>{t('clinic:consultation.stopConsultation', 'Stop Consultation')}</span></> : <><MicrophoneIcon className="w-5 h-5" /><span>{t('clinic:consultation.startConsultation', 'Start Consultation')}</span></>}</span>
        </button>

        {showSuccess && (
            <div className="p-4 bg-green-50 border-2 border-green-400 rounded-xl shadow-lg">
            <div className="flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <div className="text-lg font-semibold text-green-700">
                {t('clinic:consultation.processingComplete', 'Processing Complete!')}
                </div>
            </div>
            <div className="text-center text-sm text-green-600 mt-2">
                {t('clinic:consultation.transcriptUpdated', 'Transcript updated successfully')}
            </div>
            </div>
        )}
        </section>


        {/* Live Transcription Caption Box - Stays visible after stopping */}
        {(consulting || transcriptHistory) && (
        <section className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-yellow-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 px-4 py-2 flex items-center space-x-2">
            {consulting ? (
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            ) : (
                <div className="w-3 h-3 bg-white/60 rounded-full"></div>
            )}
            <span className="text-white font-semibold text-sm">
                {consulting ? t('clinic:consultation.liveTranscription', 'Listening...') : t('clinic:consultation.transcription', 'Transcription')}
            </span>
            </div>
            <div className="p-4 max-h-48 overflow-y-auto">
            {(transcriptHistory || interimTranscript) ? (
                <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#1e293b] bg-white/70 backdrop-blur-sm p-3 rounded-xl border border-yellow-100">
                {transcriptHistory}
                {interimTranscript && (
                    <span className="text-[#64748b] italic">
                    {transcriptHistory ? " " : ""}{interimTranscript}
                    </span>
                )}
                </div>
            ) : (
                <div className="text-sm text-gray-400 italic text-center py-2">
                {t('clinic:consultation.listeningSpeakHere', 'Listening... speak to see transcription here')}
                </div>
            )}
            </div>
        </section>
        )}

        {/* Manual trigger buttons for AI Summary and Conversation History */}
        <div className="flex gap-3">
        <button
            onClick={() => {
            setConversationSummary(latestSummaryRef.current);
            }}
            disabled={!latestSummaryRef.current}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100 btn-glow"
        >
            <span className="flex items-center justify-center space-x-1"><ClipboardIcon className="w-4 h-4" /><span>{t('clinic:consultation.generateAISummary', 'Generate AI Summary')}</span></span>
        </button>
        </div>

        {/* 1. Next Best Questions */}
        {nbqList.length > 0 ? (
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-5 border border-[rgba(15,23,42,0.1)]">
            <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <LightbulbIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.nextBestQuestions', 'Next Best Questions')}</h2>
            </div>
            <div className="space-y-3">
            {nbqList
                .sort((a, b) => b.info_gain - a.info_gain)
                .map((q) => (
                <div
                    key={q.id}
                    className={`p-3 rounded-xl text-sm shadow-md transition-all hover:shadow-lg ${q.red_flag
                    ? "border-2 border-red-500 bg-red-50 font-semibold"
                    : "border border-[rgba(15,23,42,0.1)] bg-white"
                    }`}
                >
                    {q.red_flag && <AlertIcon className="w-5 h-5 text-red-600 inline mr-2" />}
                    {q.text}
                </div>
                ))}
            </div>
        </section>
        ) : (
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-5 border border-[rgba(15,23,42,0.1)]">
            <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <AiIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.aiQuestionList', 'AI Generated Question List')}</h2>
            </div>
            <p className="text-sm text-[#64748b] italic">
            {t('clinic:consultation.aiQuestionsWillAppear', 'AI-generated follow-up questions will appear here once available.')}
            </p>
        </section>
        )}

        {/* 2. Differential Diagnoses */}
        {differentials.length > 0 ? (
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-5 border border-[rgba(15,23,42,0.1)]">
            <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <MicroscopeIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.differentialDiagnoses', 'Differential Diagnoses')}</h2>
            </div>
            <div className="space-y-3">
            {differentials.map((d, i) => (
                <div
                key={i}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-[rgba(15,23,42,0.1)] shadow-sm hover:shadow-md transition-all"
                >
                <div className="flex-1">
                    <div className="font-semibold text-[#1e293b] text-sm">{d.name}</div>
                    <div className="text-xs text-[#475569]">ICD-10: {d.icd10}</div>
                </div>
                <div className="ml-4">
                    <div className="text-xl font-bold text-[#3b82f6]">
                    {(d.prob * 100).toFixed(1)}%
                    </div>
                </div>
                </div>
            ))}
            </div>
        </section>
        ) : (
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-5 border border-[rgba(15,23,42,0.1)]">
            <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                <ChartIcon className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b]">{t('clinic:consultation.topDiagnoses', 'Top Diagnoses')}</h2>
            </div>
            <p className="text-sm text-[#64748b] italic">
            {t('clinic:consultation.rankedDiagnosesWillAppear', 'Ranked diagnoses will be displayed here when AI insights are ready.')}
            </p>
        </section>
        )}

        {/* Live transcription moved to right panel as stable caption box */}

        {conversationSummary && (
        <div className="bg-[rgba(59,130,246,0.08)] rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(59,130,246,0.2)] overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
            <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] px-4 py-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <ClipboardIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">{t('clinic:consultation.aiSummary', 'AI Summary')}</span>
            </div>
            <div className="p-5">
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#1e293b] bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-[rgba(59,130,246,0.2)] shadow-inner">
                {conversationSummary}
            </div>
            </div>
        </div>
        )}

        {snapshot && (
        <div className="bg-[rgba(59,130,246,0.08)] rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(59,130,246,0.2)] overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
            <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] px-4 py-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <DocumentIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">{t('clinic:consultation.conversationHistory', 'Conversation History')}</span>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto custom-scrollbar">
            <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#1e293b] bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-[rgba(59,130,246,0.2)] shadow-inner">
                {snapshot}
            </div>
            </div>
        </div>
        )}

        {/* SOAP Note Section */}
        {(soapNote.subjective || soapNote.objective || soapNote.assessment || soapNote.plan || isLoadingSoap) && (
        <div className="bg-green-50 rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-green-200/50 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 py-3 flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <StethoscopeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">{t('clinic:consultation.soapNoteTitle', 'SOAP Note (Insights from the past)')}</span>
            {isLoadingSoap && (
                <span className="ml-auto text-white text-sm animate-pulse">{t('common:states.generating', 'Generating...')}</span>
            )}
            </div>
            <div className="p-5 space-y-4">
            {/* Subjective */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-100 shadow-inner">
                <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center space-x-2">
                <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">S</span>
                <span>{t('clinic:consultation.subjective', 'Subjective')}</span>
                </h3>
                <p className="text-sm text-[#1e293b] leading-relaxed whitespace-pre-wrap">
                {isLoadingSoap ? (
                    <span className="text-gray-400 italic">{t('clinic:consultation.generatingSubjective', 'Generating subjective section...')}</span>
                ) : (
                    soapNote.subjective || t('clinic:consultation.noSubjectiveData', 'No subjective data available')
                )}
                </p>
            </div>

            {/* Objective */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 shadow-inner">
                <h3 className="text-sm font-bold text-emerald-700 mb-2 flex items-center space-x-2">
                <span className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">O</span>
                <span>{t('clinic:consultation.objective', 'Objective')}</span>
                </h3>
                <p className="text-sm text-[#1e293b] leading-relaxed whitespace-pre-wrap">
                {isLoadingSoap ? (
                    <span className="text-gray-400 italic">{t('clinic:consultation.generatingObjective', 'Generating objective section...')}</span>
                ) : (
                    soapNote.objective || t('clinic:consultation.noObjectiveData', 'No objective data available')
                )}
                </p>
            </div>

            {/* Assessment */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-teal-100 shadow-inner">
                <h3 className="text-sm font-bold text-teal-700 mb-2 flex items-center space-x-2">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                <span>{t('clinic:consultation.assessment', 'Assessment')}</span>
                </h3>
                <p className="text-sm text-[#1e293b] leading-relaxed whitespace-pre-wrap">
                {isLoadingSoap ? (
                    <span className="text-gray-400 italic">{t('clinic:consultation.generatingAssessment', 'Generating assessment section...')}</span>
                ) : (
                    soapNote.assessment || t('clinic:consultation.noAssessmentData', 'No assessment data available')
                )}
                </p>
            </div>

            {/* Plan */}
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-cyan-100 shadow-inner">
                <h3 className="text-sm font-bold text-cyan-700 mb-2 flex items-center space-x-2">
                <span className="bg-cyan-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">P</span>
                <span>{t('clinic:consultation.plan', 'Plan')}</span>
                </h3>
                <p className="text-sm text-[#1e293b] leading-relaxed whitespace-pre-wrap">
                {isLoadingSoap ? (
                    <span className="text-gray-400 italic">{t('clinic:consultation.generatingPlan', 'Generating plan section...')}</span>
                ) : (
                    soapNote.plan || t('clinic:consultation.noPlanData', 'No plan data available')
                )}
                </p>
            </div>
            </div>
        </div>
        )}

        {/* McGill Prediction Model Section */}
        {/*<div className="bg-[rgba(59,130,246,0.08)] rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] border border-[rgba(59,130,246,0.2)] overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
            <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] px-4 py-3 flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <ChartIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">{t('clinic:consultation.mcGillPredictionModel', 'McGill Prediction Model')}</span>
            </div>
            <div className="p-5">
                <p className="text-sm text-[#475569] mb-4">
                {t('clinic:consultation.mcGillDescription', 'Generate statistical predictions based on the McGill prediction model.')}
                </p>
                <button
                onClick={() => setShowMcGillModal(true)}
                className="w-full bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] btn-glow flex items-center justify-center space-x-2"
                >
                <ChartIcon className="w-5 h-5" />
                <span>{t('clinic:consultation.predictionFromStatistics', 'Prediction from Statistics')}</span>
                </button>
            </div>
        </div>*/}

    </>
    )
}