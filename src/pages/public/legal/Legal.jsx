import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Shield, Cookie, FileText, ExternalLink, ArrowRight, CheckCircle, Printer, ArrowLeft, Download, FileSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import logoImage from "/images/logo.png";
import PublicLayout from '@/components/PublicLayout';

function TableOfContents({ sections, activeId, onSelect }) {
  return (
    <nav className="space-y-1">
      {sections.map(s => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all ${
            activeId === s.id
              ? "bg-[#2C3B8D]/8 text-[#2C3B8D] font-semibold"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          }`}
        >
          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeId === s.id ? "text-[#2C3B8D]" : "text-gray-300"}`} />
          {s.title}
        </button>
      ))}
    </nav>
  );
}

function Section({ id, title, children }) {
  return (
    <div id={id} className="scroll-mt-24 mb-12">
      <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
          style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function P({ children }) {
  return <p className="text-gray-600 text-sm leading-relaxed">{children}</p>;
}

function UL({ items }) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
          <CheckCircle className="w-4 h-4 text-[#277cc4] shrink-0 mt-0.5" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-6">
      <h3 className="text-gray-800 font-semibold text-sm mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Highlight({ children }) {
  return (
    <div className="rounded-xl p-4 text-sm text-[#1a3a7c] leading-relaxed"
         style={{ background:"rgba(39,124,196,0.07)", border:"1px solid rgba(39,124,196,0.15)" }}>
      {children}
    </div>
  );
}

function CookieToggle({ name, desc, required, defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          {required && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background:"rgba(34,197,94,0.12)", color:"#16a34a", border:"1px solid rgba(34,197,94,0.2)" }}>
              Required
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={() => !required && setOn(!on)}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 mt-0.5 ${on ? "bg-[#277cc4]" : "bg-gray-200"} ${required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
        active ? "text-white shadow-md" : "text-gray-500 hover:text-gray-800 bg-white border border-gray-200 hover:border-gray-300"
      }`}
      style={active ? { background:"linear-gradient(135deg,#2C3B8D,#277cc4)" } : {}}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

const TERMS_SECTIONS = [
  { id:"acceptance",    title:"1. Acceptance of Terms" },
  { id:"description",   title:"2. Service Description" },
  { id:"eligibility",   title:"3. Eligibility & Registration" },
  { id:"clinical",      title:"4. Clinical Use & Disclaimer" },
  { id:"data",          title:"5. Data & Privacy" },
  { id:"ip",            title:"6. Intellectual Property" },
  { id:"prohibited",    title:"7. Prohibited Uses" },
  { id:"liability",     title:"8. Limitation of Liability" },
  { id:"indemnity",     title:"9. Indemnification" },
  { id:"termination",   title:"10. Termination" },
  { id:"governing",     title:"11. Governing Law" },
  { id:"changes",       title:"12. Changes to Terms" },
  { id:"contact-terms", title:"13. Contact Information" },
];

function TermsContent() {
  return (
    <div>
      <Section id="acceptance" title="1. Acceptance of Terms">
        <Highlight>By accessing or using the EAI Doctor platform ("Service"), you agree to be bound by these Terms of Use. If you do not agree, you may not access or use the Service. These Terms constitute a legally binding agreement between you and EAI Doctor Corporation.</Highlight>
        <P>These Terms apply to all users including clinicians, healthcare administrators, institutional account holders, and API users. Your continued use following any updates constitutes acceptance of those changes.</P>
        <P>Last updated: January 15, 2025. Effective date: February 1, 2025.</P>
      </Section>
      <Section id="description" title="2. Service Description">
        <P>EAI Doctor provides a medical AI platform offering clinical decision support, diagnostic reasoning, documentation automation, evidence synthesis, and related healthcare technology services.</P>
        <SubSection title="The Service includes but is not limited to:">
          <UL items={["AI-powered differential diagnosis and clinical reasoning support","Real-time evidence synthesis from peer-reviewed medical literature","Ambient voice-to-documentation technology (SOAP notes, referral letters)","Drug interaction screening and precision dosing guidance","Multimodal imaging analysis and annotation tools","Clinical order sets, pathways, and LTC support tools","eReferral management and virtual care coordination","API access for institutional and developer integrations"]} />
        </SubSection>
      </Section>
      <Section id="eligibility" title="3. Eligibility & Registration">
        <P>The Service is intended for licensed healthcare professionals and authorized institutional personnel. By registering, you represent that:</P>
        <UL items={["You are a licensed healthcare professional or authorized institutional user","You are at least 18 years of age","You have authority to bind yourself or your institution to these Terms","All registration information you provide is accurate, current, and complete","Your use will comply with all applicable laws and regulations"]} />
        <SubSection title="Account Credentials">
          <P>You are responsible for maintaining the confidentiality of your credentials and all activity under your account. Notify us immediately of any unauthorized use at security@eaidoctor.com.</P>
        </SubSection>
      </Section>
      <Section id="clinical" title="4. Clinical Use & Disclaimer">
        <Highlight>⚕️ IMPORTANT: EAI Doctor is a clinical decision support tool. All AI-generated outputs are advisory only and do not constitute medical advice, diagnosis, or treatment. The treating clinician retains full clinical responsibility for all patient care decisions.</Highlight>
        <P>EAI Doctor's AI outputs are designed to assist — not replace — clinical judgment. No output should be acted upon without independent professional assessment by a qualified healthcare provider.</P>
        <SubSection title="Evidence Currency">
          <P>While EAI Doctor updates evidence databases in near real-time, users should verify that AI-cited guidelines are current and applicable to their specific patient population and jurisdiction.</P>
        </SubSection>
      </Section>
      <Section id="data" title="5. Data & Privacy">
        <P>Your use is also governed by our Privacy Policy, incorporated by reference. EAI Doctor processes personal data in accordance with HIPAA, PIPEDA, GDPR, and other applicable regional frameworks.</P>
        <SubSection title="De-identified & Aggregated Data">
          <P>EAI Doctor may use de-identified, aggregated data to improve AI models and conduct research, provided such data cannot reasonably identify any individual patient or user.</P>
        </SubSection>
      </Section>
      <Section id="ip" title="6. Intellectual Property">
        <P>All content, features, and functionality — including AI models, clinical content, order sets, and software — are owned by EAI Doctor Corporation or its licensors.</P>
        <UL items={["EAI Doctor grants a limited, non-exclusive, non-transferable license to use the Service for its intended clinical purposes","You may not copy, reproduce, or create derivative works without express written permission","You retain ownership of patient data and clinical notes you create using the Service","Feedback you provide may be used by EAI Doctor without compensation or attribution"]} />
      </Section>
      <Section id="prohibited" title="7. Prohibited Uses">
        <P>You agree not to use the Service to:</P>
        <UL items={["Violate any applicable law or regulation","Provide false or misleading information during registration","Reverse-engineer, decompile, or extract source code from the Service","Use automated means to access the Service without authorization","Circumvent any security or access control features","Provide clinical services for which you are not licensed","Re-sell or sub-license access without written authorization","Introduce malicious code or software intended to damage the Service"]} />
      </Section>
      <Section id="liability" title="8. Limitation of Liability">
        <Highlight>TO THE MAXIMUM EXTENT PERMITTED BY LAW, EAI DOCTOR SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE, INCLUDING DAMAGES FOR CLINICAL OUTCOMES, LOSS OF DATA, OR BUSINESS INTERRUPTION.</Highlight>
        <P>EAI Doctor's total cumulative liability shall not exceed the greater of (a) amounts paid by you in the twelve months preceding the claim, or (b) CAD $500.</P>
      </Section>
      <Section id="indemnity" title="9. Indemnification">
        <P>You agree to indemnify and hold harmless EAI Doctor Corporation from any claims, damages, or expenses arising from your use of the Service in violation of these Terms, your violation of any applicable law, or your clinical decisions made with or without reference to AI outputs.</P>
      </Section>
      <Section id="termination" title="10. Termination">
        <P>Either party may terminate your access at any time. EAI Doctor may suspend or terminate your account immediately if you breach these Terms, if required by law, or if continued access poses a security risk. Provisions that by their nature should survive termination shall do so.</P>
      </Section>
      <Section id="governing" title="11. Governing Law">
        <P>These Terms are governed by the laws of the Province of Ontario and the federal laws of Canada, without regard to conflict of law principles. Disputes shall be subject to the exclusive jurisdiction of the courts of Ontario, Canada.</P>
      </Section>
      <Section id="changes" title="12. Changes to Terms">
        <P>EAI Doctor may revise these Terms at any time. We will provide at least 30 days' advance notice of material changes via email or in-app notice. Continued use after the effective date constitutes acceptance of the revised Terms.</P>
      </Section>
      <Section id="contact-terms" title="13. Contact Information">
        <P>For questions about these Terms, please contact our Legal team:</P>
        <div className="rounded-xl p-5 bg-white border border-gray-100 space-y-1.5 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-800">EAI Doctor Corporation</span></p>
          <p>199 Bay Street, Suite 4000, Toronto, ON M5L 1A9, Canada</p>
          <p>Legal: <a href="mailto:support@eaidoctor.com" className="text-[#277cc4] hover:underline">support@e-ai.ca</a></p>
          <p>Privacy: <a href="mailto:support@eaidoctor.com" className="text-[#277cc4] hover:underline">support@e-ai.ca</a></p>
          <p>Security: <a href="mailto:support@eaidoctor.com" className="text-[#277cc4] hover:underline">support@e-ai.ca</a></p>
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COOKIE SECTIONS & CONTENT
───────────────────────────────────────────────────────────────────────────── */
const COOKIE_SECTIONS = [
  { id:"what-are",       title:"1. What Are Cookies?" },
  { id:"types",          title:"2. Types of Cookies We Use" },
  { id:"third-party",    title:"3. Third-Party Cookies" },
  { id:"manage",         title:"4. Managing Your Preferences" },
  { id:"browser",        title:"5. Browser-Level Controls" },
  { id:"consent",        title:"6. Cookie Consent" },
  { id:"retention",      title:"7. Cookie Retention" },
  { id:"updates",        title:"8. Policy Updates" },
  { id:"contact-cookie", title:"9. Contact Us" },
];

const COOKIE_TYPES = [
  { name:"Strictly Necessary Cookies", required:true, defaultOn:true, desc:"Essential for the platform to function. They enable core security features, maintain your session, and allow secure navigation. They cannot be disabled.", examples:["Session authentication token","CSRF protection","Load balancer affinity","Cookie consent preference"], color:"#22c55e" },
  { name:"Functional Cookies", required:false, defaultOn:true, desc:"Remember your preferences and settings to provide a more personalized experience — such as language selection and dashboard layout.", examples:["Language & locale preference","Dashboard layout settings","Recently accessed records","Notification preferences"], color:"#277cc4" },
  { name:"Analytics Cookies", required:false, defaultOn:false, desc:"Help us understand how clinicians use the platform so we can improve performance and prioritize features. All data is anonymized.", examples:["Google Analytics 4 (anonymized)","Feature usage heatmaps","Error and crash reporting","Performance monitoring"], color:"#6366f1" },
  { name:"Marketing Cookies", required:false, defaultOn:false, desc:"Track interactions with our marketing materials to help us communicate more relevant information about EAI Doctor features and updates.", examples:["Email campaign tracking","Landing page attribution","Referral source tracking","A/B test assignment"], color:"#f59e0b" },
];

function CookieTypeCard({ name, required, defaultOn, desc, examples, color }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{name}</span>
            {required && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:"rgba(34,197,94,0.12)", color:"#16a34a", border:"1px solid rgba(34,197,94,0.2)" }}>Always Active</span>}
          </div>
          <span className="text-xs font-medium shrink-0" style={{ color }}>{defaultOn ? "On by Default" : "Off by Default"}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">{desc}</p>
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color }}>
          {expanded ? "Hide examples" : "View examples"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Examples</p>
          <ul className="space-y-1.5">
            {examples.map(e => (
              <li key={e} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:color }} />{e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CookiePolicyContent() {
  return (
    <div>
      <Section id="what-are" title="1. What Are Cookies?">
        <P>Cookies are small text files placed on your device when you visit a website or use a web application. EAI Doctor uses cookies and similar technologies to make our platform work efficiently, remember your preferences, and provide usage information.</P>
        <Highlight>EAI Doctor does not use cookies to store patient health information or personally identifiable clinical data. Sensitive clinical data is managed separately under our Privacy Policy and zero-knowledge architecture.</Highlight>
      </Section>
      <Section id="types" title="2. Types of Cookies We Use">
        <P>We categorize our cookies into four types. You can manage preferences for non-essential cookies using the controls below:</P>
        <div className="space-y-4 mt-4">
          {COOKIE_TYPES.map(ct => <CookieTypeCard key={ct.name} {...ct} />)}
        </div>
        <div className="mt-8 p-5 rounded-2xl border" style={{ background:"rgba(44,59,141,0.04)", borderColor:"rgba(44,59,141,0.12)" }}>
          <p className="text-sm font-semibold text-gray-900 mb-4">Your Cookie Preferences</p>
          <div className="space-y-3">
            {COOKIE_TYPES.map(ct => <CookieToggle key={ct.name} name={ct.name} desc={ct.desc.split(".")[0] + "."} required={ct.required} defaultOn={ct.defaultOn} />)}
          </div>
          <button className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:-translate-y-0.5" style={{ background:"linear-gradient(135deg,#2C3B8D,#277cc4)" }}>Save My Preferences</button>
        </div>
      </Section>
      <Section id="third-party" title="3. Third-Party Cookies">
        <P>Some cookies are set by third-party service providers we work with. These third parties have their own privacy and cookie policies.</P>
        <div className="space-y-3 mt-2">
          {[
            { provider:"Google Analytics 4", purpose:"Anonymized usage analytics and performance monitoring", policy:"https://policies.google.com/privacy" },
            { provider:"Intercom",           purpose:"In-app messaging, support chat, and user onboarding", policy:"https://www.intercom.com/legal/privacy" },
            { provider:"Stripe",             purpose:"Payment processing and fraud prevention", policy:"https://stripe.com/privacy" },
            { provider:"Sentry",             purpose:"Error tracking and crash reporting (anonymized)", policy:"https://sentry.io/privacy/" },
            { provider:"Cloudflare",         purpose:"DDoS protection, CDN performance, and bot detection", policy:"https://www.cloudflare.com/privacypolicy/" },
          ].map(tp => (
            <div key={tp.provider} className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-semibold text-gray-900">{tp.provider}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tp.purpose}</p>
              </div>
              <a href={tp.policy} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors shrink-0">
                Policy <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </Section>
      <Section id="manage" title="4. Managing Your Preferences">
        <P>You can update your cookie preferences at any time using the preference panel in Section 2 of this policy, or by clicking "Cookie Settings" in the footer of any page. Your preferences are stored for 12 months.</P>
        <UL items={["Withdrawing consent: you can withdraw consent for non-essential cookies at any time","Opting out of analytics: opt-out of Google Analytics at analytics.google.com/analytics/optout","Do Not Track: EAI Doctor respects the DNT browser signal for analytics cookies","Institutional settings: admins can set default cookie policies for all users in their organization"]} />
      </Section>
      <Section id="browser" title="5. Browser-Level Controls">
        <P>Most browsers allow you to control cookies through their settings. Note that disabling all cookies may impact platform functionality, particularly authentication and session management.</P>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          {[
            { browser:"Google Chrome",   url:"https://support.google.com/chrome/answer/95647" },
            { browser:"Mozilla Firefox", url:"https://support.mozilla.org/kb/cookies" },
            { browser:"Apple Safari",    url:"https://support.apple.com/guide/safari/manage-cookies" },
            { browser:"Microsoft Edge",  url:"https://support.microsoft.com/microsoft-edge" },
          ].map(b => (
            <a key={b.browser} href={b.url} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group">
              <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{b.browser}</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#277cc4] transition-colors" />
            </a>
          ))}
        </div>
      </Section>
      <Section id="consent" title="6. Cookie Consent">
        <P>When you first access EAI Doctor, you will be presented with a cookie consent banner allowing you to accept all, reject non-essential cookies, or customize preferences. Your consent is recorded with a timestamp.</P>
        <SubSection title="Legal Basis">
          <P>For EU/UK users, we rely on consent (Art. 6(1)(a) GDPR) for non-essential cookies. Strictly necessary cookies are set on the basis of legitimate interests (Art. 6(1)(f) GDPR). For Canadian users, we comply with CASL and applicable provincial privacy legislation.</P>
        </SubSection>
      </Section>
      <Section id="retention" title="7. Cookie Retention">
        <div className="overflow-hidden rounded-xl border border-gray-100 mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background:"rgba(44,59,141,0.05)" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cookie Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Retention Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {[["Session cookies","Deleted when browser is closed"],["Authentication","Up to 30 days (or until logout)"],["Preferences","12 months"],["Analytics","24 months"],["Consent record","3 years (audit purposes)"],["Marketing","90 days"]].map(([type, period]) => (
                <tr key={type} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{type}</td>
                  <td className="px-4 py-3 text-gray-500">{period}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section id="updates" title="8. Policy Updates">
        <P>We may update this Cookie Policy from time to time. We will notify you of material changes by posting the updated policy with a new effective date and, where appropriate, via in-app notification or email.</P>
      </Section>
      <Section id="contact-cookie" title="9. Contact Us">
        <P>For questions about our use of cookies, please contact our Privacy team:</P>
        <div className="rounded-xl p-5 bg-white border border-gray-100 space-y-1.5 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-800">Privacy Officer — EAI Doctor Corporation</span></p>
          <p>199 Bay Street, Suite 4000, Toronto, ON M5L 1A9</p>
          <p>Email: <a href="mailto:privacy@eaidoctor.com" className="text-[#277cc4] hover:underline">privacy@eaidoctor.com</a></p>
          <p>For EU/UK inquiries (GDPR): <a href="mailto:dpo@eaidoctor.com" className="text-[#277cc4] hover:underline">dpo@eaidoctor.com</a></p>
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PRIVACY POLICY CONTENT (from uploaded component)
───────────────────────────────────────────────────────────────────────────── */
const PRIVACY_DOCS = [
  { key:"pia",    filename:"PIA.pdf",                                  icon:FileSearch, color:"#2C3B8D", bgColor:"#EEF0FA" },
  { key:"breach", filename:"PRIVACY_INCIDENT_BREACH_RESPONSE_POLICY.pdf", icon:Shield,    color:"#0F6E56", bgColor:"#E1F5EE" },
  { key:"policy", filename:"PRIVACY_POLICY.pdf",                       icon:FileText,   color:"#993C1D", bgColor:"#FAECE7" },
];

const PRIVACY_SECTIONS = [
  { id:"priv-summary",    title:"1. Summary" },
  { id:"priv-scope",      title:"2. Scope" },
  { id:"priv-purpose",    title:"3. Purpose of Collection" },
  { id:"priv-ai",         title:"4. AI & Data Processing" },
  { id:"priv-third",      title:"5. Third-Party Sharing" },
  { id:"priv-rights",     title:"6. Your Rights" },
  { id:"priv-officer",    title:"7. Privacy Officer" },
  { id:"priv-documents",  title:"8. Security Documents" },
];

function DocumentCard({ doc, t }) {
  const Icon = doc.icon;
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/${doc.filename}`;
    link.download = doc.filename;
    link.click();
  };
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: doc.bgColor }}>
          <Icon size={20} style={{ color: doc.color }} />
        </div>
        <div>
          <p className="font-medium text-[#1e293b] text-sm leading-snug">{t(`documents.${doc.key}.title`)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t(`documents.${doc.key}.desc`)}</p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors flex-shrink-0 ml-4"
      >
        <Download size={13} />
        {t("documents.downloadBtn")}
      </button>
    </div>
  );
}

