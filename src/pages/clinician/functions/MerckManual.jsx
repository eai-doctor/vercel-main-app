import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { BooksIcon, AlertIcon } from "@/components/ui/icons";
import functionApi from "@/api/functionApi";
import { NavBar } from "@/components";

function ExternalApiNotice({ service, onDismiss }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
          <AlertIcon className="w-4 h-4 text-slate-600" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-slate-800 mb-1">
            External Clinical Reference Access
          </p>

          <p className="text-[12px] text-slate-700 leading-relaxed">
            This feature retrieves medical reference information from{" "}
            <strong>{service}</strong>. Search queries may be transmitted to
            external servers to provide relevant clinical content.
          </p>

          <p className="text-[12px] text-slate-700 leading-relaxed mt-1">
            To maintain patient confidentiality, avoid including identifiable
            patient information (e.g., name, MRN, date of birth) in search inputs.
          </p>

          <p className="text-[11px] text-slate-500 mt-2">
            Use of this feature should align with applicable privacy regulations
            (e.g., Law 25, PIPEDA) and institutional policies.
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 text-[18px] leading-none shrink-0 mt-0.5"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function MerckManual() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const iframeRef = useRef(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  
  useEffect(() => {
     window.scrollTo(0, 0)
   }, [])

  // HTML이 바뀔 때마다 iframe에 직접 주입
  useEffect(() => {
    if (!htmlContent || !iframeRef.current) return;
    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      setLoading(false);
    }
  }, [htmlContent]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError(t('functions:merckManual.enterSearchTerm', 'Please enter a search term'));
      return;
    }
    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      const response = await functionApi.getMerk(searchTerm);

      // API가 { data: "<html>..." } 형태로 반환하는 경우 처리
      const html = response?.data ?? response;

      if (typeof html !== 'string' || !html.trim()) {
        throw new Error('No content received from Merck Manual');
      }

      setHtmlContent(html);
    } catch (err) {
      console.error("Error searching Merck Manual:", err);
      setError(err.message || t('functions:merckManual.searchFailed', 'Failed to search. Please try again.'));
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setSearchTerm("");
    setHtmlContent("");
    setHasSearched(false);
    setError("");
  };

  const suggestions = [
    "Diabetes Mellitus", "Hypertension", "Pneumonia",
    "Acute Coronary Syndrome", "COPD", "Heart Failure",
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Law 25 Notice Banner */}
        {!noticeDismissed && (
          <ExternalApiNotice
            service="MerkManual"
            onDismiss={() => setNoticeDismissed(true)}
          />
        )}

        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <BooksIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
            </div>
            <h2 className="text-[17px] font-semibold text-slate-800">
              {t('functions:merckManual.searchMedicalTopics', 'Search Medical Topics')}
            </h2>
          </div>

          <div className="p-5">
            <p className="text-[14px] text-slate-500 mb-4">
              {t('functions:merckManual.searchDescription', 'Search the Merck Manual Professional for comprehensive medical information including symptoms, diagnosis, and treatment guidelines.')}
            </p>

            {/* Input row */}
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('functions:merckManual.searchPlaceholder', 'e.g. Hypertension, Diabetes...')}
                className="flex-1 px-4 py-3 text-[14px] border border-slate-200 rounded-xl
                  focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
                  text-slate-900 placeholder:text-slate-400 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px]
                  font-semibold rounded-xl transition-colors disabled:opacity-50
                  disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {t('functions:merckManual.searching', 'Searching...')}
                  </>
                ) : (
                  t('common:buttons.search', 'Search')
                )}
              </button>
              {hasSearched && (
                <button
                  onClick={handleClear}
                  className="px-5 py-3 text-[14px] font-semibold text-slate-600 bg-slate-50
                    border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  {t('common:buttons.clear', 'Clear')}
                </button>
              )}
            </div>

            {/* Quick suggestions */}
            {!hasSearched && (
              <div className="mt-4">
                <p className="text-[12px] text-slate-400 uppercase tracking-wide mb-2">
                  {t('functions:merckManual.quickSearch', 'Quick search')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSearchTerm(s)}
                      className="px-3 py-1 text-[12px] font-semibold bg-[#eef2ff]
                        text-[#2C3B8D] rounded-full border border-[#c7d2f8]
                        hover:bg-[#e0e7ff] transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-[14px] text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results — iframe with injected HTML */}
        {hasSearched && !error && htmlContent && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-[#2C3B8D] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <p className="text-[14px] text-slate-500">
                    {t('functions:merckManual.loadingContent', 'Loading Merck Manual content...')}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-1">
                    {t('functions:merckManual.loadingNote', 'This may take 10-30 seconds on first load')}
                  </p>
                </div>
              </div>
            )}

            {/* Header bar */}
            <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
                <BooksIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-slate-800">Merck Manual Results</p>
                <p className="text-[12px] text-slate-400">"{searchTerm}"</p>
              </div>
            </div>

            {/* iframe — HTML 직접 주입 */}
            <iframe
              ref={iframeRef}
              title="Merck Manual Search Results"
              className="w-full border-0"
              style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}
            />
          </div>
        )}

        {/* Loading state before results */}
        {hasSearched && !error && !htmlContent && loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <svg className="animate-spin h-10 w-10 text-[#2C3B8D] mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-[14px] text-slate-500">
              {t('functions:merckManual.loadingContent', 'Loading Merck Manual content...')}
            </p>
          </div>
        )}

        {/* Initial state */}
        {!hasSearched && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-5">
              <BooksIcon className="w-8 h-8 text-[#2C3B8D]" />
            </div>
            <h3 className="text-[18px] font-semibold text-slate-800 mb-2">
              {t('functions:merckManual.professionalTitle', 'Merck Manual Professional')}
            </h3>
            <p className="text-[14px] text-slate-500 max-w-xl mx-auto mb-6">
              {t('functions:merckManual.professionalDescription', 'Access comprehensive, peer-reviewed medical information from the Merck Manual.')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[13px] text-slate-500">
              {[
                { label: t('functions:merckManual.peerReviewed', 'Peer-reviewed content') },
                { label: t('functions:merckManual.professionalEdition', 'Professional edition') },
                { label: t('functions:merckManual.fullTextSearch', 'Full-text search') },
              ].map(({ label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#eef2ff] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2C3B8D]" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default MerckManual;