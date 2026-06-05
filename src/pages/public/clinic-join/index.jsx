import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, Zap, Brain, Shield, Activity, Globe, ArrowRight, Stethoscope, FlaskConical, ScanLine } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white" style={{ fontFamily: "'DM Serif Display',serif" }}>{value}</p>
      <p className="text-sm text-white/60 mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, accent }) {
  return (
    <div className="group relative rounded-2xl p-6 bg-white border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-blue-100/60 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           style={{ background: `linear-gradient(135deg,${accent}08,${accent}14)` }} />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
             style={{ background: `linear-gradient(135deg,${accent}22,${accent}44)` }}>
          <Icon className="w-6 h-6" style={{ color: accent }} />
        </div>
        <h3 className="font-semibold text-gray-900 text-base mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TrendPill({ label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
          style={{ background: "rgba(39,124,196,0.12)", borderColor: "rgba(39,124,196,0.25)", color: "#b8d9f5" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#0ba9ea] animate-pulse" />
      {label}
    </span>
  );
}

export default function ClinicJoin({ mode }) {
  const { t } = useTranslation(['landing', 'common', 'clinic', 'auth']);

  return (
    <PublicLayout mode={mode}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(.95) translateY(12px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-8px); }
        }
        @keyframes gradShift {
          0%   { background-position:0% 50%; }
          50%  { background-position:100% 50%; }
          100% { background-position:0% 50%; }
        }
        @keyframes pulseRing {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(1.6); opacity:0; }
        }

        .fade-up-1 { animation:fadeUp .65s .08s ease both; }
        .fade-up-2 { animation:fadeUp .65s .20s ease both; }
        .fade-up-3 { animation:fadeUp .65s .32s ease both; }
        .fade-up-4 { animation:fadeUp .65s .44s ease both; }
        .fade-up-5 { animation:fadeUp .65s .56s ease both; }

        .hero-gradient {
          background: linear-gradient(145deg,#0d1b4b 0%,#1a3a7c 35%,#1565a8 65%,#0ba9ea 100%);
          background-size:200% 200%;
          animation:gradShift 14s ease infinite;
        }

        .float-anim  { animation:float 4s   ease-in-out infinite; }
        .float-anim2 { animation:float 4s 1.2s ease-in-out infinite; }
        .float-anim3 { animation:float 4s 0.6s ease-in-out infinite; }

        .pulse-dot::before {
          content:'';
          position:absolute;
          inset:-6px;
          border-radius:9999px;
          border:2px solid rgba(11,169,234,.5);
          animation:pulseRing 2s ease-out infinite;
        }

        .glass-card {
          background:rgba(255,255,255,0.08);
          backdrop-filter:blur(14px);
          border:1px solid rgba(255,255,255,0.15);
        }

        .btn-primary {
          background:linear-gradient(135deg,#2C3B8D,#277cc4);
          transition:all .22s ease;
        }
        .btn-primary:hover {
          background:linear-gradient(135deg,#1f2a63,#1d5d94);
          transform:translateY(-1px);
          box-shadow:0 8px 24px rgba(44,59,141,.35);
        }

        .section-chip {
          display:inline-flex;
          align-items:center;
          background:rgba(39,124,196,.1);
          border:1px solid rgba(39,124,196,.2);
          color:#2C3B8D;
          border-radius:9999px;
          padding:.3rem .9rem;
          font-size:.72rem;
          font-weight:600;
          letter-spacing:.07em;
          text-transform:uppercase;
        }
      `}</style>
      {/* Navbar */}
      {/* <Header headerMenus={headerMenus} setModalOpen={setModalOpen} /> */}
      {/* <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src={logoImage} alt="EAI Doctor" className="h-7 w-auto" />
            <span className="hidden sm:block text-sm font-semibold text-gray-800 tracking-tight">EAI Doctor</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            {headerMenus.map((menu) => (
              <a key={menu.value} href={menu.url} className="hover:text-gray-900 transition-colors">
                {menu.value}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <a href="/clinic-join"
               className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
              Book a Demo
            </a>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white"
            >
              Sign In
            </button>
          </div>
        </div>
      </header> */}

      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="absolute top-[-80px] right-[-80px] w-[420px] h-[420px] rounded-full opacity-10"
             style={{ background:"radial-gradient(circle,#0ba9ea,transparent 70%)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[320px] h-[320px] rounded-full opacity-10"
             style={{ background:"radial-gradient(circle,#2C3B8D,transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-14">
          <div className="flex-1 text-center lg:text-left">
            <div className="fade-up-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                 style={{ background:"rgba(11,169,234,.15)", border:"1px solid rgba(11,169,234,.3)" }}>
              <span className="w-2 h-2 rounded-full bg-[#0ba9ea] animate-pulse" />
              <span className="text-[#0ba9ea] text-xs font-semibold tracking-wide uppercase">Medical AI Platform — 2026</span>
            </div>

            <h1 className="fade-up-2 text-white leading-[1.1] mb-6"
                style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(2.4rem,5vw,3.8rem)" }}>
              The AI Co-Pilot<br />
              <em className="not-italic" style={{ color:"#0ba9ea" }}>Every Clinician</em><br />
              Deserves
            </h1>

            <p className="fade-up-3 text-white/70 text-base lg:text-lg leading-relaxed max-w-xl mb-8">
              EAI Doctor puts frontier medical AI directly in clinicians' hands — real-time diagnostic support,
              evidence-based order sets, multimodal imaging analysis, and live clinical research summaries,
              all within your existing workflow.
            </p>

            <div className="fade-up-4 flex flex-wrap justify-center lg:justify-start gap-2 mb-10">
              {["Gemini Clinical Reasoning","Multimodal Imaging AI","Real-Time Evidence Synthesis","AI Documentation"].map(p => (
                <TrendPill key={p} label={p} />
              ))}
            </div>

            <div className="fade-up-5 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm"
              >
                Access Clinician Portal <ArrowRight className="w-4 h-4" />
              </button>
              {/* <a href="/clinic-join"
                 className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors glass-card px-5 py-3 rounded-full">
                <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="white"><path d="M1 1l8 5-8 5V1z"/></svg>
                </span>
                Watch Demo
              </a> */}
            </div>
          </div>

          {/* Floating dashboard mockup */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md float-anim">
              <div className="rounded-2xl p-5 shadow-2xl glass-card">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative pulse-dot">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"linear-gradient(135deg,#2C3B8D,#0ba9ea)" }}>
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="ml-1">
                    <p className="text-white text-xs font-semibold">EAI Clinical Intelligence</p>
                    <p className="text-white/50 text-[10px]">Analyzing patient context…</p>
                  </div>
                  <span className="ml-auto text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>
                {[
                  { label:"Differential Diagnosis", val:"87% Confidence", color:"#0ba9ea" },
                  { label:"Evidence Level",         val:"Grade A — RCT",  color:"#22c55e" },
                  { label:"Drug Interactions",      val:"2 Flagged",      color:"#f59e0b" },
                  { label:"Similar Cases (Global)", val:"14,203 matches", color:"#a78bfa" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/[0.08] last:border-0">
                    <span className="text-white/60 text-xs">{r.label}</span>
                    <span className="text-xs font-semibold" style={{ color:r.color }}>{r.val}</span>
                  </div>
                ))}
                <div className="mt-4 rounded-xl p-3" style={{ background:"rgba(11,169,234,.12)", border:"1px solid rgba(11,169,234,.25)" }}>
                  <p className="text-[11px] text-white/80 leading-relaxed">
                    <span className="text-[#0ba9ea] font-semibold">AI Recommendation: </span>
                    Based on symptom cluster and labs, consider early initiation of guideline-directed therapy. Updated 2026 AHA/ACC guidelines applied.
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 float-anim2 glass-card rounded-xl px-3 py-2 shadow-lg">
                <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0ba9ea]" /> 99.7% Uptime
                </p>
              </div>
              <div className="absolute -bottom-4 -left-4 float-anim3 glass-card rounded-xl px-3 py-2 shadow-lg">
                <p className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> HIPAA Compliant
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {/* <div className="relative border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat value="1,000+" label="Clinical Order Sets" />
            <Stat value="2,800+" label="Healthcare Partners" />
            <Stat value="300K+"  label="Active Clinicians" />
            <Stat value="2.5M+"  label="Patients Served" />
          </div>
        </div> */}
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="section-chip mb-4 inline-block">Core Capabilities</span>
          <h2 className="text-gray-900 font-bold leading-tight"
              style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,3.5vw,2.8rem)" }}>
            Built for the Way<br />Clinicians Actually Work
          </h2>
          <p className="text-gray-500 text-base mt-4 max-w-xl mx-auto">
            Every feature reduces cognitive load, surfaces evidence instantly, and keeps the physician in control.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon:Brain,        title:"AI Diagnostic Reasoning",     desc:"Gemini Powered differential diagnosis engine trained on 50M+ case records. Surfaces ranked differentials with probability scores and guideline citations in under 3 seconds.", accent:"#2C3B8D" },
            { icon:ScanLine,     title:"Multimodal Imaging Analysis",  desc:"Radiology-grade AI reads X-ray, CT, MRI, and pathology slides alongside clinical notes. Flags anomalies, measures lesions, and cross-references prior studies automatically.", accent:"#277cc4" },
            { icon:FlaskConical, title:"Real-Time Evidence Synthesis", desc:"Live indexing of PubMed, ClinicalTrials.gov, and 140+ journals. Delivers patient-specific, PICO-formatted evidence summaries ranked by recency and study quality.", accent:"#0ba9ea" },
            { icon:Zap,          title:"AI Documentation Assistant",   desc:"Ambient voice-to-SOAP note generation reduces documentation time by 60%. Pre-fills ICD-11 codes and drafts referral letters — all reviewable before submission.", accent:"#6366f1" },
            { icon:Shield,       title:"Precision Drug Safety Engine", desc:"Real-time drug-drug interaction screening, renal/hepatic dose adjustments, and allergy cross-reactivity checks integrated with national formulary data.", accent:"#22c55e" },
            // { icon:Globe,        title:"Global Clinical Network",      desc:"Anonymized federated learning across 2,800+ institutions. Rare disease pattern matching, population-level outcome benchmarking, and pandemic early-warning signals.", accent:"#f59e0b" },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* Trends */}
      <section className="bg-[#0d1b4b] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
             style={{ backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"28px 28px" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ background:"rgba(11,169,234,.15)", color:"#0ba9ea", border:"1px solid rgba(11,169,234,.3)" }}>
              2025 Medical AI Trends
            </span>
            <h2 className="text-white font-bold" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)" }}>
              At the Frontier of Clinical AI
            </h2>
            <p className="text-white/55 text-sm mt-3 max-w-lg mx-auto">
              EAI Doctor integrates the latest advances in medical AI research as they emerge.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {[
              { label:"Foundation Models in Medicine", body:"Med-PaLM 3, BioGPT-4, and specialty-tuned LLMs now outperform specialists on USMLE-style reasoning. EAI Doctor integrates the latest medical foundation models with clinical guardrails.", tag:"LLM / NLP", color:"#0ba9ea" },
              // { label:"Agentic Clinical Workflows",    body:"AI agents autonomously gather chart history, order preliminary labs, draft referrals, and close the loop — with human-in-the-loop approval at every step.", tag:"AI Agents", color:"#a78bfa" },
              // { label:"Federated Learning & Privacy",  body:"Train models across hospital networks without sharing raw patient data. EAI Doctor uses differential-privacy federated learning to improve rare-disease models globally.", tag:"Privacy AI", color:"#22c55e" },
              { label:"Multimodal Clinical AI",        body:"Unified models reason across lab values, imaging, genomics, and free text simultaneously — enabling holistic patient understanding that single-modality tools miss.", tag:"Multimodal", color:"#f59e0b" },
            ].map(tr => (
              <div key={tr.label} className="rounded-2xl p-5 glass-card hover:bg-white/10 transition-all group">
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full mb-3 inline-block"
                      style={{ background:`${tr.color}22`, color:tr.color, border:`1px solid ${tr.color}44` }}>
                  {tr.tag}
                </span>
                <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-[#0ba9ea] transition-colors">{tr.label}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{tr.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden"
             style={{ background:"linear-gradient(135deg,#2C3B8D 0%,#277cc4 50%,#0ba9ea 100%)" }}>
          <div className="absolute inset-0 opacity-[0.06]"
               style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize:"32px 32px" }} />
          <div className="relative z-10">
            <h2 className="text-white font-bold mb-4" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,4vw,3rem)" }}>
              Ready to Practice with AI?
            </h2>
            <p className="text-white/75 text-base max-w-xl mx-auto mb-8">
              Join clinicians already using EAI Doctor to deliver faster, safer, evidence-backed care.
              {/* Join 300,000+ clinicians already using EAI Doctor to deliver faster, safer, evidence-backed care. */}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/demo-request"
                className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white font-semibold text-[#2C3B8D] text-sm hover:bg-white/90 transition-all shadow-lg hover:-translate-y-0.5"
              >
                Get Started Free <ChevronRight className="w-4 h-4" />
              </a>
              <a href="tel:+14506888377"
                 className="flex items-center gap-2 px-6 py-3.5 rounded-full glass-card text-white text-sm font-medium hover:bg-white/15 transition-all">
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}