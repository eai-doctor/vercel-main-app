import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { MicroscopeIcon, ClipboardIcon } from '@/components/icons';
import { labResults, getPatientByPatientId } from '@/services/patientService';

export default function AddLabModal({
    setShowAddLabModal,
    setPatientData,
    patientData
}) {
    const { t } = useTranslation(['clinic', 'common']);
    const [date, setDate] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    const handleClose = () => {
        setShowAddLabModal(false);
        setDate("");
        setContent("");
    };

    const handleAddLabResult = async () => {
        if (!date || !content.trim()) {
            alert(t('clinic:consultation.labRequiredFields', 'Please fill in the date and lab content'));
            return;
        }

        const patientId = patientData?.patient_identification?.patient_id;
        if (!patientId) {
            alert(t('clinic:consultation.patientIdNotFound', 'Patient ID not found. Cannot save lab result.'));
            return;
        }

        try {
            setSaving(true);
            const response = await labResults(patientId, {
                date,
                test_name: content.trim(),
                notes: content.trim(),
                result: "N/A",
            });

            if (response.status === 201) {
                const patientResponse = await getPatientByPatientId(patientId);
                if (patientResponse.status === 200) {
                    setPatientData(patientResponse.data.patient_data);
                }
                handleClose();
            }
        } catch (error) {
            console.error("Error adding lab result:", error);
            alert(t('clinic:consultation.failedAddLab', { message: error.response?.data?.error || error.message, defaultValue: 'Failed to add lab result: {{message}}' }));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <MicroscopeIcon className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">
                            {t('clinic:consultation.addLabResult', 'Add Lab Result')}
                        </h1>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('clinic:consultation.date', 'Date')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                            <ClipboardIcon className="w-4 h-4 text-[#3b82f6]" />
                            <span>{t('clinic:consultation.labContent', 'Lab Results Content')} <span className="text-red-500">*</span></span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={t('clinic:consultation.labContentPlaceholder', 'Enter lab results here, e.g.:\nHemoglobin: 12.5 g/dL\nWBC: 7.2 K/uL\nPlatelets: 250 K/uL')}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                        >
                            {t('common:buttons.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleAddLabResult}
                            disabled={!date || !content.trim() || saving}
                            className={`px-6 py-2 font-semibold rounded-lg shadow-lg transition-all duration-300 transform ${
                                !date || !content.trim() || saving
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-105'
                            }`}
                        >
                            {saving ? t('common:states.saving', 'Saving...') : t('clinic:consultation.addLabResult', 'Add Lab Result')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
