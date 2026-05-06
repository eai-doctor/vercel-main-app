import { useState } from "react";
import AdminDoctorRegister from "./doctor-register";
import DashboardContent from "./dashboard-content";
import PatientResetPassword from "./patient-reset-password";
import { useAuth } from "@/context/AuthContext";

// ── Icons (inline SVG components) ──────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d={d} />
  </svg>
);

const navItems = [
  {
    section: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", icon: "M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" }],
  },
  {
    section: "Users",
    items: [
      { id: "doctors", label: "Doctor Management", icon: "M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3.314 2.686-5 6-5s6 1.686 6 5", badge: 24 },
      { id: "patients", label: "Patient Management", icon: "M6 8a3 3 0 100-6 3 3 0 000 6zM10.5 6a2.5 2.5 0 110-5 2.5 2.5 0 010 5M0 13c0-2.761 2.239-4 5-4 .93 0 1.8.216 2.545.585M10 10c2.21 0 4 1.239 4 4H7.5" },
      { id: "register", label: "Doctor Registration", icon: "M8 1v14M1 8h14" },
    ],
  },
  {
    section: "System",
    items: [
      { id: "ai", label: "AI Records", icon: "M2 3h12v8H2zM5 13h6M8 11v2" },
      { id: "logs", label: "Audit Logs", icon: "M8 1v5l3 3M8 15A7 7 0 108 1a7 7 0 000 14z" },
      { id: "settings", label: "Settings", icon: "M8 10a2 2 0 100-4 2 2 0 000 4zM13.66 6.5l.84-.84a1 1 0 000-1.41l-.75-.75a1 1 0 00-1.41 0l-.84.84A5.5 5.5 0 009 3.1V2a1 1 0 00-1-1H8a1 1 0 00-1 1v1.1a5.5 5.5 0 00-1.5.84l-.84-.84a1 1 0 00-1.41 0l-.75.75a1 1 0 000 1.41l.84.84A5.5 5.5 0 002.1 9H1a1 1 0 000 2h1.1a5.5 5.5 0 00.84 1.5l-.84.84a1 1 0 000 1.41l.75.75a1 1 0 001.41 0l.84-.84c.46.33.96.6 1.5.84V15a1 1 0 001 1h1a1 1 0 001-1v-1.1a5.5 5.5 0 001.5-.84l.84.84a1 1 0 001.41 0l.75-.75a1 1 0 000-1.41l-.84-.84c.33-.46.6-.96.84-1.5H15a1 1 0 000-2h-1.1a5.5 5.5 0 00-.24-.5z" },
    ],
  },
];





export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const { logout } = useAuth();

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

  const handleLogoutClicked = () => {
    logout();
    window.location.reload="/";
  }

  return (
    <div style={{ display: "flex", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f0f4fa", color: "#1a2340" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, minHeight: "100vh", background: "#2C3B8D",
        display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>E-AI Doctor</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 1, fontFamily: "monospace" }}>ADMIN PORTAL</div>
          <div onClick={handleLogoutClicked} className="cursor-pointer hover:underline" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, letterSpacing: 1, fontFamily: "monospace" }}>LOGOUT</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 1.2, textTransform: "uppercase", padding: "12px 12px 6px" }}>
                {section}
              </div>
              {items.map(({ id, label, icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    background: active === id ? "rgba(255,255,255,0.12)" : "none",
                    color: active === id ? "#fff" : "rgba(255,255,255,0.55)",
                    fontSize: 13.5, fontWeight: 500, border: "none",
                    width: "100%", textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon d={icon} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && (
                    <span style={{ background: "#0ba9ea", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20, fontFamily: "monospace" }}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#277cc4,#0ba9ea)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>A</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Admin</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>SUPER ADMIN</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Topbar */}
        <div style={{
          background: "#fff", borderBottom: "1px solid #e2e8f2",
          padding: "0 32px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Dashboard Overview</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#10b981",
              boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
            }} />
            <span style={{ fontSize: 12, color: "#6b7a99", fontFamily: "monospace" }}>{now}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 32, flex: 1 }}>

          {active === "dashboard" && <DashboardContent />}
            {active === "register"  && <AdminDoctorRegister onSuccess={(doc) => console.log("Registered:", doc)} />}
              {active === "patients"  && <PatientResetPassword onSuccess={(doc) => console.log("Registered:", doc)} />}
            {/* {active === "doctors"   && <div style={{padding:32}}>Doctor Management — coming soon</div>}
            {active === "patients"  && <div style={{padding:32}}>Patient Management — coming soon</div>}
            {active === "ai"        && <div style={{padding:32}}>AI Records — coming soon</div>} */}

        </div>
      </div>
    </div>
  );
}
