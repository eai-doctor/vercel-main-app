import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './components/ProfileDropdown';
import LanguageSwitcher from './components/LanguageSwitcher';

const AccountSettings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['account', 'common']);
  const { user, updateProfile, changeEmail, verifyEmailChange, exportUserData, deleteAccount, logout } = useAuth();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [profileStatus, setProfileStatus] = useState(null); // { type, message }
  const [savingProfile, setSavingProfile] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const [changingEmail, setChangingEmail] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null); // { type, message }

  const confirmPhrase = t('account:delete.confirmPhrase');

  // ── Profile handlers ──
  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      await updateProfile({ name: name.trim() });
      setProfileStatus({ type: 'success', message: t('account:profile.saved') });
    } catch {
      setProfileStatus({ type: 'error', message: t('account:profile.error') });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Email handlers ──
  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return;
    setChangingEmail(true);
    setEmailStatus(null);
    try {
      await changeEmail(newEmail.trim());
      setVerificationStep(true);
      setEmailStatus({ type: 'success', message: t('account:email.verificationSent') });
    } catch (err) {
      setEmailStatus({ type: 'error', message: err.response?.data?.error || t('account:email.error') });
    } finally {
      setChangingEmail(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verificationCode.trim()) return;
    setVerifyingCode(true);
    setEmailStatus(null);
    try {
      await verifyEmailChange(verificationCode.trim());
      setEmailStatus({ type: 'success', message: t('account:email.changed') });
      setVerificationStep(false);
      setNewEmail('');
      setVerificationCode('');
    } catch (err) {
      setEmailStatus({ type: 'error', message: err.response?.data?.error || t('account:email.error') });
    } finally {
      setVerifyingCode(false);
    }
  };

  // ── Export handler ──
  const handleExportData = async () => {
    setExporting(true);
    setExportStatus(null);
    try {
      await exportUserData();
      setExportStatus({ type: 'success', message: t('account:export.success') });
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus({ type: 'error', message: t('account:export.error') });
    } finally {
      setExporting(false);
    }
  };

  // ── Delete handlers ──
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(confirmPhrase);
      navigate('/');
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] z-50" />

      {/* Header */}
      <header className="mt-[3px] bg-white/95 backdrop-blur-[20px] border-b border-[rgba(15,23,42,0.1)] shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1e293b]">
                <svg className="w-8 h-8 inline text-[#3b82f6] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('account:title')}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{t('account:subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(user?.role === 'patient' ? '/personal' : '/clinics')}
                className="flex items-center space-x-2 px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg hover:opacity-90 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">{t('common:header.home')}</span>
              </button>
              <LanguageSwitcher />
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">

        {/* ── Profile Section ── */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-[#1e293b]">{t('account:profile.heading')}</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {profileStatus && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                profileStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {profileStatus.message}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">{t('account:profile.nameLabel')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('account:profile.namePlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile || !name.trim() || name.trim() === user?.name}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                {savingProfile ? t('account:profile.saving') : t('account:profile.saveButton')}
              </button>
            </div>
          </div>
        </div>

        {/* ── Email Section ── */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[rgba(15,23,42,0.08)]">
            <h2 className="text-lg font-semibold text-[#1e293b]">{t('account:email.heading')}</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            {emailStatus && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                emailStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {emailStatus.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1.5">{t('account:email.currentLabel')}</label>
              <p className="text-sm text-[#1e293b] bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200">{user?.email}</p>
            </div>

            {!verificationStep ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-1.5">{t('account:email.newLabel')}</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={t('account:email.newPlaceholder')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleChangeEmail}
                    disabled={changingEmail || !newEmail.trim()}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {changingEmail ? t('account:email.changing') : t('account:email.changeButton')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[#475569]">{t('account:email.verificationPrompt')}</p>
                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerificationCode(v);
                    }}
                    placeholder={t('account:email.codePlaceholder')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
                    maxLength={6}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => { setVerificationStep(false); setVerificationCode(''); setEmailStatus(null); }}
                    className="px-5 py-2.5 text-sm font-medium text-[#475569] bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    {t('common:buttons.cancel')}
                  </button>
                  <button
                    onClick={handleVerifyEmailChange}
                    disabled={verifyingCode || verificationCode.length !== 6}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {verifyingCode ? t('account:email.verifying') : t('account:email.verifyButton')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Data Export Section (Law 25) ── */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-blue-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50">
            <h2 className="text-lg font-semibold text-blue-700">{t('account:export.heading')}</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-[#475569] mb-4">{t('account:export.description')}</p>
            {exportStatus && (
              <div className={`px-4 py-3 rounded-lg text-sm mb-4 ${
                exportStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {exportStatus.message}
              </div>
            )}
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('account:export.downloading')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{t('account:export.button')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border-2 border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h2 className="text-lg font-semibold text-red-700">{t('account:delete.title')}</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-[#475569] mb-4">{t('account:delete.description')}</p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
            >
              {t('account:delete.button')}
            </button>
          </div>
        </div>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setShowDeleteModal(false); }}
        >
          <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-lg w-full border border-[rgba(15,23,42,0.1)]">
            {/* Modal Header */}
            <div className="bg-red-600 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h2 className="text-xl font-bold text-white">{t('account:delete.button')}</h2>
                </div>
                <button
                  onClick={() => { if (!deleting) setShowDeleteModal(false); }}
                  className="text-white hover:text-gray-200 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#475569]">{t('account:delete.warning')}</p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-700 mb-2">{t('account:delete.cannotUndo')}</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {t('account:delete.dataList', { returnObjects: true }).map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2 mt-0.5">&#8226;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {deleteError && (
                <div className="px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
                  {deleteError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#475569] mb-1.5">
                  {t('account:delete.confirmLabel')}
                  <code className="ml-1 bg-gray-100 px-2 py-0.5 rounded text-red-600 font-mono text-xs">{confirmPhrase}</code>
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={t('account:delete.confirmPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  disabled={deleting}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[rgba(15,23,42,0.1)] px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmInput(''); setDeleteError(null); }}
                disabled={deleting}
                className="px-5 py-2.5 text-sm font-medium text-[#475569] bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                {t('common:buttons.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmInput !== confirmPhrase}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? t('account:delete.deleting') : t('account:delete.button')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
