// SectionCard.jsx
import React, { useState } from "react";
import RecordCard from "./RecordCard";

const COLLAPSE_LIMIT = 10;

export default function SectionCard({
  icon,
  title,
  records = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  emptyText,
  t,
}) {
  const [expanded, setExpanded] = useState(false);

  const isCollapsible = records.length > COLLAPSE_LIMIT;
  const visibleRecords = isCollapsible && !expanded
    ? records.slice(0, COLLAPSE_LIMIT)
    : records;
  const hiddenCount = records.length - COLLAPSE_LIMIT;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-[18px] border-b border-slate-100 bg-[#f5f7ff]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-[#e6ecff] flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-[17px] font-semibold text-slate-800 truncate">
              {title}
            </h2>
            {records.length > 0 && (
              <span className="text-[11px] font-semibold text-[#2C3B8D] bg-[#e6ecff] px-2 py-0.5 rounded-full">
                {records.length}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onAdd}
          className="cursor-pointer px-3.5 py-1.5 rounded-lg font-medium text-[13px] transition-all flex items-center gap-1.5 bg-[#2C3B8D] hover:bg-[#233070] text-white whitespace-nowrap"
        >
          <span className="text-base leading-none">+</span>
          {t('common:add', 'Add')}
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-[3px] border-slate-200 border-t-[#2C3B8D] rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[13px] text-slate-400 italic">
            {emptyText || t('common:noRecords', 'No records found')}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {visibleRecords.map((rec) => (
              <RecordCard
                key={rec._id}
                data={rec}
                onEdit={() => onEdit(rec)}
                onDelete={() => onDelete(rec)}
                t={t}
              />
            ))}
          </div>

          {isCollapsible && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium text-[#2C3B8D] bg-[#f5f7ff] border-t border-[#e6ecff] hover:bg-[#eef1ff] transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              >
                <path
                  d="M3 5L7 9L11 5"
                  stroke="#2C3B8D"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {expanded
                ? t('common:collapse', 'collapse')
                : t('common:showMore', `View ${hiddenCount} records`)}
            </button>
          )}
        </>
      )}
    </section>
  );
}