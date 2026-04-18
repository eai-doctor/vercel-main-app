import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { NavBar } from '@/components';
import { Card, CardHeader } from './components/card';

import { PasswordSection } from './password';
import Profile from './profile';
import EmailSection from './email';
import ExportSection from './export';
import {DangerZoneSection, DeleteAccountModal} from './danger-zone';

const inputCls =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3B8D] focus:border-transparent';

const getErrMsg = (err, fallback) => err?.response?.data?.error || fallback;


/* ── 메인 ── */
const Settings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['account', 'common']);
  const {
    user, updateProfile, changeEmail, verifyEmailChange,
    exportUserData, deleteAccount,changePassword
  } = useAuth();

  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <NavBar />
      <header className="max-w-4xl mx-auto pt-16 text-center px-6">
        <h1 className="text-[40px] font-bold text-[#1e293b] leading-tight mb-4">
          {t('account:title', 'Account Settings')}
        </h1>
        <p className="text-[#64748b] text-base">
          {t('account:subtitle', 'Manage your profile, email, and account data.')}
        </p>
      </header>
      <main className="max-w-2xl mx-auto px-6 pt-10 pb-16 space-y-6">
        <Profile user={user} updateProfile={updateProfile} t={t} inputCls={inputCls} />
        {/* <EmailSection
          user={user}
          changeEmail={changeEmail}
          verifyEmailChange={verifyEmailChange}
          t={t}
          inputCls={inputCls}
        /> */}
        <PasswordSection changePassword={changePassword} t={t} inputCls={inputCls} /> 
        <ExportSection exportUserData={exportUserData} t={t} />
        <DangerZoneSection onRequestDelete={() => setShowDelete(true)} t={t} />
      </main>
      <DeleteAccountModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        deleteAccount={deleteAccount}
        onSuccess={() => navigate('/')}
        t={t}
      />
    </div>
  );
};

export default Settings;