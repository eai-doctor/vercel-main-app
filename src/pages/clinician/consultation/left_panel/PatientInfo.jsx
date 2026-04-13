import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { useLanguage } from "@/hooks";

import {
  PillIcon,
  MailIcon,
  SettingsIcon,
  AiIcon,
  UserIcon,
  StethoscopeIcon,
  ChartIcon 
} from "@/components/ui/icons";

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

export default function PatientInfo({ setPatientData, patient_identification }) {
  const { t } = useTranslation(['clinic', 'common']);
  const [isEditingPatientInfo, setIsEditingPatientInfo] = useState(false);
  const [editedPatientInfo, setEditedPatientInfo] = useState(null);
  const { currentLanguage } = useLanguage();

  const age = calculateAge(patient_identification?.date_of_birth);

  const Field = ({ label, viewValue, editNode, emptyText }) => (
    <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl hover:bg-[#f8faff] transition-colors">
      <span className="text-[10px] font-medium uppercase tracking-[0.8px] text-slate-400">
        {label}
      </span>
      {isEditingPatientInfo
        ? editNode
        : viewValue
          ? <span className="text-[15px] font-medium text-slate-900">{viewValue}</span>
          : <span className="text-[14px] text-slate-400 italic">{emptyText ?? t('clinic:consultation.notProvided', 'Not provided')}</span>
      }
    </div>
  );

  const inputCls = "text-[13px] px-2.5 py-1.5 border border-slate-200 rounded-md w-full focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10";

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            <UserIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
          </div>
          <h2 className="text-[17px] font-semibold text-slate-800">
            {t('clinic:consultation.patientInfo', 'Patient info')}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 hidden">
          {!isEditingPatientInfo ? (
            <button
              onClick={() => { setIsEditingPatientInfo(true); setEditedPatientInfo({ ...patient_identification }); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2C3B8D] text-white hover:bg-[#233070] transition-colors"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setPatientData(prev => ({ ...prev, patient_identification: editedPatientInfo }));
                  setIsEditingPatientInfo(false); setEditedPatientInfo(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                {t('common:buttons.save', 'Save')}
              </button>
              <button
                onClick={() => { setIsEditingPatientInfo(false); setEditedPatientInfo(null); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t('common:buttons.cancel', 'Cancel')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Core fields */}
      <div className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
          <Field
            label={t('clinic:consultation.name', 'Name')}
            viewValue={patient_identification?.full_name}
            editNode={
              <input className={inputCls}
                value={editedPatientInfo?.full_name || ''}
                onChange={e => setEditedPatientInfo({ ...editedPatientInfo, full_name: e.target.value })}
                placeholder={t('clinic:consultation.enterPatientName', 'Enter patient name')}
              />
            }
          />
          <Field
            label={t('clinic:consultation.gender', 'Gender')}
            viewValue={patient_identification?.gender}
            editNode={
              <select className={inputCls}
                value={editedPatientInfo?.gender || ''}
                onChange={e => setEditedPatientInfo({ ...editedPatientInfo, gender: e.target.value })}
              >
                <option value="">{t('clinic:consultation.selectGender', 'Select gender')}</option>
                <option value="Male">{t('clinic:consultation.male', 'Male')}</option>
                <option value="Female">{t('clinic:consultation.female', 'Female')}</option>
                <option value="Other">{t('clinic:consultation.other', 'Other')}</option>
              </select>
            }
          />
          <Field
            label={t('clinic:consultation.dateOfBirth', 'Date of birth')}
            viewValue={patient_identification?.date_of_birth}
            editNode={
              <input className={inputCls} type="date"
                value={editedPatientInfo?.date_of_birth || ''}
                onChange={e => setEditedPatientInfo({ ...editedPatientInfo, date_of_birth: e.target.value })}
              />
            }
          />
          <Field
            label={t('clinic:consultation.age', 'Age')}
            viewValue={age != null ? t('clinic:consultation.yearsOld', { age, defaultValue: '{{age}} years' }) : null}
            emptyText={t('clinic:consultation.notAvailable', 'Not available')}
          />
          <Field
            label={t('clinic:consultation.mrn', 'MRN')}
            viewValue={patient_identification?.mrn}
          />
          <Field
            label={t('clinic:consultation.phone', 'Phone')}
            viewValue={patient_identification?.phone}
            editNode={
              <input className={inputCls}
                value={editedPatientInfo?.phone || ''}
                onChange={e => setEditedPatientInfo({ ...editedPatientInfo, phone: e.target.value })}
                placeholder={t('clinic:consultation.contactPhoneNumber', 'Contact phone number')}
              />
            }
          />
          <Field
            label={t('clinic:consultation.email', 'Email')}
            viewValue={patient_identification?.email}
            editNode={
              <input className={inputCls} type="email"
                value={editedPatientInfo?.email || ''}
                onChange={e => setEditedPatientInfo({ ...editedPatientInfo, email: e.target.value })}
                placeholder={t('clinic:consultation.enterEmail', 'Enter email')}
              />
            }
          />
          <Field
            label={t('clinic:consultation.status', 'Status')}
            viewValue={patient_identification?.status}
          />
        </div>
      </div>
    </section>
  );
}