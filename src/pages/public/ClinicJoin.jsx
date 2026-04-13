import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { 
  Stethoscope, Brain, FileText, Mic, ChevronRight, 
  CheckCircle, Mail, User, Phone, Building2, MessageSquare,
  Sparkles, Shield, Clock, TrendingUp
} from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import logoImage from "/images/logo.png";

const FEATURES = [
  {
    icon: <Mic className="w-5 h-5" />,
    title: "Live Transcription",
    desc: "Real-time consultation transcription with AI-powered noise filtering and speaker diarization."
  },
  {
    icon: <Brain className="w-5 h-5" />,
    title: "Differential Diagnosis",
    desc: "AI-ranked differential diagnoses with probability scores updated in real time as you speak."
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Auto SOAP Notes",
    desc: "Structured SOAP documentation generated automatically from each consultation."
  },
  {
    icon: <Stethoscope className="w-5 h-5" />,
    title: "Next Best Questions",
    desc: "Dynamic clinical prompts and red-flag alerts surfaced during the encounter."
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "PIPEDA & Law 25 Compliant",
    desc: "Built for Canadian healthcare — data residency, consent workflows, and audit logs included."
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "McGill Prediction Model",
    desc: "Evidence-based statistical predictions integrated directly into your clinical workflow."
  },
];

const STATS = [
  { value: "40%", label: "reduction in documentation time" },
  { value: "3×", label: "faster SOAP note generation" },
  { value: "98%", label: "transcription accuracy" },
  { value: "< 1s", label: "AI response latency" },
];

