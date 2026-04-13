import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Header from "@/components/Header";
import { DocumentIcon, BooksIcon, MicroscopeIcon, AlertIcon } from "@/components/ui/icons";
import functionApi from "@/api/functionApi";
import { NavBar, ExternalApiNotice } from "@/components";


function PubMed() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInfo, setSearchInfo] = useState(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  useEffect(() => {
     window.scrollTo(0, 0)
   }, [])

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError(t('common:errors.enterSearchTerm'));
      return;
    }
    try {
      setLoading(true);
      setError("");
      setPapers([]);
      setSelectedPaper(null);

      const keywords = searchTerm.split(",").map((k) => k.trim()).filter(Boolean);
      const filters = {};
      if (yearFrom) filters.year_from = parseInt(yearFrom);
      if (yearTo) filters.year_to = parseInt(yearTo);

      const response = await functionApi.getPubMed(
        keywords,
        Object.keys(filters).length > 0 ? filters : undefined
      );

      if (response.data.success && response.data.pmids?.length > 0) {
        setSearchInfo({ count: response.data.count, query: response.data.query_used });
        const fetchResponse = await functionApi.fetchPubMed(response.data.pmids.slice(0, 20));
        if (fetchResponse.data.success) setPapers(fetchResponse.data.papers || []);
      } else {
        setSearchInfo({ count: 0, query: searchTerm });
        setPapers([]);
      }
    } catch (err) {
      console.error("Error searching PubMed:", err);
      setError(err.response?.data?.error || t('common:errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch(); };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return "Unknown authors";
    if (authors.length <= 3) return authors.map((a) => a.full_name || `${a.last_name} ${a.initials}`).join(", ");
    return `${authors[0].full_name || authors[0].last_name} et al.`;
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Law 25 Notice Banner */}
        {!noticeDismissed && (
          <ExternalApiNotice
            service="PubMed (NCBI / NIH)"
            onDismiss={() => setNoticeDismissed(true)}
          />
        )}

        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <MicroscopeIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-slate-800">
                {t('functions:pubmed.searchTitle', 'PubMed Search')}
              </h2>
              <p className="text-[11px] text-slate-400">NCBI / NIH EXTERNAL API CONNECTED</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-[14px] text-slate-500">
              {t('functions:pubmed.searchDescription', 'Search millions of biomedical articles from PubMed.')}
            </p>

            {/* Search input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('functions:pubmed.searchPlaceholder', 'Keywords (comma-separated)...')}
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
                    {t('common:states.searching', 'Searching...')}
                  </>
                ) : t('common:buttons.search', 'Search')}
              </button>
            </div>

            {/* Year filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-[12px] text-slate-500 font-medium uppercase tracking-wide whitespace-nowrap">
                  {t('functions:pubmed.fromYear', 'From')}
                </label>
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  placeholder="2020"
                  min="1900" max="2026"
                  className="w-24 px-3 py-2 text-[13px] border border-slate-200 rounded-lg
                    focus:outline-none focus:border-[#2C3B8D] text-slate-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[12px] text-slate-500 font-medium uppercase tracking-wide whitespace-nowrap">
                  {t('functions:pubmed.toYear', 'To')}
                </label>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  placeholder="2026"
                  min="1900" max="2026"
                  className="w-24 px-3 py-2 text-[13px] border border-slate-200 rounded-lg
                    focus:outline-none focus:border-[#2C3B8D] text-slate-700"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Separate keywords with commas. Do not enter patient personal information.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-[14px] text-red-700">{error}</p>
          </div>
        )}

        {/* Search info */}
        {searchInfo && !loading && (
          <div className="bg-[#f5f7ff] border border-[#c7d2f8] rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#eef2ff] text-[#2C3B8D]">
              {searchInfo.count.toLocaleString()}
            </span>
            <p className="text-[13px] text-slate-600">
              Search Results {searchInfo.count > 20 && ` (Top20)`}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] text-slate-500">{t('functions:pubmed.searchingPubmed', 'Searching PubMed...')}</p>
          </div>
        )}

        {/* Results */}
        {!loading && papers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Paper list */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 mb-3">
                {t('common:labels.results', 'Results')}
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {papers.map((paper) => (
                  <button
                    key={paper.pmid}
                    onClick={() => setSelectedPaper(paper)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors
                      ${selectedPaper?.pmid === paper.pmid
                        ? 'border-[#2C3B8D] bg-[#eef2ff]'
                        : 'border-slate-200 bg-white hover:bg-[#f8faff] hover:border-[#c7d2f8]'
                      }`}
                  >
                    <p className="text-[14px] font-semibold text-slate-900 line-clamp-2 mb-1">
                      {paper.title}
                    </p>
                    <p className="text-[12px] text-slate-500 mb-1">{formatAuthors(paper.authors)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 truncate max-w-[60%]">{paper.journal}</span>
                      <span className="text-[11px] font-semibold text-[#2C3B8D] bg-[#eef2ff] px-2 py-0.5 rounded-full">
                        {paper.year}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper detail */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 mb-3">
                {t('functions:pubmed.paperDetails', 'Paper Details')}
              </h3>

              {selectedPaper ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Detail header */}
                  <div className="px-5 py-4 bg-[#f5f7ff] border-b border-slate-100">
                    <p className="text-[15px] font-semibold text-slate-900 leading-snug">
                      {selectedPaper.title}
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    {[
                      {
                        label: t('functions:pubmed.authors', 'Authors'),
                        value: selectedPaper.authors?.map((a) => a.full_name || `${a.last_name} ${a.initials}`).join(", ") || "N/A"
                      },
                      { label: t('functions:pubmed.journal', 'Journal'), value: selectedPaper.journal || "N/A" },
                      { label: t('functions:pubmed.year', 'Year'), value: selectedPaper.year || "N/A" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[64px] pt-0.5">
                          {label}
                        </span>
                        <span className="text-[13px] text-slate-700">{value}</span>
                      </div>
                    ))}

                    {selectedPaper.doi && (
                      <div className="flex gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[64px] pt-0.5">DOI</span>
                        <a href={`https://doi.org/${selectedPaper.doi}`} target="_blank" rel="noopener noreferrer"
                          className="text-[13px] text-[#2C3B8D] hover:underline break-all">
                          {selectedPaper.doi}
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 min-w-[64px] pt-0.5">PMID</span>
                      <a href={selectedPaper.pubmed_url || `https://pubmed.ncbi.nlm.nih.gov/${selectedPaper.pmid}/`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[13px] text-[#2C3B8D] hover:underline">
                        {selectedPaper.pmid}
                      </a>
                    </div>

                    {selectedPaper.mesh_terms?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1.5">
                          {t('functions:pubmed.meshTerms', 'MeSH Terms')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPaper.mesh_terms.slice(0, 10).map((term, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#eef2ff] text-[#2C3B8D] text-[11px] font-semibold rounded-full">
                              {term}
                            </span>
                          ))}
                          {selectedPaper.mesh_terms.length > 10 && (
                            <span className="text-[11px] text-slate-400">+{selectedPaper.mesh_terms.length - 10}</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1.5">
                        {t('functions:pubmed.abstract', 'Abstract')}
                      </p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">
                        {selectedPaper.abstract || t('functions:pubmed.noAbstract', 'No abstract available')}
                      </p>
                    </div>
                    
                    <a
                      href={selectedPaper.pubmed_url || `https://pubmed.ncbi.nlm.nih.gov/${selectedPaper.pmid}/`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2C3B8D] hover:bg-[#233070]
                        text-white text-[13px] font-semibold rounded-xl transition-colors mt-1"
                    >
                      {t('functions:pubmed.viewOnPubmed', 'View on PubMed')}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-3">
                    <DocumentIcon className="w-6 h-6 text-[#2C3B8D]" />
                  </div>
                  <p className="text-[14px] text-slate-400">
                    {t('functions:pubmed.selectPaper', 'Select a paper to view details')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && papers.length === 0 && searchInfo && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-3">
              <BooksIcon className="w-6 h-6 text-[#2C3B8D]" />
            </div>
            <p className="text-[14px] text-slate-500">{t('functions:pubmed.noPapersFound', 'No papers found')}</p>
            <p className="text-[12px] text-slate-400 mt-1">{t('functions:pubmed.tryDifferentKeywords', 'Try different keywords')}</p>
          </div>
        )}

        {/* Initial */}
        {!loading && !searchInfo && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-4">
              <MicroscopeIcon className="w-7 h-7 text-[#2C3B8D]" />
            </div>
            <p className="text-[15px] font-semibold text-slate-700 mb-1">
              {t('functions:pubmed.enterKeywords', 'Enter keywords to search')}
            </p>
            <p className="text-[13px] text-slate-400">
              {t('functions:pubmed.searchAcrossMillions', 'Search across millions of biomedical articles')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default PubMed;