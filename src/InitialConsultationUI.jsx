import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./components/ProfileDropdown";
import { DocumentIcon, PlusCircleIcon, UploadIcon, ClockIcon } from "./components/icons";

export default function InitialConsultationUI() {
  const { t } = useTranslation(['clinic', 'common']);
  const navigate = useNavigate();
  const [language, setLanguage] = useState("English");
  const [focusAreas, setFocusAreas] = useState([]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([]);
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
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(false);
  const [visitType, setVisitType] = useState(null); // "upload" or "first-time"
  const [uploadedPDF, setUploadedPDF] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");

  // Only fetch diagnosis when PDF is uploaded
  useEffect(() => {
    const fetchDiagnosis = async () => {
      if (!uploadedPDF || visitType !== "upload") return;

      try {
        const formData = new FormData();
        formData.append("pdf", uploadedPDF);

        const res = await axios.post(
          "http://localhost:5001/api/extract-diagnosis-from-upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Full response:", res);
        const data = res.data;

        if (data && Array.isArray(data.diagnosis)) {
          const names = data.diagnosis
            .filter((d) => typeof d.name === "string" && d.name.trim() !== "")
            .map((d) => d.name);
          setDiagnosisOptions(names);
        } else {
          console.warn(
            "diagnosis key missing or not an array:",
            data.diagnosis
          );
        }
      } catch (err) {
        console.error("Error fetching diagnosis data:", err);
      }
    };

    fetchDiagnosis();
  }, [uploadedPDF, visitType]);

  const toggleComponent = (key) => {
    setReportComponents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleApproach = (key) => {
    setPracticeApproach((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFocusAreaClick = (area) => {
    setFocusAreas((prev) =>
      prev.includes(area)
        ? prev.filter((item) => item !== area)
        : [...prev, area]
    );
  };

  const handlePDFUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== "application/pdf") {
      alert(t('config.pleaseUploadPdf'));
      return;
    }

    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert(t('config.fileSizeLimit'));
      return;
    }

    setUploadedPDF(file);
    setPdfFileName(file.name);
    console.log(`PDF uploaded: ${file.name}, size: ${file.size} bytes`);
  };

  const handleSubmit = async () => {
    const submissionData = {
      language,
      focusAreas,
      reportComponents,
      practiceApproach,
    };

    try {
      setIsLoadingPatientData(true);

      let patientData = null;

      if (visitType === "upload" && uploadedPDF) {
        // Upload PDF and extract patient data
        console.log("Uploading and processing PDF...");
        const formData = new FormData();
        formData.append("pdf", uploadedPDF);
        formData.append("ui_settings", JSON.stringify(submissionData));

        const response = await axios.post(
          "http://localhost:5001/api/extract-patient-data-from-upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Patient data received:", response.data);
        patientData = response.data;
      } else if (visitType === "first-time") {
        // Start with empty patient data
        console.log("Starting with empty patient data (first-time visit)");
        patientData = {
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
          immunizations: [],
        };
      } else {
        alert(t('config.selectVisitType'));
        setIsLoadingPatientData(false);
        return;
      }

      // Pass both UI settings AND patient data to the summary page
      navigate("/consultation", {
        state: {
          ...submissionData,
          patientData: patientData,
        },
      });
    } catch (error) {
      console.error("Error processing patient data:", error);
      alert(t('config.failedToLoadPatientData', { error: error.message }));
      setIsLoadingPatientData(false);
    }
  };


  return (
    <div className="p-8 max-w-3xl mx-auto bg-white shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] rounded-xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#1e293b]">
          {t('config.title')}
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">{t('common:buttons.home')}</span>
          </button>
          <ProfileDropdown />
        </div>
      </div>

      {/* Visit Type Selection */}
      <div className="space-y-4 bg-[rgba(59,130,246,0.08)] p-6 rounded-xl border-2 border-[rgba(59,130,246,0.2)]">
        <h2 className="text-xl font-semibold text-[#475569]">{t('config.visitType')}</h2>
        <p className="text-sm text-[#475569] italic">
          {t('config.visitTypeDescription')}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              setVisitType("upload");
              setDiagnosisOptions([]);
            }}
            className={`px-6 py-4 rounded-lg font-medium border-2 transition-all duration-300 ${
              visitType === "upload"
                ? "bg-[#3b82f6] text-white border-[#3b82f6] shadow-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "bg-white text-[#475569] border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DocumentIcon className="w-7 h-7" />
                <div className="text-left">
                  <div className="font-bold">{t('config.uploadMedicalRecords')}</div>
                  <div className="text-xs opacity-80">{t('config.uploadProgressNote')}</div>
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
            className={`px-6 py-4 rounded-lg font-medium border-2 transition-all duration-300 ${
              visitType === "first-time"
                ? "bg-green-600 text-white border-green-600 shadow-lg shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                : "bg-white text-[#475569] border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] hover:shadow-[0_4px_16px_rgba(59,130,246,0.1)]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PlusCircleIcon className="w-7 h-7" />
                <div className="text-left">
                  <div className="font-bold">{t('config.firstTimeVisit')}</div>
                  <div className="text-xs opacity-80">{t('config.emptyPatientRecord')}</div>
                </div>
              </div>
              {visitType === "first-time" && <span className="text-xl">✓</span>}
            </div>
          </button>
        </div>

        {/* PDF Upload Section */}
        {visitType === "upload" && (
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-[rgba(59,130,246,0.4)]">
            <label className="block">
              <div className="flex items-center justify-center w-full">
                <div className="flex flex-col items-center space-y-2 cursor-pointer">
                  <UploadIcon className="w-10 h-10 text-[#3b82f6]" />
                  <div className="text-center">
                    <span className="text-[#3b82f6] font-semibold hover:text-[#2563eb]">
                      {t('config.clickToUploadPdf')}
                    </span>
                    <p className="text-xs text-[#64748b] mt-1">{t('config.orDragAndDrop')}</p>
                    <p className="text-xs text-[#64748b] mt-1">{t('config.pdfUpTo50MB')}</p>
                  </div>
                </div>
              </div>
              <input
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
                  {t('common:buttons.remove')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Language Selector */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#475569]">{t('config.language')}</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setLanguage("English")}
            className={`px-4 py-2 rounded-lg font-medium ${
              language === "English"
                ? "bg-[#3b82f6] text-white"
                : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569]"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("Francais")}
            className={`px-4 py-2 rounded-lg font-medium ${
              language === "Francais"
                ? "bg-[#3b82f6] text-white"
                : "bg-[#f8fafc] border border-[rgba(15,23,42,0.1)] text-[#475569]"
            }`}
          >
            Francais
          </button>
        </div>
      </div>

      {/* Clinical Focus Areas */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#475569]">
          {t('config.clinicalFocusAreas')}
        </h2>
        <p className="italic text-sm text-[#64748b]">
          {t('config.clinicalFocusAreasHint')}
        </p>
        <div className="flex flex-col gap-2">
          {diagnosisOptions.map((area) => (
            <button
              key={area}
              onClick={() => handleFocusAreaClick(area)}
              className={`px-4 py-1 rounded-full text-sm font-medium border ${
                focusAreas.includes(area)
                  ? "bg-[#3b82f6] text-white"
                  : "bg-[#f8fafc] border-[rgba(15,23,42,0.1)] text-[#475569]"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Report Components */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-[#475569]">
          {t('config.reportComponents')}
        </h2>
        <div className="flex flex-col gap-2">
          {["diagnostic", "treatment", "nursing"].map((key) => {
            const labels = {
              diagnostic: t('config.diagnosticAssessment'),
              treatment: t('config.treatmentPlan'),
              nursing: t('config.nursingRecommendations'),
            };
            return (
              <button
                key={key}
                onClick={() => toggleComponent(key)}
                className={`px-4 py-1 rounded-full text-sm font-medium border ${
                  reportComponents[key]
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#f8fafc] border-[rgba(15,23,42,0.1)] text-[#475569]"
                }`}
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
          {t('config.medicalPracticeApproach')}
        </h2>
        <div className="flex flex-col gap-2">
          {["evidence", "patient", "integrated"].map((key) => {
            const labels = {
              evidence: t('config.evidenceBased'),
              patient: t('config.patientCentered'),
              integrated: t('config.integratedCare'),
            };
            return (
              <button
                key={key}
                onClick={() => toggleApproach(key)}
                className={`px-4 py-1 rounded-full text-sm font-medium border ${
                  practiceApproach[key]
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#f8fafc] border-[rgba(15,23,42,0.1)] text-[#475569]"
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center pt-4">
        <button
          onClick={handleSubmit}
          disabled={isLoadingPatientData}
          className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
            isLoadingPatientData
              ? "bg-[#64748b] cursor-not-allowed"
              : "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] hover:opacity-90 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
          }`}
        >
          {isLoadingPatientData ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('config.loadingPatientData')}</span>
            </span>
          ) : (
            t('common:buttons.submit')
          )}
        </button>
        {isLoadingPatientData && (
          <div className="mt-4 text-sm text-[#475569]">
            <p><ClockIcon className="w-5 h-5 inline" /> {t('config.processingEHR')}</p>
            <p className="text-xs mt-1">{t('config.pleaseBePatient')}</p>
          </div>
        )}
      </div>
    </div>
  );
}