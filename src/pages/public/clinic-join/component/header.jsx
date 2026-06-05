import logoImage from "/images/logo.png";

const Header = ({headerMenus = [], setModalOpen}) => {
    return (
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100/80">
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
                <a href="/demo-request"
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
        </header>
    )
}

export default Header;