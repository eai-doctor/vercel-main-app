import React from "react";

export default function RecordCard({ data, onEdit, onDelete, t }) {
  // secondary 문자열 형태 ("Status: active", "Criticality: high · Substance: ...") 에서 status 추출
  const statusMatch = data.secondary?.match(/Status:\s*([^\s·]+)/i);
  const status = statusMatch ? statusMatch[1] : null;
  const isPositive =
    status === "active" ||
    status === "completed" ||
    status === "resolved";

  const detail = data.secondary
    ? data.secondary.replace(/^Status:\s*[^\s·]+\s*·?\s*/i, "").trim()
    : "";
  
  return (
    <div className="group flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#f8faff] transition-colors">
      <div className="flex-1 min-w-0">
        <h4 className="text-[14px] font-semibold text-slate-900 truncate">
          {data.primary}
        </h4>
        {detail && (
          <p className="text-[12px] text-slate-500 mt-0.5 truncate">
            {detail}
          </p>
        )}
        {data.notes && (
          <p className="text-[12px] text-slate-500 mt-0.5 italic line-clamp-1">
            {data.notes}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {status && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        )}
        {data.date && (
          <span className="hidden sm:inline text-[12px] text-slate-500 whitespace-nowrap">
            {data.date}
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="cursor-pointer inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            {t('common:edit', 'Edit')}
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors"
          >
            {t('common:delete', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