function ClinicJoin() {
  const { t } = useTranslation(['auth', 'common']);

  const [step, setStep] = useState("choice"); // "choice" | "demo" | "consult" | "sent"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", clinic: "", role: "", message: "", type: ""
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // TODO: connect backend / email service
      await new Promise(r => setTimeout(r, 1200)); // mock delay
      setStep("sent");
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const chooseType = (type) => {
    setForm(f => ({ ...f, type }));
    setStep(type); // "demo" or "consult"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#f0f4ff]">

      {/* ── Nav bar ────────────────────────────────────────────── */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img 
              src={logoImage}
              alt="logo"
              className="w-12 h-12 object-contain"
            />
          <span className="text-[16px] font-bold text-slate-800 tracking-tight">EAI-DOCTOR</span>
        </div>
        <a href="/clinic-login"
          className="text-[13px] font-semibold text-[#2C3B8D] hover:text-[#233070] transition-colors">
          Already have an account → Sign in
        </a>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eef2ff] border border-[#c7d2f8] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#2C3B8D]" />
            <span className="text-[12px] font-semibold text-[#2C3B8D] uppercase tracking-wide">
              AI-Powered Clinical Assistant
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
            See more patients.<br />
            <span className="text-[#2C3B8D]">Document less.</span>
          </h1>
          <p className="text-[16px] text-slate-500 max-w-xl mx-auto leading-relaxed">
            EAI-DOCTOR listens to your consultations, writes your SOAP notes, surfaces 
            differential diagnoses, and keeps you compliant — all in real time.
          </p>
        </div>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-5 text-center">
              <p className="text-[28px] font-bold text-[#2C3B8D] leading-none mb-1">{value}</p>
              <p className="text-[12px] text-slate-500 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Features ───────────────────────────────────────────── */}
        <div className="mb-14">
          <h2 className="text-[20px] font-bold text-slate-800 text-center mb-6">
            Everything you need in the exam room
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-[#c7d2f8] hover:shadow-md transition-all">
                <div className="w-9 h-9 rounded-[10px] bg-[#eef2ff] flex items-center justify-center text-[#2C3B8D] mb-3">
                  {icon}
                </div>
                <p className="text-[14px] font-semibold text-slate-800 mb-1">{title}</p>
                <p className="text-[13px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA / Form area ────────────────────────────────────── */}
        <div className="max-w-lg mx-auto hidden">

          {/* ── Step: choice ─────────────────────────────────────── */}
          {step === "choice" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 bg-[#f5f7ff] border-b border-slate-100 text-center">
                <h3 className="text-[18px] font-bold text-slate-800 mb-1">Get started with EAI-DOCTOR</h3>
                <p className="text-[13px] text-slate-500">Choose how you'd like to connect with our team</p>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => chooseType("demo")}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2
                    border-[#2C3B8D] bg-[#f5f7ff] hover:bg-[#eef2ff] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2C3B8D] flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-bold text-slate-800">Request a Live Demo</p>
                      <p className="text-[12px] text-slate-500">30-min walkthrough with our team</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#2C3B8D] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => chooseType("consult")}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl border
                    border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#e6ecff] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[#2C3B8D]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[14px] font-bold text-slate-800">Talk to Sales</p>
                      <p className="text-[12px] text-slate-500">Pricing, enterprise & deployment questions</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-2 pt-2">
                  {[
                    "No credit card required",
                    "PIPEDA compliant",
                    "Canadian-built",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[11px] text-slate-400">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step: demo | consult ─────────────────────────────── */}
          {(step === "demo" || step === "consult") && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 bg-[#f5f7ff] border-b border-slate-100">
                <button
                  onClick={() => setStep("choice")}
                  className="text-[12px] text-slate-400 hover:text-slate-600 mb-2 flex items-center gap-1 transition-colors"
                >
                  ← Back
                </button>
                <h3 className="text-[17px] font-bold text-slate-800">
                  {step === "demo" ? "Request a Live Demo" : "Talk to Sales"}
                </h3>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  {step === "demo"
                    ? "Fill in your details and we'll reach out within 1 business day to schedule."
                    : "Tell us about your clinic and we'll prepare a tailored proposal."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-slate-600">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Dr. Jane Smith"
                      className="pl-9 h-11 text-[14px] border-slate-200 focus:border-[#2C3B8D] focus:ring-[#2C3B8D]/10"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-slate-600">Work Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="jane@clinic.ca"
                      className="pl-9 h-11 text-[14px] border-slate-200 focus:border-[#2C3B8D] focus:ring-[#2C3B8D]/10"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-slate-600">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+1 (514) 000-0000"
                      className="pl-9 h-11 text-[14px] border-slate-200 focus:border-[#2C3B8D] focus:ring-[#2C3B8D]/10"
                    />
                  </div>
                </div>

                {/* Clinic */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-slate-600">Clinic / Hospital *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      value={form.clinic}
                      onChange={set("clinic")}
                      placeholder="Montreal General Clinic"
                      className="pl-9 h-11 text-[14px] border-slate-200 focus:border-[#2C3B8D] focus:ring-[#2C3B8D]/10"
                      required
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-slate-600">Your Role</Label>
                  <select
                    value={form.role}
                    onChange={set("role")}
                    className="w-full h-11 px-3 text-[14px] border border-slate-200 rounded-lg
                      focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
                      text-slate-700 bg-white"
                  >
                    <option value="">Select role...</option>
                    <option value="physician">Physician / GP</option>
                    <option value="specialist">Specialist</option>
                    <option value="resident">Resident</option>
                    <option value="nurse_practitioner">Nurse Practitioner</option>
                    <option value="clinic_admin">Clinic Administrator</option>
                    <option value="it">IT / Technical</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-medium text-slate-600">
                    {step === "demo" ? "Anything specific you'd like to see?" : "Tell us about your needs"}
                  </Label>
                  <textarea
                    value={form.message}
                    onChange={set("message")}
                    rows={3}
                    placeholder={
                      step === "demo"
                        ? "e.g. We use Accuro EMR and see ~30 patients/day..."
                        : "e.g. We have 5 physicians and need multi-clinic support..."
                    }
                    className="w-full px-3 py-2.5 text-[14px] border border-slate-200 rounded-xl
                      focus:outline-none focus:border-[#2C3B8D] focus:ring-2 focus:ring-[#2C3B8D]/10
                      text-slate-700 placeholder:text-slate-400 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-[#2C3B8D] hover:bg-[#233070] text-white text-[14px] font-semibold rounded-xl transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Sending...
                    </span>
                  ) : step === "demo" ? "Request Demo →" : "Send Message →"}
                </Button>

                <p className="text-center text-[11px] text-slate-400">
                  By submitting, you agree to our{" "}
                  <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
                  We'll never share your information.
                </p>
              </form>
            </div>
          )}

          {/* ── Step: sent ───────────────────────────────────────── */}
          {step === "sent" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-[20px] font-bold text-slate-800 mb-2">
                {form.type === "demo" ? "Demo request received!" : "Message sent!"}
              </h3>
              <p className="text-[14px] text-slate-500 mb-6 max-w-sm mx-auto">
                Thanks, <strong>{form.name.split(" ")[0]}</strong>. We'll reach out to{" "}
                <strong>{form.email}</strong> within 1 business day.
              </p>
              <div className="flex flex-col gap-2">
                <a href="/clinic-login"
                  className="inline-flex items-center justify-center h-11 px-6 bg-[#2C3B8D]
                    hover:bg-[#233070] text-white text-[14px] font-semibold rounded-xl transition-colors">
                  Back to Sign In
                </a>
                <button onClick={() => setStep("choice")}
                  className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors">
                  Submit another request
                </button>
              </div>
            </div>
          )}

          {/* Trust indicators */}
          {step !== "sent" && (
            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { icon: <Shield className="w-3.5 h-3.5" />, label: "PIPEDA & Law 25 compliant" },
                { icon: <CheckCircle className="w-3.5 h-3.5" />, label: "Canadian data residency" },
                { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Built for Canadian clinicians" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-[12px] text-slate-400">
                  <span className="text-[#2C3B8D]">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <a   href="tel:+14506888377"
  className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3
    bg-[#2C3B8D] hover:bg-[#233070] text-white rounded-full shadow-lg
    hover:shadow-xl transition-all group"
>
  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
    <Phone className="w-4 h-4" />
  </div>
  <div className="overflow-hidden max-w-0 group-hover:max-w-[160px] transition-all duration-300 whitespace-nowrap">
    <p className="text-[11px] font-medium opacity-80 leading-none mb-0.5">Call us</p>
    <p className="text-[13px] font-bold leading-none">+1 (450) 688-8377</p>
  </div>
</a>
    </div>
  );
}

export default ClinicJoin;