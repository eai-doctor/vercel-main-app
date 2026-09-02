import { useTranslation } from "react-i18next";

export default function LoadingScreen () {
    const { t } = useTranslation('common');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50">
            <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('states.loading')}</p>
            </div>
        </div>
    )
}

