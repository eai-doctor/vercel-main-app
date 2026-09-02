import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { 
  Stethoscope, Brain, FileText, Mic, ChevronRight, 
  CheckCircle, Mail, User, Phone, Building2, MessageSquare,
  Sparkles, Shield, Clock, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import logoImage from "/images/logo.png";
import Header from "./component/header";
import LoginModal from "./modal/login";

import dbHelperApi from "@/api/dbHelperApi"; 


function DemoRequest() {
  const { t } = useTranslation(['auth', 'common']);

  const [step, setStep] = useState("choice"); // "choice" | "demo" | "consult" | "sent"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false); // mode = login, scrolling

  const [form, setForm] = useState({
    name: "", email: "", phone: "", clinic: "", role: "", message: "", type: ""
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if(form.name==="" && form.email=="" && form.phone==="") {
      setError("You need to fill at least one contact field (email or phone) along with your name.");
      return;
    }
    try {
      // TODO: connect backend / email service
      await new Promise(r => setTimeout(r, 1200)); // mock delay
      const response = await dbHelperApi.saveDemoRequest(
        form.name, 
        form.email, 
        form.phone, 
        form.clinic, 
        form.role, 
        form.message
      );

      if(response.status === 201) {
        alert("Demo request sent successfully! We'll be in touch within 1 business day.");
        setForm({ name: "", email: "", phone: "", clinic: "", role: "", message: "" });
      }
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-[#f0f4ff]">

      {/* ── Nav bar ────────────────────────────────────────────── */}
      <Header headerMenus={[{ value: "For Clinicians", url: "/clinic-join" }]} setModalOpen={setModalOpen} />

      <LoginModal open={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="max-w-5xl mx-auto px-6 py-12 bg-white rounded-xl shadow-lg my-10">
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-5xl font-bold text-slate-800">
              Request a Live Demo
            </h3>
            <p className="text-xl text-slate-500 mt-2">
              Fill in your details and we'll reach out within 1 business day to schedule.
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

export default DemoRequest;