import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import { ArrowRight, Brain, Shield, Globe, Users, Award, Zap, Heart, ChevronRight } from 'lucide-react';
import logoImage from "/images/logo.png";

import { teamMembers } from '@/constants/teams';
import {PublicLayout} from "@/components";

const histories = [
  {
    year: "2021",
    title: "Ebovir Founded in Montreal",
    desc: "Ebovir Biotechnologies Inc. was established in Montreal, Quebec, incubated from McGill University. The company focused on virology research, precision medicine, and next-generation biotechnology innovation within Canada’s growing life sciences ecosystem.",
  },
  {
    year: "2022",
    title: "Advanced Diagnostic & Research Infrastructure",
    desc: "Expanded laboratory capabilities with advanced BSL-2 and BSL-3 environments supporting virology research, whole genome sequencing (WGS), preclinical drug development, and early cancer screening initiatives.",
  },
  {
    year: "2023",
    title: "Precision Medicine & AI Collaboration",
    desc: "Ebovir strengthened collaborations across biotechnology and AI-driven healthcare research, accelerating development of precision medicine platforms, genomic interpretation pipelines, and translational clinical technologies.",
  },
  {
    year: "2024",
    title: "National Recognition & Global Expansion",
    desc: "Named one of Canada’s Top 10 Therapeutic Companies for breakthroughs in antiviral therapies. Investissement Québec recognized Ebovir as a recommended biotechnology company for Asia-Pacific market expansion.",
  },
  {
    year: "2025",
    title: "Launch of EAI-Doctor Platform",
    desc: "Initiated development of EAI-Doctor, an AI-powered healthcare platform integrating clinical decision support, voice-to-AI medical consultation, genomic report interpretation, and multilingual patient engagement systems.",
  },
  {
    year: "2026",
    title: "AI Infrastructure & Clinical Intelligence",
    desc: "Expanded EAI-Doctor with real-time transcription pipelines, Retrieval-Augmented Generation (RAG) for genetic analysis, cloud-native AI infrastructure, and privacy-focused healthcare compliance aligned with HIPAA, PIPEDA, and Quebec Law 25.",
    last: true,
  },
];

function StatCard({ value, label, sub }) {
  return (
    <div className="text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <p className="font-bold text-[#2C3B8D] mb-1" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(2rem,4vw,3rem)" }}>{value}</p>
      <p className="text-gray-800 font-semibold text-sm mb-1">{label}</p>
      {sub && <p className="text-gray-400 text-xs">{sub}</p>}
    </div>
  );
}

function ValueCard({ icon: Icon, title, desc, accent }) {
  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-transparent transition-all duration-300 group">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
           style={{ background:`linear-gradient(135deg,${accent}20,${accent}40)` }}>
        <Icon className="w-5 h-5" style={{ color:accent }} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function TeamCard({ name, role, dept, initial }) {
  const colors = ["#2C3B8D","#277cc4","#0ba9ea","#6366f1","#22c55e","#f59e0b"];
  const color = colors[name.length % colors.length];
  return (
    <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-lg hover:border-transparent transition-all duration-300 group">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl"
           style={{ background:`linear-gradient(135deg,${color},${color}99)` }}>
        {initial}
      </div>
      <p className="font-semibold text-gray-900 text-sm">{name}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color }}>{role}</p>
      <p className="text-xs text-gray-400 mt-0.5">{dept}</p>
    </div>
  );
}

