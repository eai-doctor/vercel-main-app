import React, { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import config from "./config";
import Header from "./components/Header";
import { BooksIcon } from "./components/icons";

function MerckManual() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const iframeRef = useRef(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError(t('functions:merckManual.enterSearchTerm', 'Please enter a search term'));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      // Build direct URL to HF Spaces Merck service
      // Using query param for API key since iframes can't send headers
      const merckUrl = `${config.merckServiceUrl}/merck?query=${encodeURIComponent(searchTerm)}&key=${encodeURIComponent(config.merckApiKey)}`;

      // Set iframe src directly - the service returns fully rendered HTML
      // Loading will be set to false when iframe onLoad fires
      setIframeSrc(merckUrl);
    } catch (err) {
      console.error("Error searching Merck Manual:", err);
      setError(err.message || t('functions:merckManual.searchFailed', 'Failed to search. Please try again.'));
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setIframeSrc("");
    setHasSearched(false);
    setError("");
  };

  // Common medical search suggestions
  const suggestions = [
    "Diabetes Mellitus",
    "Hypertension",
    "Pneumonia",
    "Acute Coronary Syndrome",
    "COPD",
    "Heart Failure",
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:merckManual.title')}
        subtitle={t('functions:merckManual.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 mb-6 border border-[rgba(15,23,42,0.1)]">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-4">{t('functions:merckManual.searchMedicalTopics', 'Search Medical Topics')}</h2>
          <p className="text-[#475569] mb-4">
            {t('functions:merckManual.searchDescription', 'Search the Merck Manual Professional for comprehensive medical information including symptoms, diagnosis, and treatment guidelines.')}
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('functions:merckManual.searchPlaceholder')}
                className="w-full px-4 py-3 border border-[rgba(15,23,42,0.1)] rounded-lg focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-glow"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('functions:merckManual.searching', 'Searching...')}
                </span>
              ) : (
                t('common:buttons.search')
              )}
            </button>
            {hasSearched && (
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-[#f8fafc] text-[#1e293b] font-semibold rounded-lg border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)] transition-all"
              >
                {t('common:buttons.clear')}
              </button>
            )}
          </div>

          {/* Quick Search Suggestions */}
          {!hasSearched && (
            <div className="mt-4">
              <p className="text-sm text-[#64748b] mb-2">{t('functions:merckManual.quickSearch', 'Quick search')}:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setSearchTerm(suggestion);
                    }}
                    className="px-3 py-1 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] text-sm rounded-full hover:bg-[rgba(59,130,246,0.15)] transition-colors border border-[rgba(59,130,246,0.2)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Results iframe */}
        {hasSearched && !error && iframeSrc && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] overflow-hidden relative border border-[rgba(15,23,42,0.1)]">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-[#3b82f6] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-[#475569]">{t('functions:merckManual.loadingContent', 'Loading Merck Manual content...')}</p>
                  <p className="text-sm text-[#94a3b8] mt-2">{t('functions:merckManual.loadingNote', 'This may take 10-30 seconds on first load')}</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title="Merck Manual Search Results"
              className="w-full border-0"
              style={{ height: "calc(100vh - 350px)", minHeight: "600px" }}
              onLoad={() => setLoading(false)}
            />
          </div>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-12 text-center border border-[rgba(15,23,42,0.1)]">
            <div className="mb-6 flex justify-center"><BooksIcon className="w-12 h-12 text-[#3b82f6]" /></div>
            <h3 className="text-2xl font-bold text-[#1e293b] mb-4">{t('functions:merckManual.professionalTitle', 'Merck Manual Professional')}</h3>
            <p className="text-[#475569] max-w-2xl mx-auto mb-6">
              {t('functions:merckManual.professionalDescription', 'Access comprehensive, peer-reviewed medical information from the Merck Manual. Search for any medical topic to get detailed information about symptoms, diagnosis, treatment, and more.')}
            </p>
            <div className="flex justify-center gap-4 text-sm text-[#64748b]">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('functions:merckManual.peerReviewed', 'Peer-reviewed content')}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {t('functions:merckManual.professionalEdition', 'Professional edition')}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('functions:merckManual.fullTextSearch', 'Full-text search')}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MerckManual;