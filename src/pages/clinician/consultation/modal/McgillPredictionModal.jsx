{/* McGill Prediction Modal - MixEHR-SAGE Integration */}
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import {
  AiIcon,
  ChartIcon,
  CheckCircleIcon,
  AlertIcon,
  HospitalIcon,
  DnaIcon,
  SearchIcon,
  UsersIcon,
  WarningIcon 
} from "@/components/ui/icons";
import functionApi from "@/api/functionApi";
import consultationApi from "@/api/consultationApi";


export default function McgillPredictionModal ({
  setShowMcGillModal,
  patientData
}) {
    const { t } = useTranslation(['clinic', 'common']);

    // McGill Prediction Model states
    const [mcGillPrediction, setMcGillPrediction] = useState(null);
    const [isLoadingMcGill, setIsLoadingMcGill] = useState(false);
    const [mcGillError, setMcGillError] = useState(null);

    
      // MixEHR-SAGE Prediction Model function
      const handleMcGillPrediction = async () => {
        if (!patientData) {
          setMcGillError(t('clinic:consultation.noPatientData', 'No patient data available'));
          return;
        }
    
        try {
          setIsLoadingMcGill(true);
          setMcGillError(null);
          setMcGillPrediction(null);
    
          // Use the new FHIR-aware endpoint that handles SNOMED→ICD and RxNorm→ATC mapping
          console.log("Sending patient data to MixEHR FHIR inference:", {
            diagnoses: patientData.diagnoses?.length || 0,
            medications: patientData.medications?.length || 0
          });
    
          const data = await consultationApi.getInferFHIR(patientData);

    
          // console.log("MixEHR prediction result:", response.data);
          setMcGillPrediction(data);
    
        } catch (error) {
          console.error("Error getting MixEHR prediction:", error);
          const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to get prediction";
          const suggestion = error.response?.data?.suggestion || "";
          setMcGillError(suggestion ? `${errorMsg}\n\n${suggestion}` : errorMsg);
        } finally {
          setIsLoadingMcGill(false);
        }
      };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <ChartIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {t('clinic:consultation.mixEhrSagePrediction', 'MixEHR-SAGE Prediction')}
                    </h1>
                    <p className="text-purple-100 text-xs">
                      {t('clinic:consultation.poweredByHuggingFace', 'Powered by Hugging Face Space')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMcGillModal(false);
                    setMcGillPrediction(null);
                    setMcGillError(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Patient Codes Summary */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                  <HospitalIcon className="w-6 h-6 text-[#3b82f6]" />
                  <span>{t('clinic:consultation.patientClinicalCodes', 'Patient Clinical Codes')}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('clinic:consultation.diagnosisCodes', 'Diagnosis Codes (ICD)')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {(patientData?.diagnoses || []).filter(d => d.icd_code || d.code).length > 0 ? (
                        (patientData?.diagnoses || []).filter(d => d.icd_code || d.code).slice(0, 10).map((d, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {d.icd_code || d.code}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">{t('clinic:consultation.noIcdCodes', 'No ICD codes found')}</span>
                      )}
                      {(patientData?.diagnoses || []).filter(d => d.icd_code || d.code).length > 10 && (
                        <span className="text-gray-500 text-xs">+{(patientData?.diagnoses || []).filter(d => d.icd_code || d.code).length - 10} more</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{t('clinic:consultation.medicationCodes', 'Medication Codes')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {(patientData?.medications || []).filter(m => m.code || m.rxnorm_code).length > 0 ? (
                        (patientData?.medications || []).filter(m => m.code || m.rxnorm_code).slice(0, 10).map((m, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                            {m.code || m.rxnorm_code}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-sm italic">{t('clinic:consultation.noMedicationCodes', 'No medication codes found')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Run Prediction Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleMcGillPrediction}
                  disabled={isLoadingMcGill}
                  className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center space-x-3 ${
                    isLoadingMcGill
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  }`}
                >
                  {isLoadingMcGill ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('clinic:consultation.runningInference', 'Running Inference...')}</span>
                    </>
                  ) : (
                    <>
                      <AiIcon className="w-6 h-6" />
                      <span>{t('clinic:consultation.runTopicModelInference', 'Run Topic Model Inference')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {mcGillError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <WarningIcon className="w-6 h-6 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-red-800">{t('clinic:consultation.predictionError', 'Prediction Error')}</h4>
                      <p className="text-sm text-red-600 mt-1">{mcGillError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Prediction Results */}
              {mcGillPrediction && (
                <div className="space-y-4">
                  {/* Stats Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-green-800">{t('clinic:consultation.inferenceComplete', 'Inference Complete')}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-gray-500">{t('clinic:consultation.duration', 'Duration')}</p>
                        <p className="font-bold text-green-700">{mcGillPrediction.duration_ms || 0}ms</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-gray-500">{t('clinic:consultation.modalities', 'Modalities')}</p>
                        <p className="font-bold text-indigo-700">{(mcGillPrediction.modalities || []).join(", ") || t('common:states.na', 'N/A')}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-gray-500">{t('clinic:consultation.totalCodes', 'Total Codes')}</p>
                        <p className="font-bold text-purple-700">{mcGillPrediction.stats?.total_codes || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-gray-500">{t('clinic:consultation.matched', 'Matched')}</p>
                        <p className="font-bold text-blue-700">{mcGillPrediction.stats?.matched_codes || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Code Mapping Info */}
                  {mcGillPrediction.code_mapping && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <SearchIcon className="w-6 h-6 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">{t('clinic:consultation.codeMapping', 'Code Mapping')}</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        {t('clinic:consultation.fhirCodeMappingDesc', { mapped: mcGillPrediction.code_mapping.mapped_codes, total: mcGillPrediction.code_mapping.original_codes, defaultValue: 'FHIR uses SNOMED/RxNorm codes. We mapped {{mapped}} of {{total}} codes to ICD-10/ATC format.' })}
                      </p>
                      {mcGillPrediction.code_mapping.mapped_records?.length > 0 && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-700 hover:text-blue-900 font-medium">
                            {t('clinic:consultation.viewMappedCodes', { count: mcGillPrediction.code_mapping.mapped_records.length, defaultValue: 'View mapped codes ({{count}})' })}
                          </summary>
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {mcGillPrediction.code_mapping.mapped_records.map((r, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-xs">
                                <span className="text-gray-500">{r.original_system}:</span>
                                <span className="text-gray-600">{r.original_code}</span>
                                <span className="text-gray-400">→</span>
                                <span className="font-medium text-blue-800">{r.code}</span>
                                {r.display && <span className="text-gray-500 truncate max-w-[200px]">({r.display})</span>}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  )}

                  {/* Patient Topic Distributions */}
                  {mcGillPrediction.patients && mcGillPrediction.patients.length > 0 ? (
                    <div className="bg-white border border-purple-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <ChartIcon className="w-6 h-6 text-[#3b82f6]" />
                        <span>{t('clinic:consultation.patientTopicDistributions', 'Patient Topic Distributions')}</span>
                      </h4>
                      {mcGillPrediction.patients.map((patient, pIdx) => (
                        <div key={pIdx} className="mb-4 last:mb-0">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            {t('clinic:consultation.patient', 'Patient')}: {patient.patient_id || patient.subject_id || t('clinic:consultation.unknown', 'Unknown')}
                          </p>
                          {patient.top_topics && patient.top_topics.length > 0 ? (
                            <div className="space-y-3">
                              {patient.top_topics.map((topic, tIdx) => (
                                <div key={tIdx} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex-1">
                                      <span className="text-sm font-medium text-gray-800">
                                        {topic.phenotype || `Topic ${topic.topic ?? topic.topic_id ?? tIdx}`}
                                      </span>
                                      {topic.category && (
                                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                          {topic.category}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-sm font-bold text-indigo-600 ml-2">
                                      {((topic.value || topic.probability || topic.weight || 0) * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                      style={{ width: `${(topic.value || topic.probability || topic.weight || 0) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-sm italic">{t('clinic:consultation.noTopicDistribution', 'No topic distribution available')}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <AlertIcon className="w-6 h-6 text-yellow-600" />
                        <div>
                          <h4 className="font-semibold text-yellow-800">{t('clinic:consultation.noPatientResults', 'No Patient Results')}</h4>
                          <p className="text-sm text-yellow-600 mt-1">
                            {t('clinic:consultation.noPatientResultsDesc', "The model processed the codes but no patient results were returned. This may happen if the codes don't match the model's vocabulary.")}
                          </p>
                          {mcGillPrediction.stats?.unknown_code_count > 0 && (
                            <p className="text-sm text-yellow-700 mt-2">
                              {t('clinic:consultation.unrecognizedCodes', { count: mcGillPrediction.stats.unknown_code_count, defaultValue: '<strong>{{count}}</strong> codes were not recognized by the model.' })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw Response (Collapsible) */}
                  <details className="bg-gray-50 rounded-xl border border-gray-200">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
                      {t('clinic:consultation.viewRawApiResponse', 'View Raw API Response')}
                    </summary>
                    <pre className="px-4 py-3 text-xs text-gray-600 overflow-x-auto max-h-60 overflow-y-auto">
                      {JSON.stringify(mcGillPrediction, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {/* Information Cards */}
              {!mcGillPrediction && !isLoadingMcGill && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <DnaIcon className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{t('clinic:consultation.mixEhrSage', 'MixEHR-SAGE')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('clinic:consultation.mixEhrSageDesc', 'Multi-modal topic model for EHR phenotyping')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <SearchIcon className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{t('clinic:consultation.topicDiscovery', 'Topic Discovery')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('clinic:consultation.topicDiscoveryDesc', 'Discover latent clinical phenotypes from patient codes')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <ChartIcon className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{t('clinic:consultation.multiModal', 'Multi-Modal')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('clinic:consultation.multiModalDesc', 'Combines ICD, medication, and procedure codes')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center flex-shrink-0">
                        <UsersIcon className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">{t('clinic:consultation.huggingFace', 'Hugging Face')}</h4>
                        <p className="text-sm text-gray-600">
                          {t('clinic:consultation.huggingFaceDesc', 'Hosted on HF Spaces with 16GB RAM')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowMcGillModal(false);
                    setMcGillPrediction(null);
                    setMcGillError(null);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                >
                  {t('common:buttons.close', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }