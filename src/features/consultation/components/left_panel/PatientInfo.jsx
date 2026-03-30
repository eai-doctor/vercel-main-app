import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';

import {
  PillIcon,
  MailIcon,
  SettingsIcon,
  AiIcon,
  UserIcon,
  StethoscopeIcon,
  ChartIcon 
} from "@/components/icons";

const calculateAge = (dateStr) => {
  if (!dateStr) return null;
  const dob = new Date(dateStr);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

export default function PatinetInfo({
    setPatientData,
    language,
    patient_identification
}){
    const { t } = useTranslation(['clinic', 'common']);
    const [isEditingPatientInfo, setIsEditingPatientInfo] = useState(false);
    const [showMoreDemographics, setShowMoreDemographics] = useState(false);

    const age = calculateAge(patient_identification?.date_of_birth);

    return(
        <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[rgba(59,130,246,0.08)] rounded-lg flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-[#3b82f6]" />
                </div>
                <h2 className="text-2xl font-bold text-gradient">
                    {t('clinic:consultation.patientInfo', 'Patient Info')}
                </h2>
                </div>
                {/*!isEditingPatientInfo ? (
                <button
                    onClick={() => {
                    setIsEditingPatientInfo(true);
                    setEditedPatientInfo({ ...patient_identification });
                    }}
                    className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium btn-glow"
                >
                    {t('common:buttons.edit', 'Edit')}
                </button>
                ) : (
                <div className="flex space-x-2">
                    <button
                    onClick={() => {
                        setPatientData(prev => ({
                        ...prev,
                        patient_identification: editedPatientInfo
                        }));
                        setIsEditingPatientInfo(false);
                        setEditedPatientInfo(null);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                    ✓ {t('common:buttons.save', 'Save')}
                    </button>
                    <button
                    onClick={() => {
                        setIsEditingPatientInfo(false);
                        setEditedPatientInfo(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                    ✗ {t('common:buttons.cancel', 'Cancel')}
                    </button>
                </div>
                )*/}
            </div>
            <div className="space-y-3">
                {/* Core demographic fields */}
                <div className="flex items-center space-x-2">
                <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.name', 'Name')}:</strong>
                {isEditingPatientInfo ? (
                    <input
                    type="text"
                    value={editedPatientInfo.full_name || ""}
                    onChange={(e) => setEditedPatientInfo({ ...editedPatientInfo, full_name: e.target.value })}
                    className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                    placeholder={t('clinic:consultation.enterPatientName', 'Enter patient name')}
                    />
                ) : (
                    <span className="text-[#1e293b]">
                    {patient_identification?.full_name || (
                        <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                    )}
                    </span>
                )}
                </div>
                <div className="flex items-center space-x-2">
                <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.gender', 'Gender')}:</strong>
                {isEditingPatientInfo ? (
                    <select
                    value={editedPatientInfo.gender || ""}
                    onChange={(e) => setEditedPatientInfo({ ...editedPatientInfo, gender: e.target.value })}
                    className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                    >
                    <option value="">{t('clinic:consultation.selectGender', 'Select gender')}</option>
                    <option value="Male">{t('clinic:consultation.male', 'Male')}</option>
                    <option value="Female">{t('clinic:consultation.female', 'Female')}</option>
                    <option value="Other">{t('clinic:consultation.other', 'Other')}</option>
                    </select>
                ) : (
                    <span className="text-[#1e293b]">
                    {patient_identification?.gender || (
                        <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                    )}
                    </span>
                )}
                </div>
                <div className="flex items-center space-x-2">
                <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.dateOfBirth', 'Date of Birth')}:</strong>
                {isEditingPatientInfo ? (
                    <input
                    type="date"
                    value={editedPatientInfo.date_of_birth || ""}
                    onChange={(e) => setEditedPatientInfo({ ...editedPatientInfo, date_of_birth: e.target.value })}
                    className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                    />
                ) : (
                    <span className="text-[#1e293b]">
                    {patient_identification?.date_of_birth || (
                        <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                    )}
                    </span>
                )}
                </div>
                <div className="flex items-center space-x-2">
                <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.age', 'Age')}:</strong>
                <span className="text-[#1e293b]">
                    {age != null ? (
                    t('clinic:consultation.yearsOld', { age, defaultValue: '{{age}} years' })
                    ) : (
                    <span className="text-gray-400 italic">{t('clinic:consultation.notAvailable', 'Not available')}</span>
                    )}
                </span>
                </div>
                <div className="flex items-center space-x-2">
                <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.language', 'Language')}:</strong>
                {isEditingPatientInfo ? (
                    <input
                    type="text"
                    value={editedPatientInfo.language || ""}
                    onChange={(e) => setEditedPatientInfo({ ...editedPatientInfo, language: e.target.value })}
                    className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                    placeholder={t('clinic:consultation.enterPreferredLanguage', 'Enter preferred language')}
                    />
                ) : (
                    <span className="text-[#1e293b]">
                    {patient_identification?.language || language || (
                        <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                    )}
                    </span>
                )}
                </div>

                {/* More demographic details */}
                <div className="pt-2">
                <button
                    type="button"
                    onClick={() => setShowMoreDemographics((prev) => !prev)}
                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium"
                >
                    {showMoreDemographics ? t('clinic:consultation.lessDemographics', 'Less demographic details') : t('clinic:consultation.moreDemographics', 'More demographic details')}
                </button>
                </div>

                {showMoreDemographics && (
                <div className="mt-3 space-y-3 border-t border-dashed border-[rgba(15,23,42,0.1)] pt-3">
                    <div className="flex items-center space-x-2">
                    <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.birthplace', 'Birthplace')}:</strong>
                    {isEditingPatientInfo ? (
                        <input
                        type="text"
                        value={editedPatientInfo.birthplace || ""}
                        onChange={(e) =>
                            setEditedPatientInfo({ ...editedPatientInfo, birthplace: e.target.value })
                        }
                        className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                        placeholder={t('clinic:consultation.cityCountry', 'City, Country')}
                        />
                    ) : (
                        <span className="text-[#1e293b]">
                        {patient_identification?.birthplace || (
                            <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                        )}
                        </span>
                    )}
                    </div>
                    <div className="flex items-center space-x-2">
                    <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.address', 'Address')}:</strong>
                    {isEditingPatientInfo ? (
                        <input
                        type="text"
                        value={editedPatientInfo.address || ""}
                        onChange={(e) =>
                            setEditedPatientInfo({ ...editedPatientInfo, address: e.target.value })
                        }
                        className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                        placeholder={t('clinic:consultation.streetCityCountry', 'Street, City, Country')}
                        />
                    ) : (
                        <span className="text-[#1e293b]">
                        {patient_identification?.address || (
                            <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                        )}
                        </span>
                    )}
                    </div>
                    <div className="flex items-center space-x-2">
                    <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.phone', 'Phone')}:</strong>
                    {isEditingPatientInfo ? (
                        <input
                        type="text"
                        value={editedPatientInfo.phone || ""}
                        onChange={(e) =>
                            setEditedPatientInfo({ ...editedPatientInfo, phone: e.target.value })
                        }
                        className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                        placeholder={t('clinic:consultation.contactPhoneNumber', 'Contact phone number')}
                        />
                    ) : (
                        <span className="text-[#1e293b]">
                        {patient_identification?.phone || (
                            <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                        )}
                        </span>
                    )}
                    </div>
                    <div className="flex items-center space-x-2">
                    <strong className="text-[#475569] min-w-[120px]">{t('clinic:consultation.maritalStatus', 'Marital Status')}:</strong>
                    {isEditingPatientInfo ? (
                        <select
                        value={editedPatientInfo.marital_status || ""}
                        onChange={(e) =>
                            setEditedPatientInfo({ ...editedPatientInfo, marital_status: e.target.value })
                        }
                        className="flex-1 px-3 py-1 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6]"
                        >
                        <option value="">{t('clinic:consultation.selectStatus', 'Select status')}</option>
                        <option value="Single">{t('clinic:consultation.single', 'Single')}</option>
                        <option value="Married">{t('clinic:consultation.married', 'Married')}</option>
                        <option value="Separated">{t('clinic:consultation.separated', 'Separated')}</option>
                        <option value="Divorced">{t('clinic:consultation.divorced', 'Divorced')}</option>
                        <option value="Widowed">{t('clinic:consultation.widowed', 'Widowed')}</option>
                        </select>
                    ) : (
                        <span className="text-[#1e293b]">
                        {patient_identification?.marital_status || (
                            <span className="text-gray-400 italic">{t('clinic:consultation.notProvided', 'Not provided')}</span>
                        )}
                        </span>
                    )}
                    </div>
                </div>
                )}
            </div>
        </section>
        
    )
}