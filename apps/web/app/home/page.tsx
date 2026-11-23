import AppShell from "../../components/AppShell";

export default function HomePage() {
  return (
    <AppShell active="Home">
      <div className="page-heading">
        <div><p>Monday, 19 November</p><h1>Good morning, Ifeoma</h1><p>University of Benin · 300 Level · First Semester</p></div>
        <button className="button button-primary">Ask Visora AI</button>
      </div>

      <div className="dashboard-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <section className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><span className="badge">Continue learning</span><h2 style={{ margin: "12px 0 4px", fontSize: 21 }}>Visual Optics</h2><p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>Chapter 4 · Schematic and Reduced Eyes</p></div><button className="button button-secondary">Continue</button></div>
            <div style={{ height: 7, borderRadius: 999, background: "#eaf0f0", marginTop: 22, overflow: "hidden" }}><div style={{ width: "68%", height: "100%", background: "var(--brand-700)" }} /></div>
            <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: 12 }}>68% complete · 24 min remaining</p>
          </section>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><h2 style={{ margin: 0, fontSize: 18 }}>Courses this semester</h2><span style={{ color: "var(--brand-700)", fontSize: 13, fontWeight: 800 }}>View all</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[["OPT 301", "Visual Optics", "72%"], ["OPT 303", "Ocular Physiology", "58%"], ["OPT 305", "Clinical Optics", "41%"]].map(([code, title, progress]) => <article key={code} className="card" style={{ padding: 16 }}><span className="badge">{code}</span><h3 style={{ margin: "18px 0 5px", fontSize: 16 }}>{title}</h3><p style={{ margin: 0, color: "var(--muted)", fontSize: 12 }}>{progress} complete</p></article>)}
            </div>
          </section>

          <section className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ margin: 0, fontSize: 18 }}>Recently accessed</h2><span style={{ color: "var(--brand-700)", fontSize: 13, fontWeight: 800 }}>View library</span></div>
            {["Reduced and schematic eyes — Lecture note", "Accommodation and presbyopia — Past questions", "Binocular vision assessment — Clinical slide"].map((item, index) => <div key={item} style={{ display: "grid", gridTemplateColumns: "38px 1fr auto", alignItems: "center", gap: 12, borderTop: index ? "1px solid var(--line)" : 0, marginTop: index ? 0 : 14, padding: "13px 0" }}><span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 8, background: "var(--brand-100)", color: "var(--brand-700)", fontWeight: 850 }}>PDF</span><span style={{ fontSize: 14, fontWeight: 750 }}>{item}</span><span style={{ color: "var(--muted)", fontSize: 12 }}>{index === 0 ? "Today" : index === 1 ? "Yesterday" : "2 days"}</span></div>)}
          </section>
        </div>

        <aside style={{ display: "grid", alignContent: "start", gap: 16 }}>
          <section className="card" style={{ padding: 20, background: "var(--brand-950)", color: "white", border: 0 }}><span className="badge" style={{ background: "rgba(255,255,255,.12)", color: "white" }}>Visora AI</span><h2 style={{ margin: "14px 0 8px", fontSize: 20 }}>Need help understanding a concept?</h2><p style={{ margin: "0 0 18px", color: "#C8D7DB", lineHeight: 1.55, fontSize: 14 }}>Ask about visual optics, ocular anatomy, or your course materials.</p><button className="button" style={{ background: "white", color: "var(--brand-950)" }}>Start a conversation</button></section>
          <section className="card" style={{ padding: 20 }}><h2 style={{ margin: "0 0 14px", fontSize: 17 }}>This week</h2>{[["Tue", "Visual Optics quiz", "10:30 AM"], ["Wed", "Clinical Optics practical", "2:00 PM"], ["Fri", "Ocular Physiology tutorial", "9:00 AM"]].map(([day, title, time]) => <div key={title} style={{ display: "grid", gridTemplateColumns: "38px 1fr", gap: 10, padding: "10px 0", borderTop: "1px solid var(--line)" }}><strong style={{ color: "var(--brand-700)", fontSize: 12 }}>{day}</strong><div><b style={{ display: "block", fontSize: 13 }}>{title}</b><span style={{ color: "var(--muted)", fontSize: 12 }}>{time}</span></div></div>)}</section>
          <section className="card" style={{ padding: 20 }}><h2 style={{ margin: "0 0 10px", fontSize: 17 }}>Announcement</h2><p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.55, fontSize: 13 }}>Clinical posting briefing will hold in the Medical Library on Thursday.</p></section>
        </aside>
      </div>
    </AppShell>
  );
}
