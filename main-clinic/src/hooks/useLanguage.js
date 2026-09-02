import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'zh', label: '中文', flag: 'ZH' },
  { code: 'fr', label: 'Français', flag: 'FR' },
];

const useLanguage = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (languageCode) => {
        i18n.changeLanguage(languageCode);
    }

    const currentLanguage = LANGUAGES.find(l => i18n.language?.startsWith(l.code)) || LANGUAGES[0];

    const getLanguageCode = (language) => LANGUAGES.find(l => language.includes(l.code))?.code || LANGUAGES[0].code;

    return {
        changeLanguage,
        currentLanguage,
        LANGUAGES,
        getLanguageCode
    }
}

export default useLanguage;