import React from "react";

export default function RecordCard({ data, onEdit, onDelete, t }) {

  console.log("Rendering RecordCard with data:", data);
  
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.1)] border border-[rgba(15,23,42,0.1)] p-4 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] hover:border-[rgba(59,130,246,0.4)] transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#1e293b] truncate">{data.primary}</h4>
          {data.secondary && <p className="text-sm text-[#475569] mt-1">{data.secondary}</p>}
          {data.date && <p className="text-xs text-[#94a3b8] mt-1">{data.date}</p>}
          {data.notes && <p className="text-xs text-[#475569] mt-1 italic line-clamp-2">{data.notes}</p>}
        </div>
        <div className="flex items-center space-x-3 ml-3 shrink-0">
          <button onClick={onEdit} className="text-[#3b82f6] hover:text-[#2563eb] text-sm font-medium transition-colors">
            {t('common:edit', 'Edit')}
          </button>
          <button onClick={onDelete} className="cursor-pointer text-red-400 hover:text-red-600 text-sm font-medium transition-colors">
            {t('common:delete', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}