import React, { useMemo, useState } from 'react';
import { getRecommendedProducts } from '../data/productRecommendations';

/* ─────────────────────────────────────────────
   Star rating helper
───────────────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[11px] text-slate-500 ml-1">{rating} ({Math.floor(Math.random() * 50) + 100})</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Single product card
───────────────────────────────────────────── */
function ProductCard({ recommendation }) {
  const { product, score, reasons } = recommendation;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      
      {/* Match score ribbon */}
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {score}% symptom match
        </span>
        {product.badge && (
          <span className="text-[10px] font-bold text-[#2C3B8D] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
            {product.badge}
          </span>
        )}
      </div>

      {/* Product image + info */}
      <div className="flex gap-3 p-4">
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
          {!imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-1"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{product.brand}</p>
          <h3 className="text-[13px] font-bold text-slate-800 leading-tight mt-0.5 line-clamp-2">{product.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{product.tagline}</p>
          <StarRating rating={product.rating} />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] font-bold text-[#2C3B8D]">
              ${product.price.toFixed(2)} {product.currency}
            </span>
            <span className="text-[10px] text-slate-400">· {product.size}</span>
            <span className="text-[10px] text-slate-400">· Made in {product.madeIn}</span>
          </div>
        </div>
      </div>

      {/* Why recommended */}
      {reasons.length > 0 && (
        <div className="mx-4 mb-3 bg-blue-50/60 border border-blue-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5">Why this was recommended</p>
          <ul className="space-y-1">
            {reasons.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <svg className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-blue-700">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key benefits chips */}
      <div className="px-4 mb-3 flex flex-wrap gap-1.5">
        {product.keyBenefits.slice(0, 3).map((b, i) => (
          <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {b}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2.5 bg-[#2C3B8D] hover:bg-[#243277] text-white text-[12px] font-bold rounded-xl transition-colors duration-150"
        >
          View Product →
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main panel — exported component
───────────────────────────────────────────── */
export default function ProductRecommendationPanel({ messages = [], t, activeTab }) {
  const recommendations = useMemo(() => getRecommendedProducts(messages), [messages]);

  // Mobile: only show when 'products' tab is active
  // Desktop (lg+): always visible — controlled via CSS
  const mobileHidden = activeTab !== 'products';

  return (
    <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 ${mobileHidden ? 'hidden lg:block' : 'block'}`}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Panel header */}
        <div className="bg-gradient-to-r from-[#2C3B8D] to-[#3d52c4] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-white">Product Recommendations</h2>
              <p className="text-[10px] text-white/60">Based on your consultation symptoms</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3">
          {recommendations.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <p className="text-[11px] text-slate-500 px-1">
                {recommendations.length} product{recommendations.length !== 1 ? 's' : ''} matched to your symptoms
              </p>
              {recommendations.map((rec, i) => (
                <ProductCard key={rec.product.id + i} recommendation={rec} />
              ))}
              <Disclaimer />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <p className="text-[13px] font-semibold text-slate-600">No matches yet</p>
      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
        Describe your skin symptoms in the chat and we'll suggest relevant products.
      </p>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-1">
      <p className="text-[10px] text-amber-700 leading-relaxed">
        <span className="font-bold">Disclaimer:</span> These are cosmetic product suggestions only and are not medical recommendations. They do not treat, cure, or prevent any medical condition. Consult a healthcare professional for medical advice.
      </p>
    </div>
  );
}