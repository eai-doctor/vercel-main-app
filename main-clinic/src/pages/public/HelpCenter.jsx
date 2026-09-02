import { useState } from 'react';
import { Search, ChevronRight, ChevronDown, BookOpen, Zap, Shield, Users, Settings, Globe, MessageCircle, Phone, Mail, ExternalLink, Brain, FileText, Video, ArrowRight } from 'lucide-react';
import PublicLayout from "@/components/PublicLayout.jsx";

const CATEGORIES = [
  {
    icon: Zap,
    label: "Getting Started",
    color: "#2C3B8D",
    count: 12,
    articles: [
      "Creating your clinician account",
      "Setting up your profile & speciality",
      "Connecting your EMR / EHR",
      "Your first AI diagnostic query",
      "Understanding confidence scores",
      "Navigating the dashboard",
    ],
  },
  {
    icon: Brain,
    label: "AI Diagnostic Tools",
    color: "#277cc4",
    count: 18,
    articles: [
      "How the differential diagnosis engine works",
      "Interpreting AI probability scores",
      "Multimodal imaging analysis guide",
      "Submitting lab values for AI review",
      "Evidence level indicators explained",
      "Flagging incorrect AI suggestions",
    ],
  },
  {
    icon: FileText,
    label: "Clinical Documentation",
    color: "#0ba9ea",
    count: 14,
    articles: [
      "Ambient voice-to-SOAP note setup",
      "Reviewing and editing AI-generated notes",
      "ICD-11 auto-coding walkthrough",
      "Drafting referral letters with AI",
      "Exporting notes to your EMR",
      "Documentation audit trail",
    ],
  },
  {
    icon: Shield,
    label: "Privacy & Compliance",
    color: "#22c55e",
    count: 9,
    articles: [
      "HIPAA compliance overview",
      "PIPEDA compliance for Canadian users",
      "How patient data is handled",
      "Zero-knowledge architecture explained",
      "Data retention & deletion policies",
      "Requesting a compliance report",
    ],
  },
  {
    icon: Settings,
    label: "Account & Billing",
    color: "#6366f1",
    count: 11,
    articles: [
      "Managing your subscription plan",
      "Adding team members to your account",
      "Updating payment information",
      "Downloading invoices",
      "Cancelling or pausing your account",
      "Institutional billing setup",
    ],
  },
  {
    icon: Globe,
    label: "Integrations & API",
    color: "#f59e0b",
    count: 15,
    articles: [
      "Supported EMR integrations",
      "Epic & Cerner connector setup",
      "REST API authentication",
      "Webhook configuration",
      "FHIR R4 data mapping",
      "Rate limits and quotas",
    ],
  },
];

const FAQS = [
  {
    q: "Is EAI Doctor a replacement for clinical judgment?",
    a: "No. EAI Doctor is designed as a decision-support tool that augments physician expertise. All AI outputs are advisory only — the treating clinician retains full clinical responsibility. Our system is engineered to present evidence and probabilities, not directives.",
  },
  // {
  //   q: "What EMR systems does EAI Doctor integrate with?",
  //   a: "EAI Doctor integrates natively with Epic, Cerner, MEDITECH, Oracle Health, and Telus PS Suite. Additional integrations are available via our FHIR R4 API. Our team can also build custom connectors for enterprise clients — contact your account manager.",
  // },
  {
    q: "How is patient data protected?",
    a: "Patient data is processed using a zero-knowledge architecture — meaning identifiable information is never stored on EAI Doctor servers. All processing occurs within your institution's security boundary. We are HIPAA, PIPEDA, GDPR, and ISO 27001 certified.",
  },
  {
    q: "How often are the clinical guidelines updated?",
    a: "Our evidence engine indexes PubMed, ClinicalTrials.gov, and 140+ journals in real time. Major clinical guideline databases (AHA, ACC, NICE, CMA, WHO) are updated within 24–48 hours of a new publication. You can see the data freshness timestamp on any evidence card.",
  },
  {
    q: "Can I use EAI Doctor in a low-bandwidth or offline environment?",
    a: "Yes. EAI Doctor offers a Lite Mode with local caching of the most recent order sets and clinical protocols. Full AI diagnostic features require an internet connection, but documentation and reference tools remain available offline.",
  },
  {
    q: "How do I report an incorrect AI recommendation?",
    a: "Every AI output has a 'Flag This Response' button. Flagged responses are reviewed by our clinical safety team within 24 hours. You can track flag statuses in your account dashboard. We publish quarterly AI Safety Reports summarizing all flags and model corrections.",
  },
  // {
  //   q: "What specialities does EAI Doctor support?",
  //   a: "EAI Doctor supports 28 medical specialities including emergency medicine, internal medicine, cardiology, oncology, radiology, psychiatry, pediatrics, and family medicine. Specialty-specific modules are available — contact us to activate speciality packs for your team.",
  // },
  {
    q: "Is there a free tier or trial available?",
    a: "Yes. Individual clinicians can access a 30-day full-featured trial with no credit card required. Institutional trials (up to 50 seats, 60 days) are available by contacting our sales team. A permanent free tier with limited queries per month is also available for independent practitioners.",
  },
];

