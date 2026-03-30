import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import ProfileDropdown from "./components/ProfileDropdown";
import { PillIcon } from "./components/icons";

function PrescriptionList() {
  const { t } = useTranslation(['clinic', 'common']);
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/prescriptions', {
        withCredentials: true
      });
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(t('prescriptions.confirmDelete'))) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5001/api/prescriptions/${filename}`, {
        withCredentials: true
      });
      fetchPrescriptions(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete prescription:', error);
      alert(t('prescriptions.deleteFailed'));
    }
  };

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const handlePrint = (prescription) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`<html><head><title>${t('prescriptions.prescription')}</title>`);
    printWindow.document.write('<style>');
    printWindow.document.write('body { font-family: monospace; padding: 20px; white-space: pre-wrap; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(prescription.prescription);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-[20px] shadow-sm border-b border-[rgba(15,23,42,0.1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gradient">
                {t('prescriptions.title')}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{t('prescriptions.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569] rounded-lg hover:border-[rgba(59,130,246,0.4)] transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>{t('common:buttons.backToHome')}</span>
              </button>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-12 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-[#475569]">{t('prescriptions.loading')}</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-12 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-[rgba(59,130,246,0.08)] rounded-full flex items-center justify-center mx-auto shadow-lg">
                <PillIcon className="w-16 h-16 text-[#3b82f6]" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-[#1e293b] mb-4">
              {t('prescriptions.noPrescriptions')}
            </h2>
            <p className="text-[#475569] max-w-2xl mx-auto text-lg">
              {t('prescriptions.noPrescriptionsDescription')}
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 font-semibold"
              >
                {t('common:buttons.returnToHome')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.3)]"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-12 h-12 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                          <PillIcon className="w-7 h-7 text-[#3b82f6]" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#1e293b]">
                            {prescription.patient_info?.full_name || t('common:labels.unknownPatient')}
                          </h3>
                          <p className="text-sm text-[#475569]">
                            {prescription.date || t('common:labels.noDate')}
                          </p>
                        </div>
                      </div>
                      {prescription.patient_info?.mrn && (
                        <p className="text-sm text-[#475569] ml-15">
                          {t('common:labels.mrn')}: {prescription.patient_info.mrn}
                        </p>
                      )}
                      {prescription.patient_info?.date_of_birth && (
                        <p className="text-sm text-[#475569] ml-15">
                          {t('common:labels.dob')}: {prescription.patient_info.date_of_birth}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleView(prescription)}
                        className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-colors font-semibold text-sm"
                      >
                        {t('common:buttons.view')}
                      </button>
                      <button
                        onClick={() => handlePrint(prescription)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                      >
                        {t('common:buttons.print')}
                      </button>
                      <button
                        onClick={() => handleDelete(prescription.filename)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                      >
                        {t('common:buttons.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* View Prescription Modal */}
      {showModal && selectedPrescription && (
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
                      {selectedPrescription.patient_info?.full_name || t('common:labels.unknownPatient')} - {selectedPrescription.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-[#f8fafc] rounded-xl p-6 border-2 border-[rgba(15,23,42,0.1)]">
                <pre className="whitespace-pre-wrap font-mono text-sm text-[#1e293b] leading-relaxed">
                  {selectedPrescription.prescription}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f8fafc] border-t border-[rgba(15,23,42,0.1)] p-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-[#475569] text-white rounded-lg hover:opacity-90 transition-all font-semibold"
                >
                  {t('common:buttons.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionList;