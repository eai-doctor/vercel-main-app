import React from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import Header from "./components/Header";

function GeneticConsult() {
  const { t } = useTranslation(['functions', 'common']);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:genetic.title')}
        subtitle={t('functions:genetic.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Embedded Angular Portal */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] overflow-hidden border border-[rgba(15,23,42,0.1)]" style={{ height: 'calc(100vh - 200px)' }}>
          <iframe
            src="https://vercel-genetic-frontend.vercel.app/dashboard"
            className="w-full h-full border-0"
            title="Genetic Report Assistant Portal"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-[rgba(59,130,246,0.08)] rounded-lg p-6 border border-[rgba(59,130,246,0.2)]">
          <h3 className="text-[#1e293b] font-semibold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('functions:genetic.howToUse')}
          </h3>
          <ul className="text-[#475569] text-sm space-y-2">
            <li>• {t('functions:genetic.uploadPrompt')}</li>
            <li>• {t('functions:genetic.aiAnalyzes')}</li>
            <li>• {t('functions:genetic.askQuestions')}</li>
            <li>• {t('functions:genetic.getInsights')}</li>
            <li>• {t('functions:genetic.viewDownload')}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default GeneticConsult;