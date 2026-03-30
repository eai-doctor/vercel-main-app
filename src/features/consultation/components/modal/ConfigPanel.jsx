import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  DocumentIcon,
  UploadIcon,
  PlusCircleIcon,
  ClockIcon,
} from "@/components/icons";
import { updatePreferences } from "@/services/consultationService";

const REPORT_KEYS = ["diagnostic", "treatment", "nursing"];
const PRACTICE_KEYS = ["evidence", "patient", "integrated"];

const getButtonStyle = (active) =>
  `px-4 py-1 rounded-full text-sm font-medium border ${
    active
      ? "bg-[#3b82f6] text-white"
      : "bg-[#f8fafc] text-[#475569] border-[rgba(15,23,42,0.1)]"
  }`;

const handleFocusAreaClick = (area) => {
  setFocusAreas((prev) =>
    prev.includes(area)
      ? prev.filter((item) => item !== area)
      : [...prev, area]
  );
};

export default function ConfigPanel({
    visitType,
    setVisitType,
    language,
    setLanguage,
    patientData,
    setPatientData,
    setShowConfigPanel,
    setModelInfo
}){
    const { t } = useTranslation(['clinic', 'common']);

    const [isLoadingPatientData, setIsLoadingPatientData] = useState(false);
    const [diagnosisOptions, setDiagnosisOptions] = useState([]);
    const [uploadedPDF, setUploadedPDF] = useState(null);
    const [pdfFileName, setPdfFileName] = useState("");
    const [focusAreas, setFocusAreas] = useState([]);

    const [reportComponents, setReportComponents] = useState({
        diagnostic: false,
        treatment: false,
        nursing: false,
    });
    const [practiceApproach, setPracticeApproach] = useState({
        evidence: false,
        patient: false,
        integrated: false,
    });

    const preferences = patientData?.patient_identification?.preferences;

    const languagePreset = preferences?.language.toLowerCase() ?? null;
    const practicePreset = preferences?.practice_approach.toLowerCase() ?? null;
    const reportPreset = preferences?.report_components.toLowerCase() ?? null;

    useEffect(() => {

        console.log(reportPreset.toLowerCase(), practicePreset.toLowerCase());
        if (!preferences) return;

        setReportComponents({
            diagnostic: reportPreset.includes("diagnostic"),
            treatment: reportPreset.includes("treatment"),
            nursing: reportPreset.includes("nursing"),
        });

        setPracticeApproach({
            evidence: practicePreset.includes("evidence"),
            patient: practicePreset.includes("patient"),
            integrated: practicePreset.includes("integrated"),
        });

        setLanguage(languagePreset);

    }, [preferences]);

    const configPdfInputRef = useRef(null);

    // Configuration panel functions
    const toggleComponent = (key) => {
        setReportComponents((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleApproach = (key) => {
        setPracticeApproach((prev) => ({ ...prev, [key]: !prev[key] }));
    };
      
    // Fetch diagnosis when PDF is uploaded in config panel
    useEffect(() => {
    const fetchDiagnosis = async () => {
        if (!uploadedPDF || visitType !== "upload") return;

        try {
        const formData = new FormData();
        formData.append("pdf", uploadedPDF);

        const res = await axios.post(
            `${API_URL}/api/extract-diagnosis-from-upload`,
            formData,
            {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            }
        );

        const data = res.data;
        if (data && Array.isArray(data.diagnosis)) {
            const names = data.diagnosis
            .filter((d) => typeof d.name === "string" && d.name.trim() !== "")
            .map((d) => d.name);
            setDiagnosisOptions(names);
        }
        } catch (err) {
        console.error("Error fetching diagnosis data:", err);
        }
    };

    fetchDiagnosis();
    }, [uploadedPDF, visitType]);

    const handlePDFUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
        alert(t('common:errors.uploadPdfOnly', 'Please upload a PDF file'));
        return;
        }

        if (file.size > 50 * 1024 * 1024) {
        alert(t('common:errors.fileSizeLimit', 'File size must be less than 50MB'));
        return;
        }

        setUploadedPDF(file);
        setPdfFileName(file.name);
        console.log(`PDF uploaded: ${file.name}, size: ${file.size} bytes`);
    };

    const handleConfigSubmit = async () => {
        const submissionData = {
            language,
            focusAreas,
            reportComponents,
            practiceApproach,
        };

        try {
        setIsLoadingPatientData(true);

        let newPatientData = null;

        if (visitType === "upload" && uploadedPDF) {
            // console.log("Uploading and processing PDF...");
            const formData = new FormData();
            formData.append("pdf", uploadedPDF);
            formData.append("ui_settings", JSON.stringify(submissionData));

            const response = await axios.post(
            `${API_URL}/api/extract-patient-data-from-upload`,
            formData,
            {
                headers: {
                "Content-Type": "multipart/form-data",
                },
            }
            );

            // console.log("Patient data received:", response.data);
            newPatientData = response.data;

            // Extract and store model info
            if (response.data._model_info) {
                setModelInfo(response.data._model_info);
                console.log("Model used for patient data extraction:", response.data._model_info);
            }
        } else if (visitType === "first-time") {
            console.log("Starting with empty patient data (first-time visit)");
            newPatientData = {
            patient_identification: {
                mrn: "",
                full_name: "",
                date_of_birth: "",
                gender: "",
            },
            diagnoses: [],
            medications: [],
            vital_signs: [],
            labs: [],
            imaging: [],
            consultations: [],
            admissions: [],
            };
        } else {
            alert(t('clinic:consultation.selectVisitType', 'Please select visit type and upload PDF if applicable'));
            setIsLoadingPatientData(false);
            return;
        }

        setPatientData(newPatientData);
        setShowConfigPanel(false); // Hide config panel after loading
        setIsLoadingPatientData(false);
        } catch (error) {
        console.error("Error processing patient data:", error);
        alert(t('clinic:consultation.failedLoadPatient', { message: error.message, defaultValue: 'Failed to load patient data: {{message}}' }));
        setIsLoadingPatientData(false);
        }
    };

    const handleConfigUpdate = async () => {
        const reportKey = Object.keys(reportComponents)
        .find(key => reportComponents[key]);

        const practiceKey = Object.keys(practiceApproach)
        .find(key => practiceApproach[key]);

        const data = await updatePreferences(patientData?.patient_identification?.patient_id,language,reportKey, practiceKey);
        console.log(data);
        if(data){ 
            setPatientData(prev => ({
                            ...prev,
                            patient_identification: {
                            ...prev.patient_identification,
                            preferences: {
                                language : language,
                                report_components : reportKey,
                                practice_approach : practiceKey
                            }
                        }
                        }));
            alert(t('common:states.successfullyUpdated', 'Successfully Updated!'))
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 z-20 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] p-6 rounded-t-xl">
                    <h1 className="text-3xl font-bold text-white text-center">
                    {t('clinic:consultation.configTitle', 'Consultation Configuration')}
                    </h1>
                    <p className="text-blue-100 text-center text-sm mt-2">
                    {t('clinic:consultation.configSubtitle', 'Configure your consultation settings to get started')}
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    {/* 260310 Blocked by saebyeok since nothing happens with this implementation */}
                    {/* Visit Type Selection */}
                    {/* <div className="space-y-4 bg-[rgba(59,130,246,0.08)] p-6 rounded-xl border-2 border-[rgba(59,130,246,0.2)]">
                        <h2 className="text-xl font-semibold text-[#475569]">{t('clinic:consultation.visitType', 'Visit Type')}</h2>
                        <p className="text-sm text-[#475569] italic">
                            {t('clinic:consultation.visitTypeDesc', "Choose whether you have a patient's past medical records or this is a first-time visit")}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                            onClick={() => {
                                setVisitType("upload");
                                setDiagnosisOptions([]);
                            }}
                            className={`px-6 py-4 rounded-lg font-medium border-2 transition-all ${visitType === "upload"
                                ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-lg"
                                : "bg-white text-[#475569] border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <DocumentIcon className="w-6 h-6 text-[#3b82f6]" />
                                        <div className="text-left">
                                            <div className="font-bold">{t('clinic:consultation.uploadMedicalRecords', 'Upload Past Medical Records')}</div>
                                            <div className="text-xs opacity-80">{t('clinic:consultation.uploadProgressNote', "Upload patient's progress note PDF")}</div>
                                        </div>
                                    </div>
                                    {visitType === "upload" && <span className="text-xl">✓</span>}
                                </div>
                            </button>

                            <button
                            onClick={() => {
                                setVisitType("first-time");
                                setUploadedPDF(null);
                                setPdfFileName("");
                                setDiagnosisOptions([]);
                            }}
                            className={`px-6 py-4 rounded-lg font-medium border-2 transition-all ${visitType === "first-time"
                                ? "bg-green-600 text-white border-green-600 shadow-lg"
                                : "bg-white text-[#475569] border-[rgba(15,23,42,0.1)] hover:border-green-400"
                                }`}
                            >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                <PlusCircleIcon className="w-6 h-6 text-[#3b82f6]" />
                                <div className="text-left">
                                    <div className="font-bold">{t('clinic:consultation.firstTimeVisit', 'First-Time Visit')}</div>
                                    <div className="text-xs opacity-80">{t('clinic:consultation.startEmptyRecord', 'Start with empty patient record')}</div>
                                </div>
                                </div>
                                {visitType === "first-time" && <span className="text-xl">✓</span>}
                            </div>
                            </button>
                        </div> */}

                        {/* PDF Upload Section */}
                        {/* {visitType === "upload" && (
                            <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-[rgba(59,130,246,0.4)]">
                            <label className="block">
                                <div className="flex items-center justify-center w-full">
                                <div className="flex flex-col items-center space-y-2 cursor-pointer">
                                    <UploadIcon className="w-8 h-8 text-[#3b82f6]" />
                                    <div className="text-center">
                                    <span className="text-[#3b82f6] font-semibold hover:text-[#2563eb]">
                                        {t('clinic:consultation.clickUploadPdf', 'Click to upload PDF')}
                                    </span>
                                    <p className="text-xs text-[#64748b] mt-1">{t('clinic:consultation.orDragDrop', 'or drag and drop')}</p>
                                    <p className="text-xs text-gray-400 mt-1">{t('clinic:consultation.pdfUpTo50mb', 'PDF up to 50MB')}</p>
                                    </div>
                                </div>
                                </div>
                                <input
                                ref={configPdfInputRef}
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={handlePDFUpload}
                                className="hidden"
                                />
                            </label>
                            {pdfFileName && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-600 text-xl">✓</span>
                                    <span className="text-sm font-medium text-[#475569]">{pdfFileName}</span>
                                </div>
                                <button
                                    onClick={() => {
                                    setUploadedPDF(null);
                                    setPdfFileName("");
                                    setDiagnosisOptions([]);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                >
                                    {t('common:buttons.remove', 'Remove')}
                                </button>
                                </div>
                            )}
                            </div>
                        )}
                    </div> */}

                    {/* Language Selector */}
                    <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#475569]">{t('clinic:consultation.language', 'Language')}</h2>
                    <div className="flex flex-col gap-2">
                        <button
                        onClick={() => setLanguage("english")}
                        className={`px-4 py-2 rounded-lg font-medium ${language === "english"
                            ? "bg-[#3b82f6] text-white"
                            : "bg-[#f8fafc] text-[#475569] border border-[rgba(15,23,42,0.1)]"
                            }`}
                        >
                        English
                        </button>
                        <button
                        onClick={() => setLanguage("francais")}
                        className={`px-4 py-2 rounded-lg font-medium ${language === "francais"
                            ? "bg-[#3b82f6] text-white"
                            : "bg-[#f8fafc] text-[#475569] border border-[rgba(15,23,42,0.1)]"
                            }`}
                        >
                        Francais
                        </button>
                    </div>
                    </div>

                    {/* Clinical Focus Areas */}
                    {diagnosisOptions.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-[#475569]">
                        {t('clinic:consultation.clinicalFocusAreas', 'Clinical Focus Areas')}
                        </h2>
                        <p className="italic text-sm text-[#64748b]">
                        {t('clinic:consultation.selectFocusAreas', 'Select relevant focus areas based on the diagnosis')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                        {diagnosisOptions.map((area) => (
                            <button
                            key={area}
                            onClick={() => handleFocusAreaClick(area)}
                            className={`px-4 py-1 rounded-full text-sm font-medium border ${focusAreas.includes(area)
                                ? "bg-[#3b82f6] text-white"
                                : "bg-[#f8fafc] text-[#475569] border-[rgba(15,23,42,0.1)]"
                                }`}
                            >
                            {area}
                            </button>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Report Components */}
                    <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#475569]">
                        {t('clinic:consultation.reportComponents')}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {REPORT_KEYS.map((key) => {

                        const labels = {
                            diagnostic: t('clinic:consultation.diagnosticAssessment'),
                            treatment: t('clinic:consultation.treatmentPlan'),
                            nursing: t('clinic:consultation.nursingRecommendations'),
                        };

                        return (
                            <button
                            key={key}
                            onClick={() => toggleComponent(key)}
                            className={getButtonStyle(reportComponents[key])}
                            >
                            {labels[key]}
                            </button>
                        );
                        })}
                    </div>
                    </div>

                    {/* Practice Approach */}
                    <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-[#475569]">
                        {t('clinic:consultation.practiceApproach')}
                    </h2>

                    <div className="flex flex-wrap gap-2">
                        {PRACTICE_KEYS.map((key) => {

                        const labels = {
                            evidence: t('clinic:consultation.evidenceBased'),
                            patient: t('clinic:consultation.patientCentered'),
                            integrated: t('clinic:consultation.integratedCare'),
                        };

                        return (
                            <button
                            key={key}
                            onClick={() => toggleApproach(key)}
                            className={getButtonStyle(practiceApproach[key])}
                            >
                            {labels[key]}
                            </button>
                        );
                        })}
                    </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                    <button
                        // onClick={handleConfigSubmit}
                        onClick={handleConfigUpdate}
                        disabled={isLoadingPatientData}
                        className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition ${isLoadingPatientData
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                    >
                        {isLoadingPatientData ? (
                        <span className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('common:states.loading', 'Loading...')}</span>
                        </span>
                        ) : (
                         t('common:buttons.save', 'Save')
                        )}
                    </button>
                    {!isLoadingPatientData && patientData && (
                        <button
                        onClick={() => setShowConfigPanel(false)}
                        className="px-6 py-3 rounded-xl text-[#475569] font-semibold bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] hover:bg-gray-100 transition"
                        >
                        {t('common:buttons.cancel', 'Cancel')}
                        </button>
                    )}
                    </div>
                    {isLoadingPatientData && (
                    <div className="text-center text-sm text-[#475569] bg-[rgba(59,130,246,0.08)] rounded-lg p-3">
                        <p><span className="inline-flex items-center space-x-1"><ClockIcon className="w-4 h-4 inline" /><span>{t('clinic:consultation.processingEhrPdf', 'Processing EHR PDF with AI... This may take 30-120 seconds')}</span></span></p>
                        <p className="text-xs mt-1">{t('clinic:consultation.pleaseBePatient', "Please be patient and don't refresh")}</p>
                    </div>
                    )}
                </div>
            </div>
        </div>
    )
}