function TimelineItem({ year, title, desc, last }) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 z-10"
             style={{ background:"linear-gradient(135deg,#2C3B8D,#277cc4)" }}>
          {year.slice(2)}
        </div>
        {!last && <div className="w-px flex-1 mt-2" style={{ background:"linear-gradient(to bottom,#277cc4,transparent)" }} />}
      </div>
      <div className="pb-10">
        <p className="text-xs font-bold text-[#277cc4] uppercase tracking-widest mb-1">{year}</p>
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <PublicLayout mode="scrolling">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes gradShift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }

        .fade-up-1 { animation:fadeUp .6s .05s ease both; }
        .fade-up-2 { animation:fadeUp .6s .15s ease both; }
        .fade-up-3 { animation:fadeUp .6s .25s ease both; }
        .fade-up-4 { animation:fadeUp .6s .35s ease both; }

        .hero-gradient {
          background: linear-gradient(145deg,#0d1b4b 0%,#1a3a7c 40%,#1565a8 70%,#0ba9ea 100%);
          background-size:200% 200%;
          animation:gradShift 14s ease infinite;
        }

        .btn-primary {
          background:linear-gradient(135deg,#2C3B8D,#277cc4);
          transition:all .2s ease;
        }
        .btn-primary:hover {
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

        .glass-dark {
          background:rgba(255,255,255,0.07);
          backdrop-filter:blur(14px);
          border:1px solid rgba(255,255,255,0.14);
        }

        .mission-card {
          background: linear-gradient(135deg, rgba(44,59,141,0.06), rgba(39,124,196,0.06));
          border: 1px solid rgba(39,124,196,0.15);
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
             style={{ background:"radial-gradient(circle,#0ba9ea,transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 text-center">
          <div className="fade-up-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
               style={{ background:"rgba(11,169,234,.15)", border:"1px solid rgba(11,169,234,.3)" }}>
            <span className="w-2 h-2 rounded-full bg-[#0ba9ea] animate-pulse" />
            <span className="text-[#0ba9ea] text-xs font-semibold tracking-wide uppercase">Our Story</span>
          </div>

          <h1 className="fade-up-2 text-white mb-6 leading-[1.1]"
              style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(2.4rem,6vw,4rem)" }}>
            We Believe Every Doctor<br />
            <em className="not-italic" style={{ color:"#0ba9ea" }}>Deserves an AI Partner</em>
          </h1>

          <p className="fade-up-3 text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            EAI Doctor was founded by clinicians, researchers, and technologists who experienced first-hand 
            how fragmented information, cognitive overload, and outdated tools cost lives. We're building 
            the platform we wished existed.
          </p>

          <div className="fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* <a href="/clinic-join"
               className="btn-primary flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm">
              Join Our Mission <ArrowRight className="w-4 h-4" />
            </a> */}
            <a href="#team"
               className="flex items-center gap-2 px-6 py-3.5 rounded-full glass-dark text-white/80 hover:text-white text-sm font-medium transition-colors">
              Meet the Team <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      {/* <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value="2019"  label="Founded"            sub="Toronto, Canada" />
          <StatCard value="300K+" label="Active Clinicians"  sub="Across 3 continents" />
          <StatCard value="2,800+" label="Partner Hospitals" sub="Worldwide" />
          <StatCard value="2.5M+" label="Patients Impacted"  sub="And growing daily" />
        </div>
      </section> */}

      {/* ── Mission ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="section-chip mb-5 inline-block">Our Mission</span>

            <h2
              className="text-gray-900 font-bold leading-tight mb-6"
              style={{
                fontFamily: "'DM Serif Display',serif",
                fontSize: "clamp(1.8rem,3.5vw,2.8rem)",
              }}
            >
              Making Medical AI<br />More Accessible
            </h2>

            <p className="text-gray-600 text-base leading-relaxed mb-5">
              Healthcare professionals often spend too much time searching through fragmented
              medical information, reports, and clinical documentation. We believe modern AI
              can help simplify that process and make medical knowledge easier to access.
            </p>

            <p className="text-gray-600 text-base leading-relaxed mb-8">
              EAI Doctor is being developed to support clinics, researchers, and healthcare
              teams with AI-powered tools for clinical assistance, genetic report
              interpretation, voice documentation, and patient communication — all designed
              with privacy and usability in mind.
            </p>

            <a
              href="/demo-request"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Mission visual */}
          <div className="mission-card rounded-3xl p-8 lg:p-10">
            <div className="space-y-5">
              {[
                // { icon:"🏥", title:"Point-of-Care AI",    desc:"Integrated directly into EMRs and clinical workflows — no context switching required." },
                // { icon:"🌍", title:"Global Reach",         desc:"Available in 40+ countries with region-specific clinical guidelines and drug formularies." },
                { icon:"🔒", title:"Privacy First",        desc:"Zero-knowledge architecture. Patient data never leaves your institution's control." },
                { icon:"⚡", title:"Real-Time Intelligence", desc:"Responses within your browser. Because clinical supports can't wait for page loads." },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-chip mb-4 inline-block">What We Stand For</span>
            <h2 className="text-gray-900 font-bold leading-tight"
                style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)" }}>
              Our Core Values
            </h2>
            <p className="text-gray-500 text-base mt-4 max-w-xl mx-auto">
              These aren't posters on a wall. They're the decisions we make every day when designing, 
              deploying, and improving our platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:Heart,   title:"Clinician-First Design",     desc:"Every feature is co-designed with practicing physicians. If it doesn't make a doctor's day easier, it doesn't ship.", accent:"#ef4444" },
              { icon:Shield,  title:"Uncompromising Safety",       desc:"We apply the same rigor to AI outputs as FDA-regulated medical devices. All recommendations are evidence-graded and auditable.", accent:"#22c55e" },
              { icon:Brain,   title:"Scientific Integrity",        desc:"We publish our validation studies, disclose model limitations, and never overstate AI confidence — because patient safety depends on honesty.", accent:"#2C3B8D" },
              { icon:Globe,   title:"Health Equity",               desc:"Pricing, offline modes, and low-bandwidth support ensure access for under-resourced settings globally, not just well-funded health systems.", accent:"#0ba9ea" },
              { icon:Users,   title:"Collaborative Intelligence",  desc:"We believe AI augments physicians, never replaces them. Every recommendation keeps the clinician in control and accountable.", accent:"#6366f1" },
              { icon:Zap,     title:"Relentless Improvement",      desc:"Medical knowledge evolves weekly. Our models update continuously from peer-reviewed literature, post-market surveillance, and clinician feedback.", accent:"#f59e0b" },
            ].map(v => <ValueCard key={v.title} {...v} />)}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="section-chip mb-5 inline-block">Our Journey</span>
            <h2 className="text-gray-900 font-bold leading-tight mb-4"
                style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)" }}>
              From Idea to<br />Global Platform
            </h2>
            {/* <p className="text-gray-500 text-base leading-relaxed">
              What started as a clinical decision support tool built in a Toronto hospital has grown 
              into a platform trusted by clinicians on three continents.
            </p> */}
          </div>

          <div>
            {histories.map((item, i, arr) => (
              <TimelineItem key={item.year} {...item} last={i === arr.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────────── */}
      <section id="team" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="section-chip mb-4 inline-block">Leadership</span>
            <h2 className="text-gray-900 font-bold leading-tight"
                style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,3.5vw,2.6rem)" }}>
              Built by Clinicians,<br />Technologists & Researchers
            </h2>
            <p className="text-gray-500 text-base mt-4 max-w-xl mx-auto">
              Our leadership team brings together deep expertise in emergency medicine, machine learning, 
              health informatics, and global health systems.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {teamMembers.map(m => <TeamCard key={m.name} {...m} />)}
          </div>

          {/* <div className="mt-10 text-center">
            <a href="/clinic-join"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
              <Users className="w-4 h-4" /> We're Hiring — View Open Roles
            </a>
          </div> */}
        </div>
      </section>

      {/* ── Partners ─────────────────────────────────────────────────────────── */}
      {/* <section className="bg-[#0d1b4b] py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage:"radial-gradient(circle,white 1px,transparent 1px)", backgroundSize:"28px 28px" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-8">
            Trusted by leading health systems
          </p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            {[
              "Sunnybrook Health Sciences","Mayo Clinic Network","NHS Digital","Toronto General","AHS Alberta",
              "Cleveland Clinic","Kaiser Permanente","CHUM Montréal"
            ].map(p => (
              <span key={p} className="text-white/30 hover:text-white/60 transition-colors text-sm font-medium">{p}</span>
            ))}
          </div>
        </div>
      </section> */}

      {/* ── Awards ───────────────────────────────────────────────────────────── */}
      {/* <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="section-chip mb-4 inline-block">Recognition</span>
          <h2 className="text-gray-900 font-bold" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.6rem,3vw,2.2rem)" }}>
            Awards & Certifications
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon:"🏆", label:"TIME100 Health",           sub:"Most Influential Health Companies 2024" },
            { icon:"🔬", label:"FDA Breakthrough Device",  sub:"AI Imaging Analysis Module, 2023" },
            { icon:"🛡️",  label:"HIPAA & PIPEDA Certified", sub:"Full compliance across all regions" },
            { icon:"🌐", label:"WHO Digital Health Award", sub:"Global Health Innovation, 2024" },
          ].map(a => (
            <div key={a.label} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-shadow">
              <span className="text-3xl">{a.icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{a.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden"
             style={{ background:"linear-gradient(135deg,#2C3B8D 0%,#277cc4 50%,#0ba9ea 100%)" }}>
          <div className="absolute inset-0 opacity-[0.05]"
               style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize:"32px 32px" }} />
          <div className="relative z-10">
            <Award className="w-10 h-10 text-white/40 mx-auto mb-4" />
            <h2 className="text-white font-bold mb-4" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,4vw,3rem)" }}>
              Join the Movement
            </h2>
            <p className="text-white/75 text-base max-w-xl mx-auto mb-8">
              Whether you're a clinician, researcher, health system, or investor — there's a role for you in 
              making AI-powered healthcare a reality for every patient, everywhere.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/demo-request"
                 className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white font-semibold text-[#2C3B8D] text-sm hover:bg-white/90 transition-all shadow-lg hover:-translate-y-0.5">
                Get Started Free <ChevronRight className="w-4 h-4" />
              </a>
              <a href="mailto:support@e-ai.ca"
                 className="flex items-center gap-2 px-6 py-3.5 rounded-full glass-dark text-white text-sm font-medium hover:bg-white/10 transition-all">
                Email us
              </a>
            </div>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}