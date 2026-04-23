import { useTranslation } from 'react-i18next';

export default function ClinicianBanner({ show, onClose }) {
  const { t } = useTranslation('common');
  if (!show) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-500 text-xl">⚠️</span>
          <div>
            <p className="text-[13px] font-semibold text-amber-800">
              {t('clinicianBanner.title')}
            </p>
            <p className="text-[12px] text-amber-700">
              {t('clinicianBanner.description')}{' '}
              <span className="underline font-semibold cursor-pointer hover:text-amber-900">
                {t('clinicianBanner.cta')}
              </span>
              {' '}{t('clinicianBanner.suffix')}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-100 hover:text-amber-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}