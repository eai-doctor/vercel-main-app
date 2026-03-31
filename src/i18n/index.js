import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enLanding from './locales/en/landing.json';
import enClinic from './locales/en/clinic.json';
import enPatient from './locales/en/patient.json';
import enFunctions from './locales/en/functions.json';
import enTriage from './locales/en/triage.json';
import enAdmin from './locales/en/admin.json';
import enConsent from './locales/en/consent.json';
import enAccount from './locales/en/account.json';
import enPrivacy from './locales/en/privacy.json';

import zhCommon from './locales/zh/common.json';
import zhAuth from './locales/zh/auth.json';
import zhLanding from './locales/zh/landing.json';
import zhClinic from './locales/zh/clinic.json';
import zhPatient from './locales/zh/patient.json';
import zhFunctions from './locales/zh/functions.json';
import zhTriage from './locales/zh/triage.json';
import zhAdmin from './locales/zh/admin.json';
import zhConsent from './locales/zh/consent.json';
import zhAccount from './locales/zh/account.json';
import zhPrivacy from './locales/zh/privacy.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frLanding from './locales/fr/landing.json';
import frClinic from './locales/fr/clinic.json';
import frPatient from './locales/fr/patient.json';
import frFunctions from './locales/fr/functions.json';
import frTriage from './locales/fr/triage.json';
import frAdmin from './locales/fr/admin.json';
import frConsent from './locales/fr/consent.json';
import frAccount from './locales/fr/account.json';
import frPrivacy from './locales/fr/privacy.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        landing: enLanding,
        clinic: enClinic,
        patient: enPatient,
        functions: enFunctions,
        triage: enTriage,
        admin: enAdmin,
        consent: enConsent,
        account: enAccount,
        privacy: enPrivacy
      },
      zh: {
        common: zhCommon,
        auth: zhAuth,
        landing: zhLanding,
        clinic: zhClinic,
        patient: zhPatient,
        functions: zhFunctions,
        triage: zhTriage,
        admin: zhAdmin,
        consent: zhConsent,
        account: zhAccount,
        privacy: zhPrivacy
      },
      fr: {
        common: frCommon,
        auth: frAuth,
        landing: frLanding,
        clinic: frClinic,
        patient: frPatient,
        functions: frFunctions,
        triage: frTriage,
        admin: frAdmin,
        consent: frConsent,
        account: frAccount,
        privacy: frPrivacy
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'auth', 'landing', 'clinic', 'patient', 'functions', 'triage', 'admin', 'consent', 'account', 'privacy'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
