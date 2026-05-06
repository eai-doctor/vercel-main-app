import React from "react";

const labelCls =
  "block text-[10px] font-medium uppercase tracking-[0.8px] text-slate-400 mb-1.5";

const inputCls =
  "text-[13px] px-2.5 py-2 border border-slate-200 rounded-md w-full bg-white focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10 transition-all placeholder:text-slate-400";

export function Field({ label, value, onChange, type = "text", required, placeholder, multiline }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {multiline ? (
        <textarea
          className={inputCls}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputCls}
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select
        className={inputCls}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={`chk-${label}`}
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-[#2C3B8D] focus:ring-[#2C3B8D]/20"
      />
      <label
        htmlFor={`chk-${label}`}
        className="text-[12px] font-medium text-slate-600"
      >
        {label}
      </label>
    </div>
  );
}
