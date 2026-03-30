import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import axios from "axios";
import config from "./config";
import Header from "./components/Header";
import { PillIcon } from "./components/icons";

function DrugBank() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchType, setSearchType] = useState("brand_name");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInfo, setSearchInfo] = useState(null);

  const API_URL = config.dpdServiceUrl;

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError(t('common:errors.enterSearchTerm'));
      return;
    }

    try {
      setLoading(true);
      setError("");
      setProducts([]);
      setSelectedProduct(null);
      setSelectedProductDetails(null);
      setSearchInfo(null);

      const body = {
        [searchType]: searchTerm.trim(),
        limit: 50,
        store: false,
        include_raw: false,
      };

      const response = await axios.post(`${API_URL}/dpd/lookup`, body);

      if (response.data.products?.length > 0) {
        setProducts(response.data.products);
        setSearchInfo({ count: response.data.count });
      } else {
        setProducts([]);
        setSearchInfo({ count: 0 });
      }
    } catch (err) {
      console.error("Error searching DPD:", err);
      const detail = err.response?.data?.detail;
      setError(detail || t('common:errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setSelectedProductDetails(null);
    if (!product.drug_code) return;
    try {
      setDetailLoading(true);
      const response = await axios.get(`${API_URL}/dpd/product/${product.drug_code}`);
      setSelectedProductDetails(response.data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      // Fall back to basic product info already in the list
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toLowerCase();
    if (s.includes("marketed")) return "bg-green-100 text-green-700";
    if (s.includes("approved")) return "bg-blue-100 text-blue-700";
    if (s.includes("cancelled")) return "bg-red-100 text-red-700";
    if (s.includes("dormant")) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return "N/A";
    return ingredients
      .map((ai) => {
        let text = ai.name || "Unknown";
        if (ai.strength && ai.strength_unit) text += ` ${ai.strength} ${ai.strength_unit}`;
        else if (ai.strength) text += ` ${ai.strength}`;
        return text;
      })
      .join(", ");
  };

  const suggestions = [
    { label: "Tylenol", type: "brand_name" },
    { label: "Aspirin", type: "brand_name" },
    { label: "Metformin", type: "active_ingredient" },
    { label: "Amoxicillin", type: "active_ingredient" },
    { label: "Atorvastatin", type: "active_ingredient" },
    { label: "Lisinopril", type: "active_ingredient" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:drugBank.title')}
        subtitle={t('functions:drugBank.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#1e293b] mb-4">{t('functions:drugBank.searchTitle')}</h2>
          <p className="text-[#475569] mb-4">
            {t('functions:drugBank.searchDescription')}
          </p>

          <div className="space-y-4">
            {/* Search Type Selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: "brand_name", label: t('functions:drugBank.brandName') },
                { value: "active_ingredient", label: t('functions:drugBank.activeIngredient') },
                { value: "din", label: t('functions:drugBank.din') },
                { value: "company", label: t('functions:drugBank.manufacturer') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSearchType(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    searchType === opt.value
                      ? "bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white shadow-md"
                      : "bg-[#f8fafc] text-[#475569] border border-[rgba(15,23,42,0.1)] hover:border-[rgba(59,130,246,0.4)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  searchType === "din"
                    ? t('functions:drugBank.placeholderDin')
                    : searchType === "brand_name"
                    ? t('functions:drugBank.placeholderBrand')
                    : searchType === "active_ingredient"
                    ? t('functions:drugBank.placeholderIngredient')
                    : t('functions:drugBank.placeholderManufacturer')
                }
                className="flex-1 border border-[rgba(15,23,42,0.1)] rounded-lg px-4 py-3 focus:outline-none focus:border-[#3b82f6] transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-[linear-gradient(135deg,#60a5fa,#3b82f6,#2563eb)] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 btn-glow"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common:states.searching')}
                  </span>
                ) : (
                  t('common:buttons.search')
                )}
              </button>
            </div>

            {/* Quick Search Suggestions */}
            {!searchInfo && (
              <div>
                <p className="text-sm text-[#64748b] mb-2">{t('common:labels.quickSearch')}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        setSearchType(s.type);
                        setSearchTerm(s.label);
                      }}
                      className="px-3 py-1 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] text-sm rounded-full hover:bg-[rgba(59,130,246,0.15)] transition-colors border border-[rgba(59,130,246,0.2)]"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
              {t('functions:drugBank.foundProducts', { count: searchInfo.count })}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6] mx-auto mb-4"></div>
            <p className="text-[#475569]">{t('functions:drugBank.searchingDatabase')}</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-[#1e293b]">{t('common:labels.results')}</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {products.map((product, idx) => (
                  <button
                    key={product.din || idx}
                    onClick={() => handleProductSelect(product)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedProduct?.din === product.din && selectedProduct?.drug_code === product.drug_code
                        ? "border-[#3b82f6] bg-[rgba(59,130,246,0.08)] shadow-md"
                        : "border-[rgba(15,23,42,0.1)] bg-white hover:border-[rgba(59,130,246,0.4)] hover:shadow"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-[#1e293b] line-clamp-1">
                        {product.brand_name || "Unknown"}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${getStatusColor(product.status)}`}>
                        {product.status || "Unknown"}
                      </span>
                    </div>
                    {product.strength_text && (
                      <p className="text-sm text-[#3b82f6] font-medium mb-1">{product.strength_text}</p>
                    )}
                    <p className="text-sm text-[#475569] line-clamp-1 mb-1">
                      {formatIngredients(product.active_ingredients)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#64748b]">
                      <span>{product.dosage_form || ""}</span>
                      <span>DIN: {product.din || "N/A"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">{t('functions:drugBank.drugDetails')}</h3>
              {selectedProduct ? (
                <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-6 border border-[rgba(15,23,42,0.1)] max-h-[600px] overflow-y-auto">
                  {detailLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3b82f6] mb-3"></div>
                      <p className="text-[#475569] text-sm">Loading details...</p>
                    </div>
                  ) : (() => {
                  const detail = selectedProductDetails || selectedProduct;
                  return (<>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-[#1e293b]">
                        {detail.brand_name}
                      </h4>
                      {detail.generic_name && (
                        <p className="text-sm text-[#475569] italic">{detail.generic_name}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(detail.status)}`}>
                      {detail.status}
                    </span>
                  </div>

                  <div className="space-y-4 text-sm">
                    {/* DIN & Drug Code */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.din')}</span>
                        <span className="text-[#475569]">{detail.din || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.drugCode')}</span>
                        <span className="text-[#475569]">{detail.drug_code || "N/A"}</span>
                      </div>
                    </div>

                    {/* Active Ingredients */}
                    {detail.active_ingredients?.length > 0 && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-2">{t('functions:drugBank.activeIngredients')}</span>
                        <div className="space-y-1">
                          {detail.active_ingredients.map((ai, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-[#f8fafc] rounded-lg px-3 py-2">
                              <span className="text-[#475569] font-medium">{ai.name}</span>
                              <span className="text-[#3b82f6] font-medium">
                                {ai.strength && ai.strength_unit
                                  ? `${ai.strength} ${ai.strength_unit}`
                                  : ai.strength || ""}
                                {ai.dosage_unit ? ` ${ai.dosage_unit}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dosage & Route */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[rgba(15,23,42,0.1)]">
                      <div>
                        <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.dosageForm')}</span>
                        <span className="text-[#475569]">{detail.dosage_form || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.route')}</span>
                        <span className="text-[#475569]">{detail.route || "N/A"}</span>
                      </div>
                    </div>

                    {/* Manufacturer */}
                    <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                      <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.manufacturer')}</span>
                      <span className="text-[#475569]">{detail.manufacturer || "N/A"}</span>
                    </div>

                    {/* Schedules */}
                    {detail.schedules?.length > 0 && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-2">{t('functions:drugBank.schedules')}</span>
                        <div className="flex flex-wrap gap-1">
                          {detail.schedules.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[rgba(59,130,246,0.08)] text-[#3b82f6] rounded text-xs font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Therapeutic Class */}
                    {detail.therapeutic_class && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-2">{t('functions:drugBank.therapeuticClassification')}</span>
                        <div className="space-y-1 text-[#475569]">
                          {detail.therapeutic_class.tc_atc_number && (
                            <p><span className="font-medium">ATC:</span> {detail.therapeutic_class.tc_atc_number} {detail.therapeutic_class.tc_atc ? `- ${detail.therapeutic_class.tc_atc}` : ""}</p>
                          )}
                          {detail.therapeutic_class.tc_ahfs_number && (
                            <p><span className="font-medium">AHFS:</span> {detail.therapeutic_class.tc_ahfs_number} {detail.therapeutic_class.tc_ahfs ? `- ${detail.therapeutic_class.tc_ahfs}` : ""}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pharmaceutical Standard */}
                    {detail.pharmaceutical_standard && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.pharmaceuticalStandard')}</span>
                        <span className="text-[#475569]">{detail.pharmaceutical_standard}</span>
                      </div>
                    )}

                    {/* Packages */}
                    {detail.packages?.length > 0 && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-2">{t('functions:drugBank.packaging')}</span>
                        <div className="space-y-1">
                          {detail.packages.map((pkg, idx) => (
                            <div key={idx} className="bg-[#f8fafc] rounded-lg px-3 py-2 text-[#475569]">
                              {pkg.package_size && pkg.package_size_unit
                                ? `${pkg.package_size} ${pkg.package_size_unit}`
                                : pkg.package_size || ""}
                              {pkg.package_type ? ` (${pkg.package_type})` : ""}
                              {pkg.upc ? ` - UPC: ${pkg.upc}` : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Detail */}
                    {detail.status_detail && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-2">{t('functions:drugBank.statusDetails')}</span>
                        <div className="space-y-1 text-[#475569]">
                          {detail.status_detail.original_market_date && (
                            <p><span className="font-medium">{t('functions:drugBank.marketDate')}:</span> {detail.status_detail.original_market_date}</p>
                          )}
                          {detail.status_detail.history_date && (
                            <p><span className="font-medium">{t('functions:drugBank.historyDate')}:</span> {detail.status_detail.history_date}</p>
                          )}
                          {detail.status_detail.expiration_date && (
                            <p><span className="font-medium">{t('functions:drugBank.expiration')}:</span> {detail.status_detail.expiration_date}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    {detail.last_update_date && (
                      <div className="pt-3 border-t border-[rgba(15,23,42,0.1)]">
                        <span className="font-semibold text-[#1e293b] block mb-1">{t('functions:drugBank.lastUpdated')}</span>
                        <span className="text-[#475569]">{detail.last_update_date}</span>
                      </div>
                    )}
                  </div>
                  </>);
                  })()}
                </div>
              ) : (
                <div className="bg-[#f8fafc] rounded-xl p-8 text-center border border-[rgba(15,23,42,0.1)]">
                  <div className="mb-3 flex justify-center"><PillIcon className="w-12 h-12 text-[#3b82f6]" /></div>
                  <p className="text-[#475569]">{t('functions:drugBank.selectProduct')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && searchInfo && (
          <div className="text-center py-12">
            <div className="mb-4 flex justify-center"><PillIcon className="w-12 h-12 text-[#3b82f6]" /></div>
            <p className="text-[#475569]">{t('functions:drugBank.noProductsFound')}</p>
            <p className="text-[#64748b] text-sm mt-2">{t('functions:drugBank.tryDifferentSearch')}</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !searchInfo && (
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] p-12 text-center border border-[rgba(15,23,42,0.1)]">
            <div className="mb-6 flex justify-center"><PillIcon className="w-12 h-12 text-[#3b82f6]" /></div>
            <h3 className="text-2xl font-bold text-[#1e293b] mb-4">{t('functions:drugBank.databaseTitle')}</h3>
            <p className="text-[#475569] max-w-2xl mx-auto mb-6">
              {t('functions:drugBank.databaseDescription')}
            </p>
            <div className="flex justify-center gap-4 text-sm text-[#64748b]">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('functions:drugBank.featureOfficialData')}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                {t('functions:drugBank.featureIngredients')}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('functions:drugBank.featureSearch')}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DrugBank;
