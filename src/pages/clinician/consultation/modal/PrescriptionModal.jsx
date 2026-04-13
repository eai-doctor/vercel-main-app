import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from "react-markdown";
import { marked } from "marked";

import { PillIcon, ClipboardIcon, DocumentIcon, WarningIcon, ClockIcon, UploadIcon } from "@/components/ui/icons";
import { updatePrescription } from '@/api/consultationApi';

export default function PrescriptionModal({ prescription, prescriptionId, onClose, isGenerating, patientInfo }) {
  const { t } = useTranslation(['clinic', 'common']);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrescription, setEditedPrescription] = useState(prescription);

  // Update edited prescription when new prescription is generated
  React.useEffect(() => {
    setEditedPrescription(prescription);
  }, [prescription]);

  const handlePrint = () => {

    const printWindow = window.open('', '', 'height=800,width=900');
    const htmlContent = marked.parse(editedPrescription);

    printWindow.document.write(`
      <html>
      <head>
        <title>${t('prescriptions.prescription')}</title>

        <style>

          body{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background:#f8fafc;
            padding:40px;
          }

          .card{
            max-width:800px;
            margin:auto;
            background:white;
            border-radius:16px;
            box-shadow:0 10px 30px rgba(0,0,0,0.1);
            overflow:hidden;
          }

          .header{
            background:linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb);
            color:white;
            padding:30px;
          }

          .title{
            font-size:32px;
            font-weight:700;
          }

          .section{
            padding:30px;
            border-bottom:1px solid #eee;
          }

          .section h2{
            font-size:18px;
            margin-bottom:15px;
            color:#2563eb;
          }

          .grid{
            display:grid;
            grid-template-columns:150px 1fr;
            row-gap:8px;
          }

          .label{
            font-weight:600;
            color:#64748b;
          }

          .value{
            color:#111827;
          }

          .med-box{
            background:#f1f5f9;
            padding:16px;
            border-radius:10px;
            margin-top:10px;
          }

          .notes{
            background:#fff7ed;
            border-left:4px solid #f97316;
            padding:14px;
            border-radius:6px;
            margin-top:10px;
          }

          .signature{
            padding:30px;
            font-style:italic;
          }

          @media print{
            body{
              background:white;
              padding:0;
            }

            .card{
              box-shadow:none;
            }
          }

        </style>
      </head>

      <body>

      <div class="card">

        <div class="header">
          <div class="title">Medical Prescription</div>
        </div>

        <div class="section">
          <h2>Prescription Draft</h2>
          <div class="markdown-body">
            ${htmlContent}
          </div>
        </div>

      </div>

      </body>
      </html>
      `);

    printWindow.document.close();
    printWindow.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPrescription);
      alert(t('prescriptions.copiedToClipboard'));
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([editedPrescription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data = await updatePrescription(patientInfo.patient_identification.patient_id, prescriptionId, editedPrescription);

      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          window.alert(t('common:states.successfullyUpdated'));
        }, 3000);
      }
    } catch (error) {
      // console.error('Failed to save prescription:', error);
      // console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || t('common:errors.unknown');
      alert(t('prescriptions.saveFailed', { error: errorMessage }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedPrescription(prescription); // Reset to original
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // The edited prescription is already in state, so just close edit mode
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <PillIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('prescriptions.prescription')}</h2>
                <p className="text-white/70 text-sm">
                  {isEditing ? t('prescriptions.editingPrescription') : t('prescriptions.aiGenerated')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full mb-4"></div>
              <div className="text-xl font-semibold text-[#475569] mb-2">{t('prescriptions.generating')}</div>
              <div className="text-sm text-[#475569]">{t('prescriptions.analyzingData')}</div>
              <div className="mt-4 flex space-x-2">
                <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-[#3b82f6] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          ) : isEditing ? (
            <div className="bg-[#f8fafc] rounded-xl border-2 border-[rgba(59,130,246,0.4)] overflow-hidden">
              <textarea
                value={editedPrescription}
                onChange={(e) => setEditedPrescription(e.target.value)}
                className="w-full h-96 p-6 font-mono text-sm text-[#1e293b] leading-relaxed resize-none focus:outline-none focus:border-[#3b82f6] bg-white"
                placeholder={t('prescriptions.editPlaceholder')}
              />
            </div>
          ) : (
            <div className="bg-[#f8fafc] rounded-xl p-6 border-2 border-[rgba(15,23,42,0.1)]">
              <pre className="whitespace-pre-wrap font-mono text-sm text-[#1e293b] leading-relaxed">
                <ReactMarkdown>
                  {editedPrescription}
                </ReactMarkdown>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && prescription && (
          <div className="bg-[#f8fafc] border-t border-[rgba(15,23,42,0.1)] p-6">
            {saveSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                <span>✓</span>
                <span className="font-semibold">{t('prescriptions.savedSuccessfully')}</span>
              </div>
            )}

            {/* Edit Mode Buttons */}
            {isEditing ? (
              <div className="flex gap-3 justify-end mb-4 pb-4 border-b border-[rgba(15,23,42,0.1)]">
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <span>✓</span>
                  <span>{t('common:buttons.saveChanges')}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 bg-[#475569] text-white rounded-lg hover:opacity-90 transition-all font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <span>✕</span>
                  <span>{t('common:buttons.cancel')}</span>
                </button>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-semibold flex items-center space-x-2 shadow-lg"
                >
                  <DocumentIcon className="w-5 h-5" />
                  <span>{t('common:buttons.edit')}</span>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || isEditing}
                className={`px-6 py-3 ${isSaving || isEditing ? 'bg-[rgba(59,130,246,0.5)]' : 'bg-[#3b82f6] hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'} text-white rounded-lg transition-all font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaving ? <ClockIcon className="w-5 h-5" /> : <UploadIcon className="w-5 h-5" />}
                <span>{isSaving ? t('common:states.saving') : t('prescriptions.saveToDatabase')}</span>
              </button>
              <button
                onClick={handleCopy}
                disabled={isEditing}
                className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-all font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClipboardIcon className="w-5 h-5" />
                <span>{t('common:buttons.copy')}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={isEditing}
                className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-all font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UploadIcon className="w-5 h-5" />
                <span>{t('common:buttons.download')}</span>
              </button>
              <button
                onClick={handlePrint}
                disabled={isEditing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentIcon className="w-5 h-5" />
                <span>{t('common:buttons.print')}</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#475569] text-white rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg"
              >
                {t('common:buttons.close')}
              </button>
            </div>
            <div className="mt-4 text-xs text-[#64748b] text-center">
              <span className="inline-flex items-center"><WarningIcon className="w-4 h-4 text-[#64748b] mr-1 inline" /></span> {t('prescriptions.disclaimer')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}