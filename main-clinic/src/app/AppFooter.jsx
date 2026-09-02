import logoImage from "/images/logo.png";

export default function AppFooter() {
  return (
    <>
    <footer className="bg-[#0a1228] text-white/55 text-sm">
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2">
                <img src={logoImage} alt="EAI Doctor" className="h-7 w-auto mb-3 brightness-0 invert opacity-80" />
                <p className="text-xs leading-relaxed max-w-xs mb-4">
                  Medical AI platform giving every clinician access to frontier AI — diagnostic support, evidence synthesis, and intelligent documentation.
                </p>
                <div className="flex gap-3">
                  {[["Ⓑ","https://tech.e-ai.ca/"]].map(s => (
                    <a key={s} href={s[1]} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-xs hover:border-white/40 hover:text-white transition-colors">{s[0]}</a>
                  ))}
                </div>
              </div>
              {[
                // { title:"Products",  links:["Order Sets","eReferrals","Virtual Care","eForms","Digital Front Door"] },
                { title:"Privacy Officer",  
                  links:[
                    { value: "Dr. Zhenlong Liu", url: "#" }, 
                    { value: "Email: support@e-ai.ca", url: "mailto:support@e-ai.ca" }, 
                    { value: "Phone: +1 (450) 688-8377", url: "tel:+14506888377" }] },
                { title:"Company",   
                  links:[
                    {value:"About Us", url: "https://web.e-ai.ca/"}, 
                    { value: "News", url: "https://tech.e-ai.ca" }, 
              ]},
                // { title:"Company",   links:["About Us","Leadership","Careers","News","Events"] },
                // { title:"Support",   links:["Help Centre","Privacy Policy","Accessibility","Terms of Use","Cookie Policy"] },
                { title:"Support",   
                  links:[ 
                    { value : "Help Centre", url: "/help-center" },
                    { value: "Privacy Policy", url: "/legal" },
                    // { value: "Accessibility", url: "#" },
                    { value: "Terms of Use", url: "/legal" },
                    { value: "Cookie Policy", url: "/legal" }
                  ]
                }
              ].map(col => (
                <div key={col.title}>
                  <p className="text-white font-semibold text-xs uppercase tracking-widest mb-3">{col.title}</p>
                  <ul className="space-y-2">
                    {col.links.map((l, index) => (
                      <li key={index}><a href={l.url} className="hover:text-white transition-colors text-xs">{l.value}</a></li>
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
                <a href="/admin/login" className="hover:text-white transition-colors">Dashboard</a>
              </div>
            </div>
          </footer>
    </>
  );
}
