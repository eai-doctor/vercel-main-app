import React from "react";

export function Field({ label, value, onChange, type = "text", required, placeholder, multiline }) {
  const cls = "w-full px-3 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:ring-2 focus:ring-[rgba(59,130,246,0.4)] focus:border-[#3b82f6] text-sm transition-all";
  return (
    <div>
      <label className="block text-sm font-medium text-[#475569] mb-1">{label}</label>
      {multiline ? (
        <textarea className={cls} value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} />
      )}
    </div>
  );
}

export function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#475569] mb-1">{label}</label>
      <select
        className="w-full px-3 py-2 border border-[rgba(15,23,42,0.1)] rounded-lg focus:ring-2 focus:ring-[rgba(59,130,246,0.4)] focus:border-[#3b82f6] text-sm bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </div>
  );
}