function CategoryCard({ icon: Icon, label, color, count, articles, onSelect, selected }) {
  return (
    <button
      onClick={() => onSelect(label)}
      className={`text-left w-full rounded-2xl p-6 border transition-all duration-200 group ${
        selected
          ? "border-transparent shadow-lg shadow-blue-100/60"
          : "bg-white border-gray-100 hover:border-transparent hover:shadow-lg hover:shadow-blue-100/40"
      }`}
      style={selected ? { background:`linear-gradient(135deg,${color}10,${color}18)`, borderColor:`${color}30` } : {}}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
             style={{ background:`linear-gradient(135deg,${color}20,${color}40)` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ background:`${color}12`, color }}>
          {count} articles
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-3">{label}</h3>
      <ul className="space-y-1.5">
        {articles.slice(0, 3).map(a => (
          <li key={a} className="text-xs text-gray-400 flex items-center gap-1.5 group-hover:text-gray-500 transition-colors">
            <ChevronRight className="w-3 h-3 shrink-0" style={{ color }} />
            {a}
          </li>
        ))}
      </ul>
    </button>
  );
}

function ArticleList({ category }) {
  const cat = CATEGORIES.find(c => c.label === category);
  if (!cat) return null;
  const { icon: Icon, label, color, articles } = cat;
  const extras = [
    "Troubleshooting common errors",
    "Advanced configuration options",
    "Best practices guide",
    "Video walkthrough",
  ];
  const all = [...articles, ...extras];

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100"
           style={{ background:`linear-gradient(135deg,${color}06,${color}10)` }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background:`linear-gradient(135deg,${color}25,${color}45)` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
        <span className="ml-auto text-xs text-gray-400">{all.length} articles</span>
      </div>
      <div className="divide-y divide-gray-50">
        {all.map((article, i) => (
          <button key={i}
                  className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left group">
            <FileText className="w-4 h-4 text-gray-300 shrink-0 group-hover:text-gray-400 transition-colors" />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors flex-1">{article}</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${open ? "border-blue-100 shadow-sm" : "border-gray-100 bg-white"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

const POPULAR = [
  { icon:"🚀", title:"Quick Start Guide",              time:"5 min read" },
  { icon:"🔗", title:"Epic EMR Integration Setup",     time:"8 min read" },
  { icon:"🎙️", title:"Ambient Documentation Walkthrough", time:"6 min read" },
  { icon:"🔒", title:"HIPAA Compliance Checklist",     time:"4 min read" },
  { icon:"🧠", title:"Understanding AI Confidence Scores", time:"3 min read" },
  { icon:"💊", title:"Drug Interaction Checker Guide", time:"5 min read" },
];

const STATUS = [
  { service:"AI Diagnostic Engine",      status:"operational" },
  { service:"Documentation Assistant",   status:"operational" },
  { service:"Imaging Analysis Module",   status:"degraded"    },
  { service:"eReferrals",                status:"operational" },
  { service:"API & Integrations",        status:"operational" },
  { service:"Virtual Care Platform",     status:"operational" },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = CATEGORIES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.articles.some(a => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PublicLayout mode="scrolling">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes gradShift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }

        .fade-up-1 { animation:fadeUp .55s .05s ease both; }
        .fade-up-2 { animation:fadeUp .55s .15s ease both; }
        .fade-up-3 { animation:fadeUp .55s .25s ease both; }

        .hero-gradient {
          background: linear-gradient(145deg,#0d1b4b 0%,#1a3a7c 40%,#1565a8 70%,#0ba9ea 100%);
          background-size:200% 200%;
          animation:gradShift 14s ease infinite;
        }

        .search-ring:focus-within {
          box-shadow: 0 0 0 3px rgba(39,124,196,0.2);
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

        .status-dot-operational { background:#22c55e; }
        .status-dot-degraded    { background:#f59e0b; }
        .status-dot-outage      { background:#ef4444; }
      `}</style>


      {/* ── Hero / Search ─────────────────────────────────────────────────── */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10"
             style={{ background:"radial-gradient(circle,#0ba9ea,transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="fade-up-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
               style={{ background:"rgba(11,169,234,.15)", border:"1px solid rgba(11,169,234,.3)" }}>
            <span className="w-2 h-2 rounded-full bg-[#0ba9ea] animate-pulse" />
            <span className="text-[#0ba9ea] text-xs font-semibold tracking-wide uppercase">Help Centre</span>
          </div>

          <h1 className="fade-up-2 text-white mb-3 leading-tight"
              style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(2rem,5vw,3.2rem)" }}>
            How can we help you?
          </h1>
          <p className="fade-up-3 text-white/65 text-base mb-8">
            Search our documentation, guides, and FAQs — or browse by category below.
          </p>

          {/* Search */}
          {/* <div className="fade-up-3 relative search-ring rounded-2xl overflow-hidden transition-all">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedCat(null); }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search articles, guides, FAQs…"
              className="w-full pl-14 pr-5 py-4 text-sm text-gray-900 bg-white outline-none rounded-2xl placeholder-gray-400"
            />
          </div> */}

          {/* Quick links */}
          {/* <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["Getting Started","Epic Integration","HIPAA","Billing","API Docs"].map(t => (
              <button
                key={t}
                onClick={() => setSearch(t)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.75)" }}
              >
                {t}
              </button>
            ))}
          </div> */}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14 space-y-16">

        {/* ── Popular Articles ─────────────────────────────────────────────── */}
        {/* {!search && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="section-chip mb-2 inline-block">Most Read</span>
                <h2 className="text-gray-900 font-bold text-xl" style={{ fontFamily:"'DM Serif Display',serif" }}>
                  Popular Articles
                </h2>
              </div>
              <a href="#" className="text-sm text-[#277cc4] hover:text-[#2C3B8D] font-medium flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR.map(p => (
                <button key={p.title}
                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-transparent text-left transition-all group">
                  <span className="text-2xl shrink-0">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#277cc4] transition-colors truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#277cc4] group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )} */}

        {/* ── Browse by Category ───────────────────────────────────────────── */}
        {/* <section>
          <div className="mb-6">
            <span className="section-chip mb-2 inline-block">Documentation</span>
            <h2 className="text-gray-900 font-bold text-xl" style={{ fontFamily:"'DM Serif Display',serif" }}>
              {search ? `Results for "${search}"` : "Browse by Category"}
            </h2>
            {search && (
              <p className="text-gray-400 text-sm mt-1">
                {filtered.length} categor{filtered.length === 1 ? "y" : "ies"} match your search
              </p>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No results found for "{search}"</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search term or browse the categories above.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(cat => (
                  <CategoryCard
                    key={cat.label}
                    {...cat}
                    selected={selectedCat === cat.label}
                    onSelect={l => setSelectedCat(selectedCat === l ? null : l)}
                  />
                ))}
              </div>
              {selectedCat && <ArticleList category={selectedCat} />}
            </>
          )}
        </section> */}

        {/* ── Video Guides ─────────────────────────────────────────────────── */}
        {/* {!search && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="section-chip mb-2 inline-block">Video Guides</span>
                <h2 className="text-gray-900 font-bold text-xl" style={{ fontFamily:"'DM Serif Display',serif" }}>
                  Learn by Watching
                </h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title:"Platform Overview",               duration:"4:32", tag:"Beginner" },
                { title:"AI Diagnostics Deep Dive",        duration:"8:15", tag:"Clinical" },
                { title:"EMR Integration Walkthrough",     duration:"6:44", tag:"Setup" },
                { title:"Documentation AI Setup",          duration:"5:20", tag:"Workflow" },
              ].map(v => (
                <div key={v.title}
                     className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-transparent transition-all cursor-pointer">
                  <div className="relative h-32 flex items-center justify-center"
                       style={{ background:"linear-gradient(135deg,#0d1b4b,#1565a8)" }}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg width="14" height="16" viewBox="0 0 14 16" fill="white"><path d="M1 1l12 7L1 15V1z"/></svg>
                    </div>
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background:"rgba(255,255,255,0.2)", color:"white" }}>
                      {v.duration}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0ba9ea]/80 text-white">
                      {v.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#277cc4] transition-colors">{v.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )} */}

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-10">
            <span className="section-chip mb-3 inline-block">FAQ</span>
            <h2 className="text-gray-900 font-bold" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.6rem,3vw,2.2rem)" }}>
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-sm mt-2 max-w-lg mx-auto">
              Can't find your answer? Reach out to our support team below.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
          </div>
        </section>

        {/* ── System Status ────────────────────────────────────────────────── */}
        {/* <section className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">System Status</h3>
              <p className="text-gray-400 text-xs mt-0.5">Real-time platform health</p>
            </div>
            <a href="#" className="flex items-center gap-1 text-xs text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors">
              Status Page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {STATUS.map(s => (
              <div key={s.service} className="flex items-center justify-between px-6 py-3.5">
                <span className="text-sm text-gray-700">{s.service}</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full status-dot-${s.status} ${s.status === "operational" ? "animate-pulse" : ""}`} />
                  <span className={`text-xs font-medium capitalize ${
                    s.status === "operational" ? "text-emerald-600" :
                    s.status === "degraded"    ? "text-amber-600"   : "text-red-600"
                  }`}>
                    {s.status === "operational" ? "All Systems Go" : s.status === "degraded" ? "Degraded Performance" : "Outage"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section> */}

        {/* ── Contact Support ──────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <span className="section-chip mb-3 inline-block">Contact Us</span>
            <h2 className="text-gray-900 font-bold" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.6rem,3vw,2.2rem)" }}>
              Still Need Help?
            </h2>
            <p className="text-gray-500 text-sm mt-2">Our clinical support team is available 24/7.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              // {
              //   icon: MessageCircle,
              //   title: "Live Chat",
              //   desc: "Talk to a clinical support specialist in real time. Average response: under 2 minutes.",
              //   action: "Start Chat",
              //   color: "#2C3B8D",
              //   badge: "Fastest",
              // },
              {
                icon: Mail,
                title: "Email Support",
                desc: "Send us a detailed message and we'll respond within 4 business hours with a full resolution.",
                action: "support@e-ai.ca",
                color: "#277cc4",
                badge: null,
              },
              // {
              //   icon: Phone,
              //   title: "Phone Support",
              //   desc: "Speak directly with a technical specialist. Available Mon–Fri 8am–8pm EST.",
              //   action: "1-877-302-1861",
              //   color: "#0ba9ea",
              //   badge: "Enterprise",
              // },
            ].map(c => (
              <div key={c.title}
                   className="relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-transparent transition-all duration-200 group">
                {c.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background:`${c.color}15`, color:c.color, border:`1px solid ${c.color}25` }}>
                    {c.badge}
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                     style={{ background:`linear-gradient(135deg,${c.color}20,${c.color}40)` }}>
                  <c.icon className="w-5 h-5" style={{ color:c.color }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{c.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-5">{c.desc}</p>
                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all group-hover:shadow-md"
                  style={{ background:`linear-gradient(135deg,${c.color},${c.color}cc)`, color:"white" }}
                >
                  {c.action}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Community ────────────────────────────────────────────────────── */}
        {/* <section className="rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden"
                 style={{ background:"linear-gradient(135deg,#2C3B8D 0%,#277cc4 50%,#0ba9ea 100%)" }}>
          <div className="absolute inset-0 opacity-[0.05]"
               style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize:"32px 32px" }} />
          <div className="relative z-10">
            <Users className="w-10 h-10 text-white/30 mx-auto mb-4" />
            <h2 className="text-white font-bold mb-3" style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.2rem)" }}>
              Join the Clinician Community
            </h2>
            <p className="text-white/70 text-sm max-w-xl mx-auto mb-7">
              Connect with 300,000+ EAI Doctor users. Share workflows, ask questions, and get answers 
              from clinicians who've solved the same problems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#"
                 className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#2C3B8D] font-semibold text-sm hover:bg-white/90 transition-all shadow-lg hover:-translate-y-0.5">
                Join Community Forum <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#"
                 className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium transition-all hover:bg-white/10"
                 style={{ border:"1px solid rgba(255,255,255,0.25)" }}>
                <BookOpen className="w-4 h-4" /> Browse Knowledge Base
              </a>
            </div>
          </div>
        </section> */}
      </div>
    </PublicLayout>
  );
}