function PrivacyPolicyContent() {
  const { t } = useTranslation("privacy");
  const contentRef = useRef(null);

  return (
    <div ref={contentRef}>
      {/* Print / Back actions */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">Privacy Policy</p>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm text-gray-600"
          >
            <ArrowLeft size={15} />
            {t("back")}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ background:"linear-gradient(135deg,#2C3B8D,#277cc4)" }}
          >
            <Printer size={15} />
            {t("download")}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div id="priv-summary" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          1. Summary
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">{t("summary.body")}</p>
      </div>

      {/* Scope */}
      <div id="priv-scope" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          2. Scope
        </h2>
        <ul className="space-y-2 mt-2">
          {t("scope.items", { returnObjects: true }).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#277cc4] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Purpose */}
      <div id="priv-purpose" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          3. Purpose of Collection
        </h2>
        <ul className="space-y-2 mt-2">
          {t("purpose.items", { returnObjects: true }).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#277cc4] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI */}
      <div id="priv-ai" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          4. AI & Data Processing
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">{t("ai.body")}</p>
      </div>

      {/* Third Party */}
      <div id="priv-third" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          5. Third-Party Sharing
        </h2>
        <ul className="space-y-2 mt-2">
          {t("thirdParty.items", { returnObjects: true }).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#277cc4] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rights */}
      <div id="priv-rights" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          6. Your Rights
        </h2>
        <ul className="space-y-2 mt-2">
          {t("rights.items", { returnObjects: true }).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#277cc4] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Officer */}
      <div id="priv-officer" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-4 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          7. Privacy Officer
        </h2>
        <div className="rounded-xl p-5 bg-white border border-gray-100 space-y-1.5 text-sm text-gray-600">
          <p><strong className="text-gray-800">{t("officer.nameLabel")}:</strong> {t("officer.name")}</p>
          <p><strong className="text-gray-800">{t("officer.emailLabel")}:</strong>{" "}
            <a href={`mailto:${t("officer.email")}`} className="text-[#277cc4] hover:underline">{t("officer.email")}</a>
          </p>
        </div>
      </div>

      {/* Security Documents */}
      <div id="priv-documents" className="scroll-mt-24 mb-12">
        <h2 className="text-gray-900 font-bold mb-2 pb-3 border-b border-gray-100"
            style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.2rem,2.5vw,1.5rem)" }}>
          8. Security Documents
        </h2>
        <p className="text-sm text-gray-500 mb-5">{t("documents.subtitle")}</p>
        <div className="space-y-3">
          {PRIVACY_DOCS.map(doc => <DocumentCard key={doc.key} doc={doc} t={t} />)}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN LEGAL PAGE
───────────────────────────────────────────────────────────────────────────── */
const TAB_CONFIG = {
  terms:   { label:"Terms of Use",    icon:FileText, sections:TERMS_SECTIONS,   defaultId:"acceptance" },
  cookies: { label:"Cookie Policy",   icon:Cookie,   sections:COOKIE_SECTIONS,  defaultId:"what-are"   },
  privacy: { label:"Privacy Policy",  icon:Shield,   sections:PRIVACY_SECTIONS, defaultId:"priv-summary" },
};

export default function LegalPage() {
  const [tab, setTab] = useState("terms");
  const [activeId, setActiveId] = useState("acceptance");

  const currentConfig = TAB_CONFIG[tab];

  const scrollTo = (id) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
  };

  const switchTab = (t) => {
    setTab(t);
    setActiveId(TAB_CONFIG[t].defaultId);
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  return (
    <PublicLayout mode="scrolling">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes gradShift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        .hero-gradient {
          background: linear-gradient(145deg,#0d1b4b 0%,#1a3a7c 40%,#1565a8 70%,#0ba9ea 100%);
          background-size:200% 200%;
          animation:gradShift 14s ease infinite;
        }
        .btn-primary { background:linear-gradient(135deg,#2C3B8D,#277cc4); transition:all .2s ease; }
        .btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(44,59,141,.35); }
        @media print {
          header, footer, aside, .no-print { display:none !important; }
          main { padding:0 !important; }
        }
      `}</style>

      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
             style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
               style={{ background:"rgba(11,169,234,.15)", border:"1px solid rgba(11,169,234,.3)" }}>
            <span className="w-2 h-2 rounded-full bg-[#0ba9ea] animate-pulse" />
            <span className="text-[#0ba9ea] text-xs font-semibold tracking-wide uppercase">Legal & Privacy</span>
          </div>
          <h1 className="text-white mb-3 font-bold leading-tight"
              style={{ fontFamily:"'DM Serif Display',serif", fontSize:"clamp(1.8rem,4vw,3rem)" }}>
            Transparency You Can Trust
          </h1>
          <p className="text-white/65 text-base max-w-xl mx-auto mb-8">
            Clear, readable legal documents — written for humans, not just lawyers.
          </p>

          {/* 3-tab switcher */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full flex-wrap justify-center"
               style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)" }}>
            {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
              <TabBtn key={key} active={tab===key} onClick={() => switchTab(key)} icon={cfg.icon} label={cfg.label} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
            <span>Last updated: January 15, 2025</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Effective: February 1, 2025</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Version 3.2</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-10 items-start">

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 no-print">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4 px-1">
                {(() => { const Icon = currentConfig.icon; return <Icon className="w-4 h-4 text-[#2C3B8D]" />; })()}
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{currentConfig.label}</span>
              </div>
              <TableOfContents sections={currentConfig.sections} activeId={activeId} onSelect={scrollTo} />

              {/* Switch tabs */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-1">
                {Object.entries(TAB_CONFIG).filter(([k]) => k !== tab).map(([key, cfg]) => (
                  <button key={key} onClick={() => switchTab(key)}
                          className="flex items-center gap-2 text-xs text-[#277cc4] hover:text-[#2C3B8D] font-medium transition-colors w-full py-1">
                    <cfg.icon className="w-3.5 h-3.5" /> {cfg.label}
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Download PDF */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-700 mb-1">Download PDF</p>
              <p className="text-xs text-gray-400 mb-3">Save a copy for your records.</p>
              <button className="w-full py-2 rounded-xl text-xs font-semibold text-white btn-primary">
                Download PDF
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Mobile tab switcher */}
            <div className="lg:hidden flex flex-wrap gap-2 mb-8 no-print">
              {Object.entries(TAB_CONFIG).map(([key, cfg]) => (
                <TabBtn key={key} active={tab===key} onClick={() => switchTab(key)} icon={cfg.icon} label={cfg.label} />
              ))}
            </div>

            {/* Page header card */}
            <div className="rounded-2xl p-6 mb-10 flex items-start gap-4"
                 style={{ background:"linear-gradient(135deg,rgba(44,59,141,0.06),rgba(39,124,196,0.06))", border:"1px solid rgba(39,124,196,0.12)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background:"linear-gradient(135deg,#2C3B8D22,#277cc444)" }}>
                {(() => { const Icon = currentConfig.icon; return <Icon className="w-5 h-5 text-[#2C3B8D]" />; })()}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base mb-1">{currentConfig.label}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {tab === "terms"   && "This agreement governs your use of the EAI Doctor platform and services. Please read carefully before using our Service."}
                  {tab === "cookies" && "This policy explains how EAI Doctor uses cookies and similar tracking technologies, and how you can control them."}
                  {tab === "privacy" && "This policy explains how EAI Doctor collects, uses, and protects personal and clinical data across our platform."}
                </p>
              </div>
            </div>

            {tab === "terms"   && <TermsContent />}
            {tab === "cookies" && <CookiePolicyContent />}
            {tab === "privacy" && <PrivacyPolicyContent />}

            {/* Bottom nav */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
              <p className="text-xs text-gray-400">
                Questions? Email <a href="mailto:legal@e-ai.ca" className="text-[#277cc4] hover:underline">support@e-ai.ca</a>
              </p>
              <div className="flex gap-3">
                {Object.entries(TAB_CONFIG).filter(([k]) => k !== tab).map(([key, cfg]) => (
                  <button key={key} onClick={() => switchTab(key)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                    {cfg.label} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0a1228] text-white/55 text-sm mt-16 no-print">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <img src={logoImage} alt="EAI Doctor" className="h-7 w-auto mb-3 brightness-0 invert opacity-80" />
            <p className="text-xs leading-relaxed max-w-xs mb-4">
              Medical AI platform giving every clinician access to frontier AI — diagnostic support, evidence synthesis, and intelligent documentation.
            </p>
            <div className="flex gap-3">
              {["𝕏","in","f"].map(s => (
                <a key={s} href="#" className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs hover:border-white/40 hover:text-white transition-colors">{s}</a>
              ))}
            </div>
          </div>
          {[
            { title:"Products",  links:["Order Sets","eReferrals","Virtual Care","eForms","Digital Front Door"] },
            { title:"Company",   links:["About Us","Leadership","Careers","News","Events"] },
            { title:"Support",   links:["Help Centre","Privacy Policy","Accessibility","Terms of Use","Cookie Policy"] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-white font-semibold text-xs uppercase tracking-widest mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="hover:text-white transition-colors text-xs">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.08] max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} EAI Doctor Corporation. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Canada</a>
            <span className="text-white/20">|</span>
            <a href="#" className="hover:text-white transition-colors">United States</a>
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
}