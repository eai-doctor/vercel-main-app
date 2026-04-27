const doctors = [
  { initials: "KL", name: "Dr. Kim Lee", email: "k.lee@hospital.com", specialty: "Cardiology", status: "active", joined: "Apr 20", color: "#2C3B8D" },
  { initials: "SP", name: "Dr. Sara Park", email: "s.park@clinic.com", specialty: "Neurology", status: "pending", joined: "Apr 19", color: "#059669" },
  { initials: "JC", name: "Dr. James Cho", email: "j.cho@medcenter.com", specialty: "Radiology", status: "active", joined: "Apr 17", color: "#7c3aed" },
  { initials: "MY", name: "Dr. Min Yoon", email: "m.yoon@hospital.com", specialty: "Dermatology", status: "inactive", joined: "Apr 12", color: "#d97706" },
];

const aiLogs = [
  { color: "#10b981", event: "Analysis completed", meta: "patient #3821 · 2 min ago" },
  { color: "#277cc4", event: "Report generated", meta: "Dr. Kim Lee · 8 min ago" },
  { color: "#f59e0b", event: "Low confidence flag", meta: "patient #3819 · 14 min ago" },
  { color: "#10b981", event: "Analysis completed", meta: "patient #3816 · 21 min ago" },
  { color: "#8b5cf6", event: "Model updated", meta: "system · 1 hr ago" },
  { color: "#10b981", event: "Analysis completed", meta: "patient #3812 · 2 hr ago" },
];

const healthItems = [
  { label: "API Server", pct: 92, color: "#10b981" },
  { label: "AI Engine", pct: 78, color: "#277cc4" },
  { label: "Database", pct: 45, color: "#10b981" },
  { label: "Storage", pct: 63, color: "#f59e0b" },
];

const quickActions = [
  { icon: "➕", label: "Register Doctor", id: "register" },
  { icon: "👥", label: "Manage Doctors", id: "doctors" },
  { icon: "🏥", label: "Manage Patients", id: "patients" },
  { icon: "📊", label: "AI Reports", id: "ai" },
];

const statusStyle = {
  active:   { bg: "rgba(16,185,129,0.1)", color: "#059669" },
  pending:  { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  inactive: { bg: "rgba(107,122,153,0.1)", color: "#6b7a99" },
};

function DashboardContent(){
    return (
        <>
                      {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
            {[
              { accent: "#2C3B8D", icon: "👤", label: "Active Users", value: "1,284", badge: "↑ 12%", up: true, sub: "vs last month" },
              { accent: "#10b981", icon: "🩺", label: "Doctors", value: "24", badge: "+3", up: true, sub: "this month" },
              { accent: "#f59e0b", icon: "🏥", label: "Patients", value: "1,260", badge: "↑ 8%", up: true, sub: "vs last month" },
              { accent: "#8b5cf6", icon: "🤖", label: "AI Analyses Today", value: "347", badge: "↓ 4%", up: false, sub: "vs yesterday" },
            ].map(({ accent, icon, label, value, badge, up, sub }) => (
              <div key={label} style={{
                background: "#fff", border: "1px solid #e2e8f2", borderRadius: 14,
                padding: "20px 22px", position: "relative", overflow: "hidden",
                cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                {/* Top accent bar */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
                {/* Icon */}
                <div style={{ position: "absolute", right: 18, top: 18, width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{icon}</div>
                <div style={{ fontSize: 11.5, fontWeight: 500, color: "#6b7a99", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, fontFamily: "monospace" }}>{value}</div>
                <div style={{ fontSize: 11.5, color: "#6b7a99", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: up ? "#059669" : "#ef4444" }}>{badge}</span>
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {/* ── Two Column ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 16 }}>

            {/* Doctor Table */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f2", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f2" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Recent Doctors</span>
                <button onClick={() => setActive("doctors")} style={{ fontSize: 12, fontWeight: 500, color: "#277cc4", background: "none", border: "none", cursor: "pointer" }}>View all →</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Doctor", "Specialty", "Status", "Joined", ""].map(h => (
                      <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#6b7a99", textTransform: "uppercase", letterSpacing: 0.6, textAlign: "left", padding: "10px 22px", background: "#f7f9fc", borderBottom: "1px solid #e2e8f2" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.email} style={{ cursor: "default" }}
                      onMouseEnter={e => [...e.currentTarget.cells].forEach(c => c.style.background = "#f7f9fc")}
                      onMouseLeave={e => [...e.currentTarget.cells].forEach(c => c.style.background = "")}
                    >
                      <td style={{ padding: "12px 22px", borderBottom: "1px solid #e2e8f2" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: doc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{doc.initials}</div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{doc.name}</div>
                            <div style={{ fontSize: 11.5, color: "#6b7a99" }}>{doc.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 22px", fontSize: 12.5, color: "#6b7a99", borderBottom: "1px solid #e2e8f2" }}>{doc.specialty}</td>
                      <td style={{ padding: "12px 22px", borderBottom: "1px solid #e2e8f2" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, fontFamily: "monospace", background: statusStyle[doc.status].bg, color: statusStyle[doc.status].color }}>
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: "12px 22px", fontSize: 12, color: "#6b7a99", fontFamily: "monospace", borderBottom: "1px solid #e2e8f2" }}>{doc.joined}</td>
                      <td style={{ padding: "12px 22px", borderBottom: "1px solid #e2e8f2" }}>
                        <button style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid #e2e8f2", background: "#fff", color: "#1a2340", transition: "all 0.12s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "#277cc4"; e.currentTarget.style.color = "#277cc4"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f2"; e.currentTarget.style.color = "#1a2340"; }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Log */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f2", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f2" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>AI Activity</span>
                <button onClick={() => setActive("ai")} style={{ fontSize: 12, fontWeight: 500, color: "#277cc4", background: "none", border: "none", cursor: "pointer" }}>See all →</button>
              </div>
              {aiLogs.map((log, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: i < aiLogs.length - 1 ? "1px solid #e2e8f2" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.color, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{log.event}</div>
                    <div style={{ fontSize: 11, color: "#6b7a99", marginTop: 2, fontFamily: "monospace" }}>{log.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Quick Actions */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f2", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #e2e8f2" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Quick Actions</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: 16 }}>
                {quickActions.map(({ icon, label, id }) => (
                  <button key={id} onClick={() => setActive(id)} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "14px 16px", borderRadius: 10,
                    border: "1.5px dashed #e2e8f2", background: "#f7f9fc",
                    cursor: "pointer", fontSize: 12.5, fontWeight: 500,
                    color: "#1a2340", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#277cc4"; e.currentTarget.style.color = "#277cc4"; e.currentTarget.style.background = "rgba(39,124,196,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f2"; e.currentTarget.style.color = "#1a2340"; e.currentTarget.style.background = "#f7f9fc"; }}
                  >
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* System Health */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f2", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f2" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>System Health</span>
                <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>● All systems operational</span>
              </div>
              <div>
                {healthItems.map(({ label, pct, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", padding: "12px 22px", borderBottom: "1px solid #e2e8f2" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, width: 90 }}>{label}</span>
                    <div style={{ flex: 1, margin: "0 14px", height: 5, background: "#e2e8f2", borderRadius: 10, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 10 }} />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#6b7a99", width: 36, textAlign: "right" }}>{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
    )
}

export default DashboardContent;