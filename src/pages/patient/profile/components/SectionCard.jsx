import React from "react";
import RecordCard from "./RecordCard";

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
        <div className="divide-y divide-slate-100">
          {records.map((rec) => (
            <RecordCard
              key={rec._id}
              data={rec}
              onEdit={() => onEdit(rec)}
              onDelete={() => onDelete(rec)}
              t={t}
            />
          ))}
        </div>
      )}
    </section>
  );
}
