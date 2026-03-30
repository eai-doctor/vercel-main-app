import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import ProfileDropdown from './components/ProfileDropdown';
import LanguageSwitcher from './components/LanguageSwitcher';

const CONSENT_TYPES = [
  { key: 'privacy_policy', required: true },
  { key: 'ai_analysis', required: false },
  { key: 'audio', required: false },
  { key: 'marketing', required: false },
];

const ConsentSettings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['consent', 'common']);
  const { user, updateConsents, setUser } = useAuth();

  const [consents, setConsents] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [detailModal, setDetailModal] = useState(null); // consent key or null

  useEffect(() => {
    if (user?.consents) {
      const initial = {};
      CONSENT_TYPES.forEach(({ key }) => {
        initial[key] = !!user.consents[key]?.accepted;
      });
      setConsents(initial);
    }
  }, [user?.consents]);

  const handleToggle = (key) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
    setFeedback(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const payload = {};
      CONSENT_TYPES.forEach(({ key }) => {
        payload[key] = consents[key];
      });
      await updateConsents(payload);
      setFeedback({ type: 'success', message: t('consent:saved') });
      navigate(-1);
    } catch {
      setFeedback({ type: 'error', message: t('consent:error') });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return t('consent:never');
    const locale = i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const showPrivacyWarning = user?.consents?.privacy_policy?.accepted && !consents.privacy_policy;

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('consent:title')}
              </h1>
              <p className="text-sm text-[#475569] mt-1">{t('consent:subtitle')}</p>
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

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Feedback Banner */}
        {feedback && (
          <div className={`mb-6 px-4 py-3 rounded-lg flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="ml-4 text-sm underline">{t('common:buttons.dismiss')}</button>
          </div>
        )}

        {/* Privacy Warning */}
        {showPrivacyWarning && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>{t('consent:privacyWarning')}</span>
          </div>
        )}

        {/* Consent Toggles */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] overflow-hidden">
          {CONSENT_TYPES.map(({ key, required }, index) => {
            const isOn = !!consents[key];
            const consentData = user?.consents?.[key];
            return (
              <div
                key={key}
                className={`px-6 py-5 flex items-center justify-between ${
                  index < CONSENT_TYPES.length - 1 ? 'border-b border-[rgba(15,23,42,0.08)]' : ''
                }`}
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-[#1e293b]">
                      {t(`consent:types.${key}.label`)}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      required
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {required ? t('consent:required') : t('consent:optional')}
                    </span>
                  </div>
                  <p className="text-sm text-[#475569] mt-1">
                    {t(`consent:types.${key}.description`)}
                  </p>
                  <button
                    onClick={() => setDetailModal(key)}
                    className="inline-flex items-center text-sm text-[#3b82f6] hover:text-[#2563eb] mt-1.5 font-medium"
                  >
                    {t('consent:readMore')}
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <p className="text-xs text-[#94a3b8] mt-1.5">
                    {t('consent:lastUpdated')}: {formatDate(consentData?.updated_at)}
                    {' — '}
                    <span className={isOn ? 'text-green-600' : 'text-gray-500'}>
                      {isOn ? t('consent:accepted') : t('consent:declined')}
                    </span>
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={isOn}
                  onClick={() => handleToggle(key)}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 ${
                    isOn ? 'bg-[#3b82f6]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      isOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? t('consent:saving') : t('consent:saveButton')}
          </button>
        </div>
      </main>

      {/* Detail Modal */}
      {detailModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetailModal(null); }}
        >
          <div className="bg-white rounded-xl shadow-[0_25px_50px_rgba(15,23,42,0.15)] max-w-2xl w-full max-h-[85vh] flex flex-col border border-[rgba(15,23,42,0.1)]">
            {/* Modal Header */}
            <div className="bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] p-6 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <h2 className="text-xl font-bold text-white">{t(`consent:types.${detailModal}.label`)}</h2>
                    <p className="text-white/80 text-sm">{t('consent:detailModalSubtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-white hover:text-gray-200 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 text-sm text-[#334155] space-y-4 leading-relaxed">
              {detailModal === 'privacy_policy' && <PrivacyPolicyContent t={t} />}
              {detailModal === 'ai_analysis' && <AiAnalysisContent t={t} />}
              {detailModal === 'audio' && <AudioRecordingContent t={t} />}
              {detailModal === 'marketing' && <MarketingContent t={t} />}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[rgba(15,23,42,0.1)] px-6 py-4 flex-shrink-0 flex justify-end">
              <button
                onClick={() => setDetailModal(null)}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] rounded-lg hover:opacity-90 transition-all"
              >
                {t('common:buttons.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Policy Content Sections ── */

function SectionHeading({ children }) {
  return <h3 className="text-base font-semibold text-[#1e293b] mt-2">{children}</h3>;
}

function BulletList({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function PrivacyPolicyContent({ t }) {
  return (
    <>
      <p>{t('consent:policyContent.privacy.intro')}</p>

      <SectionHeading>{t('consent:policyContent.privacy.scopeTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.privacy.scopeItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.privacy.purposeTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.privacy.purposeItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.privacy.retentionTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.privacy.retentionItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.privacy.crossBorderTitle')}</SectionHeading>
      <p>{t('consent:policyContent.privacy.crossBorderText')}</p>

      <SectionHeading>{t('consent:policyContent.privacy.rightsTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.privacy.rightsItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.privacy.contactTitle')}</SectionHeading>
      <p>{t('consent:policyContent.privacy.contactText')}</p>
    </>
  );
}

function AiAnalysisContent({ t }) {
  return (
    <>
      <p>{t('consent:policyContent.ai.intro')}</p>

      <SectionHeading>{t('consent:policyContent.ai.whatTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.ai.whatItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.ai.limitsTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.ai.limitsItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.ai.dataTitle')}</SectionHeading>
      <p>{t('consent:policyContent.ai.dataText')}</p>

      <SectionHeading>{t('consent:policyContent.ai.noStorageTitle')}</SectionHeading>
      <p>{t('consent:policyContent.ai.noStorageText')}</p>
    </>
  );
}

function AudioRecordingContent({ t }) {
  return (
    <>
      <p>{t('consent:policyContent.audio.intro')}</p>

      <SectionHeading>{t('consent:policyContent.audio.whatTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.audio.whatItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.audio.storageTitle')}</SectionHeading>
      <p>{t('consent:policyContent.audio.storageText')}</p>

      <SectionHeading>{t('consent:policyContent.audio.controlTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.audio.controlItems', { returnObjects: true })} />
    </>
  );
}

function MarketingContent({ t }) {
  return (
    <>
      <p>{t('consent:policyContent.marketing.intro')}</p>

      <SectionHeading>{t('consent:policyContent.marketing.whatTitle')}</SectionHeading>
      <BulletList items={t('consent:policyContent.marketing.whatItems', { returnObjects: true })} />

      <SectionHeading>{t('consent:policyContent.marketing.optOutTitle')}</SectionHeading>
      <p>{t('consent:policyContent.marketing.optOutText')}</p>
    </>
  );
}

export default ConsentSettings;
