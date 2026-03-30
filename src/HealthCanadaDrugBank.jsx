import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "./config";
import Header from "./components/Header";
import { DocumentIcon, BooksIcon, MicroscopeIcon } from "./components/icons";

function HealthCanadaDrugBank() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInfo, setSearchInfo] = useState(null);

  const API_URL = config.backendUrl;

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

      const response = await axios.post(`${API_URL}/api/pubmed/search`, {
        keywords,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        max_results: 50,
      });

      if (response.data.success && response.data.pmids?.length > 0) {
        setSearchInfo({
          count: response.data.count,
          query: response.data.query_used,
        });

        const fetchResponse = await axios.post(`${API_URL}/api/pubmed/fetch`, {
          pmids: response.data.pmids.slice(0, 20),
        });

        if (fetchResponse.data.success) {
          setPapers(fetchResponse.data.papers || []);
        }
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return "Unknown authors";
    if (authors.length <= 3) {
      return authors.map((a) => a.full_name || `${a.last_name} ${a.initials}`).join(", ");
    }
    return `${authors[0].full_name || authors[0].last_name} et al.`;
  };

  const truncateAbstract = (abstract, maxLength = 300) => {
    if (!abstract) return "No abstract available";
    if (abstract.length <= maxLength) return abstract;
    return abstract.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:pubmed.title')}
        subtitle={t('functions:pubmed.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-4">{t('functions:pubmed.searchTitle')}</h2>
          <p className="text-[#475569] mb-4">
            {t('functions:pubmed.searchDescription')}
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('functions:pubmed.searchPlaceholder')}
                className="flex-1 border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6]"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 btn-glow"
              >
                {loading ? t('common:states.searching') : t('common:buttons.search')}
              </button>
            </div>

            {/* Year Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-[#475569]">{t('functions:pubmed.fromYear')}:</label>
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  placeholder="2020"
                  min="1900"
                  max="2026"
                  className="w-24 border border-[rgba(15,23,42,0.1)] rounded-lg px-3 py-2 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-[#475569]">{t('functions:pubmed.toYear')}:</label>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  placeholder="2026"
                  min="1900"
                  max="2026"
                  className="w-24 border border-[rgba(15,23,42,0.1)] rounded-lg px-3 py-2 focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Search Info */}
        {searchInfo && (
          <div className="bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)] rounded-lg p-4 mb-6">
            <p className="text-[#1e293b]">
              {t('functions:pubmed.foundResults', { count: searchInfo.count.toLocaleString() })}
              {searchInfo.count > 20 && ` (${t('functions:pubmed.showingFirst', { count: 20 })})`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
            <p className="text-[#475569]">{t('functions:pubmed.searchingPubmed')}</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && papers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Papers List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#1e293b]">{t('common:labels.results')}</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {papers.map((paper) => (
                  <button
                    key={paper.pmid}
                    onClick={() => setSelectedPaper(paper)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedPaper?.pmid === paper.pmid
                        ? "border-[#3b82f6] bg-[rgba(59,130,246,0.08)] shadow-md"
                        : "border-[rgba(15,23,42,0.1)] bg-white hover:border-[rgba(59,130,246,0.4)] hover:shadow"
                    }`}
                  >
                    <h4 className="font-semibold text-[#1e293b] line-clamp-2 mb-2">
                      {paper.title}
                    </h4>
                    <p className="text-sm text-[#475569] mb-1">
                      {formatAuthors(paper.authors)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#64748b]">
                      <span>{paper.journal}</span>
                      <span>{paper.year}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Details */}
            <div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">{t('functions:pubmed.paperDetails')}</h3>
              {selectedPaper ? (
                <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)]">
                  <h4 className="text-lg font-bold text-[#1e293b] mb-3">
                    {selectedPaper.title}
                  </h4>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-[#475569]">{t('functions:pubmed.authors')}: </span>
                      <span className="text-[#475569]">
                        {selectedPaper.authors?.map((a) => a.full_name || `${a.last_name} ${a.initials}`).join(", ") || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-[#475569]">{t('functions:pubmed.journal')}: </span>
                      <span className="text-[#475569]">{selectedPaper.journal || "N/A"}</span>
                    </div>

                    <div>
                      <span className="font-semibold text-[#475569]">{t('functions:pubmed.year')}: </span>
                      <span className="text-[#475569]">{selectedPaper.year || "N/A"}</span>
                    </div>

                    {selectedPaper.doi && (
                      <div>
                        <span className="font-semibold text-[#475569]">DOI: </span>
                        <a
                          href={`https://doi.org/${selectedPaper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#3b82f6] hover:underline"
                        >
                          {selectedPaper.doi}
                        </a>
                      </div>
                    )}

                    <div>
                      <span className="font-semibold text-[#475569]">PMID: </span>
                      <a
                        href={selectedPaper.pubmed_url || `https://pubmed.ncbi.nlm.nih.gov/${selectedPaper.pmid}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3b82f6] hover:underline"
                      >
                        {selectedPaper.pmid}
                      </a>
                    </div>

                    {selectedPaper.mesh_terms?.length > 0 && (
                      <div>
                        <span className="font-semibold text-[#475569]">{t('functions:pubmed.meshTerms')}: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPaper.mesh_terms.slice(0, 10).map((term, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] rounded text-xs"
                            >
                              {term}
                            </span>
                          ))}
                          {selectedPaper.mesh_terms.length > 10 && (
                            <span className="text-[#64748b] text-xs">
                              +{selectedPaper.mesh_terms.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                      <span className="font-semibold text-[#475569]">{t('functions:pubmed.abstract')}:</span>
                      <p className="text-[#475569] mt-2 leading-relaxed">
                        {selectedPaper.abstract || t('functions:pubmed.noAbstract')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[rgba(15,23,42,0.1)]">
                    <a
                      href={selectedPaper.pubmed_url || `https://pubmed.ncbi.nlm.nih.gov/${selectedPaper.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg font-semibold hover:opacity-90 transition-all btn-glow"
                    >
                      {t('functions:pubmed.viewOnPubmed')}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-[#f8fafc] rounded-xl p-8 text-center border border-[rgba(15,23,42,0.1)]">
                  <div className="mb-3 flex justify-center"><DocumentIcon className="w-12 h-12 text-[#3b82f6]" /></div>
                  <p className="text-[#475569]">{t('functions:pubmed.selectPaper')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && papers.length === 0 && searchInfo && (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center"><BooksIcon className="w-12 h-12 text-[#3b82f6]" /></div>
            <p className="text-[#475569]">{t('functions:pubmed.noPapersFound')}</p>
            <p className="text-[#64748b] text-sm mt-2">{t('functions:pubmed.tryDifferentKeywords')}</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !searchInfo && (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center"><MicroscopeIcon className="w-12 h-12 text-[#3b82f6]" /></div>
            <p className="text-[#475569]">{t('functions:pubmed.enterKeywords')}</p>
            <p className="text-[#64748b] text-sm mt-2">
              {t('functions:pubmed.searchAcrossMillions')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default HealthCanadaDrugBank;