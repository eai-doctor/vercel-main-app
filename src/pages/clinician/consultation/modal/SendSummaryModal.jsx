{/* Send Summary Email Modal */}
import { useState } from "react";
import { useTranslation } from 'react-i18next';

import { endConsultation, uploadReport } from "@/api/consultationApi";
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

import {
  MailIcon,
  XCircleIcon,
  CheckCircleIcon 
} from "@/components/ui/icons";

export default function SendSummaryModal ({
  patientData,
  patientEmail,
  setPatientEmail ,
  aiSummary,
  clinicalReport,
  setAiSummary,
  emailResult,
  setEmailResult,
  modelInfo,
  generateAISummary,
  isGeneratingSummary,
  setShowSendSummaryModal
}){
  const { t } = useTranslation(['clinic', 'common']);
  const [isSendingEmail, setIsSendingEmail] = useState(false);


    const handleSendEmail = async () => {
      
      if (!patientEmail) {
          alert(t('clinic:consultation.enterPatientEmail', 'Please enter patient email address'));
          return;
      }

      if (!aiSummary) {
          alert(t('clinic:consultation.generateOrWriteSummary', 'Please generate or write a consultation summary'));
          return;
      }

      const generatePDF = () => {
        const doc = new jsPDF();
        
        const plainText = clinicalReport
          .replace(/\*\*(.*?)\*\*/g, '$1')  
          .replace(/\*(.*?)\*/g, '$1')       
          .replace(/^#+\s/gm, '')            
          .replace(/^\*\s/gm, '• ');         

        const lines = doc.splitTextToSize(plainText, 170);
        doc.setFontSize(11);
        doc.text(lines, 20, 20);

        return doc.output('blob'); // PDF Blob 반환
      };

      const uploadAndGetSignedUrl = async (pdfBlob) => {

        const patientInfo = patientData.patient_identification;

        const formData = new FormData();
        formData.append('file', pdfBlob, 'clinical_report.pdf');
        formData.append('email_body',aiSummary);
        formData.append('patient_id',patientInfo.patient_id);
        formData.append('patient_name',patientInfo.full_name);
        formData.append('patient_email',"cuu2252@gmail.com");
        // formData.append('patient_email',patientInfo.email);

        const res = await uploadReport(formData);
        console.log(res);

        const { signedUrl, token } = res.data;
        return { signedUrl, token };
      };

      try {
          setIsSendingEmail(true);

          const pdfBlob = generatePDF();
          const { signedUrl } = await uploadAndGetSignedUrl(pdfBlob);
          // const data = await endConsultation(patientEmail, aiSummary, patient_identification, signedUrl);

          setEmailResult(data);
          // console.log("Email sent successfully:", response.data);

      } catch (error) {
          // console.error("Error sending email:", error);
          setEmailResult({
            success: false,
            message: error.response?.data?.error || error.message
          });
      } finally {
          setIsSendingEmail(false);
      }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-linear-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <h1 className="text-2xl font-bold text-white text-center">
                {t('clinic:consultation.sendConsultationSummary', 'Send Consultation Summary')}
              </h1>
              <p className="text-blue-100 text-center text-sm mt-2">
                {t('clinic:consultation.aiPoweredBy', { model: modelInfo?.model || 'Gemini', defaultValue: 'AI-generated summary powered by {{model}}' })}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {!emailResult ? (
                <>
                  {/* Patient Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('clinic:consultation.patientEmailAddress', 'Patient Email Address')}
                    </label>
                    <input
                      type="email"
                      name="patient-email"
                      autoComplete="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder={t('clinic:consultation.emailPlaceholder', 'patient@example.com')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('clinic:consultation.patient', 'Patient')}: {patientData?.patient_identification?.full_name || t('clinic:consultation.unknown', 'Unknown')}
                    </p>
                  </div>

                  {/* AI Summary Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        {t('clinic:consultation.consultationSummaryEditable', 'Consultation Summary (Editable)')}
                      </label>
                      <button
                        onClick={generateAISummary}
                        disabled={isGeneratingSummary}
                        className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                      >
                        {isGeneratingSummary ? t('common:states.generating', '⟳ Generating...') : t('common:buttons.regenerate', '⟳ Regenerate')}
                      </button>
                    </div>

                   {isGeneratingSummary ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-blue-700 font-medium">{t('clinic:consultation.generatingAISummary', 'Generating AI summary...')}</p>
                        <p className="text-blue-600 text-sm mt-1">{t('clinic:consultation.usingModel', { model: modelInfo?.model || 'Ollama gemma3:4b', defaultValue: 'Using {{model}}' })}</p>
                      </div>
                    ) : (
                      <textarea
                        value={aiSummary}
                        onChange={(e) => setAiSummary(e.target.value)}
                        placeholder={t('clinic:consultation.aiSummaryPlaceholder', 'AI summary will appear here. You can edit it before sending.')}
                        rows={12}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t('clinic:consultation.reviewBeforeSending', 'Review and edit the summary above before sending to the patient.')}
                    </p>
                  </div> 

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSendEmail}
                      disabled={isSendingEmail || !patientEmail || !aiSummary}
                      className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition ${isSendingEmail || !patientEmail || !aiSummary
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {isSendingEmail ? (
                        <span className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('clinic:consultation.sendingEmail', 'Sending Email...')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center space-x-2"><MailIcon className="w-5 h-5" /><span>{t('clinic:consultation.sendEmailToPatient', 'Send Email to Patient')}</span></span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowSendSummaryModal(false);
                        setEmailResult(null);
                      }}
                      className="px-6 py-3 rounded-xl text-gray-700 font-semibold bg-gray-200 hover:bg-gray-300 transition"
                    >
                      {t('common:buttons.cancel', 'Cancel')}
                    </button>
                  </div> 
                </>
              ) : (
                <>
                  {/* Email Result Display */}
                  <div className="space-y-4">
                    <div className={`p-5 rounded-lg border ${emailResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                      }`}>
                      <div className="flex items-center space-x-3 mb-2">
                        {emailResult.success ? <CheckCircleIcon className="w-8 h-8 text-green-600" /> : <XCircleIcon className="w-8 h-8 text-red-600" />}
                        <h3 className="text-lg font-semibold">
                          {emailResult.success ? t('clinic:consultation.emailSentSuccess', 'Email Sent Successfully!') : t('clinic:consultation.failedSendEmail', 'Failed to Send Email')}
                        </h3>
                      </div>
                      <p className="text-sm mt-2">
                        {emailResult.message}
                      </p>
                      {emailResult.simulated && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <strong>{t('clinic:consultation.simulationMode', 'Simulation Mode')}:</strong> {t('clinic:consultation.emailSimulationNote', 'Email was logged but not actually sent. To send real emails, configure SMTP settings in backend .env file.')}
                          </p>
                        </div>
                      )}
                      {emailResult.success && (
                        <p className="text-xs text-gray-600 mt-3">
                          {t('clinic:consultation.sentTo', 'Sent to')}: {patientEmail} {t('clinic:consultation.at', 'at')} {new Date(emailResult.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => {
                        setShowSendSummaryModal(false);
                        setEmailResult(null);
                      }}
                      className="px-8 py-3 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 transition"
                    >
                      {t('common:buttons.close', 'Close')}
                    </button>
                  </div> 
                </>
              )}
            </div>
          </div>
        </div>
      )
}
