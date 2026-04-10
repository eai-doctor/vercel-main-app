import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Header, ExternalApiNotice } from "@/components";
import { PillIcon, AlertIcon } from "@/components/ui/icons";
import functionApi from "@/api/functionApi";


function HealthCanadaDrugBank() {
  const { t } = useTranslation(['functions', 'common']);
  const [searchType, setSearchType] = useState("brand_name");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInfo, setSearchInfo] = useState(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

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
      setSearchInfo(null);

      const body = {
        [searchType]: searchTerm.trim(),
        limit: 50,
        store: false,
        include_raw: false,
      };

      const response = await functionApi.getDrugBank(body);

      if (response.data.products?.length > 0) {
        setProducts(response.data.products);
        setSearchInfo({ count: response.data.count });
      } else {
        setProducts([]);
        setSearchInfo({ count: 0 });
      }
    } catch (err) {
      console.error("Error searching DPD:", err);
      setError(err.response?.data?.detail || t('common:errors.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch(); };

  const getStatusColor = (status) => {
    if (!status) return "bg-slate-100 text-slate-500";
    const s = status.toLowerCase();
    if (s.includes("marketed")) return "bg-green-100 text-green-700";
    if (s.includes("approved")) return "bg-blue-100 text-blue-700";
    if (s.includes("cancelled")) return "bg-red-100 text-red-700";
    if (s.includes("dormant")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-500";
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return "N/A";
    return ingredients.map((ai) => {
      let text = ai.name || "Unknown";
      if (ai.strength && ai.strength_unit) text += ` ${ai.strength} ${ai.strength_unit}`;
      else if (ai.strength) text += ` ${ai.strength}`;
      return text;
    }).join(", ");
  };

  const suggestions = [
    { label: "Tylenol", type: "brand_name" },
    { label: "Aspirin", type: "brand_name" },
    { label: "Metformin", type: "active_ingredient" },
    { label: "Amoxicillin", type: "active_ingredient" },
    { label: "Atorvastatin", type: "active_ingredient" },
    { label: "Lisinopril", type: "active_ingredient" },
  ];

  const searchTypeOptions = [
    { value: "brand_name", label: t('functions:drugBank.brandName', 'Brand Name') },
    { value: "active_ingredient", label: t('functions:drugBank.activeIngredient', 'Active Ingredient') },
    { value: "din", label: t('functions:drugBank.din', 'DIN') },
    { value: "company", label: t('functions:drugBank.manufacturer', 'Manufacturer') },
  ];

  const getPlaceholder = () => {
    if (searchType === "din") return t('functions:drugBank.placeholderDin', 'e.g. 02229101');
    if (searchType === "brand_name") return t('functions:drugBank.placeholderBrand', 'e.g. Tylenol');
    if (searchType === "active_ingredient") return t('functions:drugBank.placeholderIngredient', 'e.g. Metformin');
    return t('functions:drugBank.placeholderManufacturer', 'e.g. Pfizer');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={t('functions:drugBank.title')}
        subtitle={t('functions:drugBank.subtitle')}
        showBackButton={true}
        backRoute="/function-libraries"
      />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Law 25 / PIPEDA Notice */}
        {!noticeDismissed && (
          <ExternalApiNotice
            service="Health Canada Drug Product Database (DPD)"
            onDismiss={() => setNoticeDismissed(true)}
            subject="External Medical Database Notice"
          />
        )}

        {/* Search Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center gap-3 px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
            <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
              <PillIcon className="w-[18px] h-[18px] text-[#2C3B8D]" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-slate-800">
                {t('functions:drugBank.searchTitle', 'Health Canada Drug Search')}
              </h2>
              <p className="text-[11px] text-slate-400">Health Canada DPD — External API</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-[14px] text-slate-500">
              {t('functions:drugBank.searchDescription', 'Search the Health Canada Drug Product Database for authorized drug products.')}
            </p>

            {/* Search type tabs */}
            <div className="flex flex-wrap gap-2">
              {searchTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSearchType(opt.value)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors
                    ${searchType === opt.value
                      ? 'bg-[#2C3B8D] text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={getPlaceholder()}
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

            {/* Quick suggestions */}
            {!searchInfo && (
              <div>
                <p className="text-[12px] text-slate-400 uppercase tracking-wide mb-2">
                  {t('common:labels.quickSearch', 'Quick search')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => { setSearchType(s.type); setSearchTerm(s.label); }}
                      className="px-3 py-1 text-[12px] font-semibold bg-[#eef2ff]
                        text-[#2C3B8D] rounded-full border border-[#c7d2f8]
                        hover:bg-[#e0e7ff] transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
              {searchInfo.count.toLocaleString()} products
            </span>
            <p className="text-[13px] text-slate-600">
              {t('functions:drugBank.foundProducts', { count: searchInfo.count })}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-[#2C3B8D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] text-slate-500">
              {t('functions:drugBank.searchingDatabase', 'Searching Health Canada database...')}
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Product list */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 mb-3">
                {t('common:labels.results', 'Results')}
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {products.map((product, idx) => (
                  <button
                    key={product.din || idx}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors
                      ${selectedProduct?.din === product.din && selectedProduct?.drug_code === product.drug_code
                        ? 'border-[#2C3B8D] bg-[#eef2ff]'
                        : 'border-slate-200 bg-white hover:bg-[#f8faff] hover:border-[#c7d2f8]'}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[14px] font-semibold text-slate-900 line-clamp-1">
                        {product.brand_name || "Unknown"}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0 ${getStatusColor(product.status)}`}>
                        {product.status || "Unknown"}
                      </span>
                    </div>
                    {product.strength_text && (
                      <p className="text-[12px] text-[#2C3B8D] font-semibold mb-1">{product.strength_text}</p>
                    )}
                    <p className="text-[12px] text-slate-500 line-clamp-1 mb-1">
                      {formatIngredients(product.active_ingredients)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{product.dosage_form || ""}</span>
                      <span className="text-[11px] font-mono text-slate-400">DIN: {product.din || "N/A"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product detail */}
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 mb-3">
                {t('functions:drugBank.drugDetails', 'Drug Details')}
              </h3>

              {selectedProduct ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
                  {/* Detail header */}
                  <div className="px-5 py-4 bg-[#f5f7ff] border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[15px] font-semibold text-slate-900">
                          {selectedProduct.brand_name}
                        </p>
                        {selectedProduct.generic_name && (
                          <p className="text-[12px] text-slate-400 italic mt-0.5">{selectedProduct.generic_name}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${getStatusColor(selectedProduct.status)}`}>
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">

                    {/* DIN + Drug Code */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: t('functions:drugBank.din', 'DIN'), value: selectedProduct.din || "N/A" },
                        { label: t('functions:drugBank.drugCode', 'Drug Code'), value: selectedProduct.drug_code || "N/A" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                          <p className="text-[13px] font-semibold text-slate-800 font-mono">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Active Ingredients */}
                    {selectedProduct.active_ingredients?.length > 0 && (
                      <div className="[&+&]:border-t [&+&]:border-slate-100 pt-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-2">
                          {t('functions:drugBank.activeIngredients', 'Active Ingredients')}
                        </p>
                        <div className="space-y-1.5">
                          {selectedProduct.active_ingredients.map((ai, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                              <span className="text-[13px] text-slate-700 font-medium">{ai.name}</span>
                              <span className="text-[12px] font-semibold text-[#2C3B8D]">
                                {ai.strength && ai.strength_unit ? `${ai.strength} ${ai.strength_unit}` : ai.strength || ""}
                                {ai.dosage_unit ? ` ${ai.dosage_unit}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dosage & Route */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      {[
                        { label: t('functions:drugBank.dosageForm', 'Dosage Form'), value: selectedProduct.dosage_form || "N/A" },
                        { label: t('functions:drugBank.route', 'Route'), value: selectedProduct.route || "N/A" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">{label}</p>
                          <p className="text-[13px] text-slate-700">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Manufacturer */}
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
                        {t('functions:drugBank.manufacturer', 'Manufacturer')}
                      </p>
                      <p className="text-[13px] text-slate-700">{selectedProduct.manufacturer || "N/A"}</p>
                    </div>

                    {/* Schedules */}
                    {selectedProduct.schedules?.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-2">
                          {t('functions:drugBank.schedules', 'Schedules')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProduct.schedules.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 bg-[#eef2ff] text-[#2C3B8D] text-[11px] font-semibold rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Therapeutic Class */}
                    {selectedProduct.therapeutic_class && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-2">
                          {t('functions:drugBank.therapeuticClassification', 'Therapeutic Classification')}
                        </p>
                        <div className="space-y-1 text-[13px] text-slate-700">
                          {selectedProduct.therapeutic_class.tc_atc_number && (
                            <p>
                              <span className="font-semibold text-slate-500">ATC: </span>
                              {selectedProduct.therapeutic_class.tc_atc_number}
                              {selectedProduct.therapeutic_class.tc_atc ? ` — ${selectedProduct.therapeutic_class.tc_atc}` : ""}
                            </p>
                          )}
                          {selectedProduct.therapeutic_class.tc_ahfs_number && (
                            <p>
                              <span className="font-semibold text-slate-500">AHFS: </span>
                              {selectedProduct.therapeutic_class.tc_ahfs_number}
                              {selectedProduct.therapeutic_class.tc_ahfs ? ` — ${selectedProduct.therapeutic_class.tc_ahfs}` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Packages */}
                    {selectedProduct.packages?.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-2">
                          {t('functions:drugBank.packaging', 'Packaging')}
                        </p>
                        <div className="space-y-1.5">
                          {selectedProduct.packages.map((pkg, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-xl px-3 py-2 text-[12px] text-slate-600">
                              {pkg.package_size && pkg.package_size_unit ? `${pkg.package_size} ${pkg.package_size_unit}` : pkg.package_size || ""}
                              {pkg.package_type ? ` (${pkg.package_type})` : ""}
                              {pkg.upc ? ` · UPC: ${pkg.upc}` : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Detail */}
                    {selectedProduct.status_detail && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-2">
                          {t('functions:drugBank.statusDetails', 'Status Details')}
                        </p>
                        <div className="space-y-1 text-[13px] text-slate-700">
                          {selectedProduct.status_detail.original_market_date && (
                            <p><span className="font-medium text-slate-500">Market Date: </span>{selectedProduct.status_detail.original_market_date}</p>
                          )}
                          {selectedProduct.status_detail.history_date && (
                            <p><span className="font-medium text-slate-500">History Date: </span>{selectedProduct.status_detail.history_date}</p>
                          )}
                          {selectedProduct.status_detail.expiration_date && (
                            <p><span className="font-medium text-slate-500">Expiration: </span>{selectedProduct.status_detail.expiration_date}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    {selectedProduct.last_update_date && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-1">
                          {t('functions:drugBank.lastUpdated', 'Last Updated')}
                        </p>
                        <p className="text-[13px] text-slate-500 font-mono">{selectedProduct.last_update_date}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-3">
                    <PillIcon className="w-6 h-6 text-[#2C3B8D]" />
                  </div>
                  <p className="text-[14px] text-slate-400">
                    {t('functions:drugBank.selectProduct', 'Select a product to view details')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && searchInfo && (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-3">
              <PillIcon className="w-6 h-6 text-[#2C3B8D]" />
            </div>
            <p className="text-[14px] text-slate-500">{t('functions:drugBank.noProductsFound', 'No products found')}</p>
            <p className="text-[12px] text-slate-400 mt-1">{t('functions:drugBank.tryDifferentSearch', 'Try a different search term')}</p>
          </div>
        )}

        {/* Initial */}
        {!loading && !searchInfo && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#e6ecff] flex items-center justify-center mx-auto mb-4">
              <PillIcon className="w-7 h-7 text-[#2C3B8D]" />
            </div>
            <h3 className="text-[18px] font-semibold text-slate-800 mb-2">
              {t('functions:drugBank.databaseTitle', 'Health Canada Drug Product Database')}
            </h3>
            <p className="text-[14px] text-slate-500 max-w-xl mx-auto mb-6">
              {t('functions:drugBank.databaseDescription', 'Search Health Canada authorized drug products by brand name, active ingredient, DIN, or manufacturer.')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-[13px] text-slate-500">
              {[
                t('functions:drugBank.featureOfficialData', 'Official Health Canada data'),
                t('functions:drugBank.featureIngredients', 'Active ingredient details'),
                t('functions:drugBank.featureSearch', 'Multi-field search'),
              ].map((label) => (
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

export default HealthCanadaDrugBank;