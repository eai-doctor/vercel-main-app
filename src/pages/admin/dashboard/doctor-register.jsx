// AdminDoctorRegister.jsx
import { useState } from "react";
import { User, Lock, Eye, EyeOff, Stethoscope, Phone, Building2, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { authDoctorRegister } from "@/api/authApi";

const SPECIALTIES = [
  "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology",
  "Gastroenterology", "General Practice", "Geriatrics", "Hematology",
  "Infectious Disease", "Internal Medicine", "Nephrology", "Neurology",
  "Obstetrics & Gynecology", "Oncology", "Ophthalmology", "Orthopedics",
  "Otolaryngology", "Pathology", "Pediatrics", "Psychiatry",
  "Pulmonology", "Radiology", "Rheumatology", "Surgery", "Urology",
];

const FIELD_CONFIG = [
  {
    id: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Dr. John Smith",
    icon: User,
    required: true,
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "doctor@hospital.com",
    icon: User,
    required: true,
  },
  {
    id: "password",
    label: "Temporary Password",
    type: "password",
    placeholder: "Min 8 chars, uppercase, number",
    icon: Lock,
    required: true,
    isPassword: true,
    hint: "Doctor can change this after first login.",
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+1-234-567-8900",
    icon: Phone,
    required: false,
  },
  {
    id: "clinic_name",
    label: "Clinic / Hospital",
    type: "text",
    placeholder: "Seoul General Hospital",
    icon: Building2,
    required: false,
  },
];

function Field({ config, value, onChange }) {
  const [show, setShow] = useState(false);
  const Icon = config.icon;
  const inputType = config.isPassword ? (show ? "text" : "password") : config.type;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        {config.label}
        {config.required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <Icon style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af" }} />
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={config.placeholder}
          required={config.required}
          autoComplete={config.isPassword ? "new-password" : config.type === "email" ? "email" : "off"}
          style={{
            width: "100%", height: 44, paddingLeft: 38,
            paddingRight: config.isPassword ? 40 : 12,
            border: "1.5px solid #e5e7eb", borderRadius: 8,
            fontSize: 13.5, color: "#111827", background: "#fff",
            outline: "none", boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "#277cc4"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
        {config.isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {config.hint && (
        <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>{config.hint}</p>
      )}
    </div>
  );
}

function SpecialtySelect({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        Specialty <span style={{ color: "#ef4444" }}>*</span>
      </label>
      <div style={{ position: "relative" }}>
        <Stethoscope style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#9ca3af", pointerEvents: "none" }} />
        <ChevronDown style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: "#9ca3af", pointerEvents: "none" }} />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          style={{
            width: "100%", height: 44,
            paddingLeft: 38, paddingRight: 36,
            border: "1.5px solid #e5e7eb", borderRadius: 8,
            fontSize: 13.5, color: value ? "#111827" : "#9ca3af",
            background: "#fff", appearance: "none",
            outline: "none", cursor: "pointer", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = "#277cc4"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        >
          <option value="" disabled>Select specialty</option>
          {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function AdminDoctorRegister({ onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", specialty: "", phone: "", clinic_name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', message }

  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setSubmitting(true);

    try {
      const res = await authDoctorRegister(form);
      
      if (!res.ok) {
        setResult({ type: "error", message: data.error || "Registration failed." });
        return;
      }

      setResult({ type: "success", message: `${data.name} has been registered successfully.` });
      setForm({ name: "", email: "", password: "", specialty: "", phone: "", clinic_name: "" });
      onSuccess?.(data);

    } catch {
      setResult({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 640, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2C3B8D,#277cc4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Stethoscope size={18} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Register New Doctor</h1>
        </div>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          Account will be activated immediately. Email verification is skipped for admin-registered accounts.
        </p>
      </div>

      {/* Result Banner */}
      {result && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 16px", borderRadius: 10, marginBottom: 20,
          background: result.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
          border: `1.5px solid ${result.type === "success" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
        }}>
          {result.type === "success"
            ? <CheckCircle2 size={16} color="#10b981" style={{ marginTop: 1, flexShrink: 0 }} />
            : <AlertCircle size={16} color="#ef4444" style={{ marginTop: 1, flexShrink: 0 }} />
          }
          <p style={{ fontSize: 13, margin: 0, color: result.type === "success" ? "#065f46" : "#b91c1c" }}>
            {result.message}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden" }}>

          {/* Required Section */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>Required Information</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field config={FIELD_CONFIG[0]} value={form.name}     onChange={setField("name")} />
              <Field config={FIELD_CONFIG[1]} value={form.email}    onChange={setField("email")} />
              <Field config={FIELD_CONFIG[2]} value={form.password} onChange={setField("password")} />
              <SpecialtySelect value={form.specialty} onChange={setField("specialty")} />
            </div>
          </div>

          {/* Optional Section */}
          <div style={{ padding: "20px 24px", background: "#fafafa" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>Optional Information</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field config={FIELD_CONFIG[3]} value={form.phone}       onChange={setField("phone")} />
              <Field config={FIELD_CONFIG[4]} value={form.clinic_name} onChange={setField("clinic_name")} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setForm({ name: "", email: "", password: "", specialty: "", phone: "", clinic_name: "" })}
            style={{
              flex: 1, height: 44, borderRadius: 8, border: "1.5px solid #e5e7eb",
              background: "#fff", fontSize: 13.5, fontWeight: 500, cursor: "pointer",
              color: "#374151", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#9ca3af"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 3, height: 44, borderRadius: 8, border: "none",
              background: submitting ? "#9ca3af" : "linear-gradient(135deg,#2C3B8D,#277cc4)",
              color: "#fff", fontSize: 13.5, fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
            }}
          >
            {submitting ? "Registering..." : "Register Doctor"}
          </button>
        </div>
      </form>
    </div>
  );
}