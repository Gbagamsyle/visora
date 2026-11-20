import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="card" style={{ width: "min(760px, 100%)", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Link href="/" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link><span style={{ color: "var(--muted)", fontSize: 13 }}>Step 1 of 2</span></div>
        <h1 style={{ margin: "40px 0 8px", letterSpacing: "-.04em" }}>Where are you studying?</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>This helps Visora organise the right courses and resources for you.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {["University of Benin", "University of Lagos", "University of Ibadan", "Add another university"].map((item, index) => <button key={item} className="card" style={{ minHeight: 92, textAlign: "left", padding: 16, borderColor: index === 0 ? "var(--brand-700)" : "var(--line)", background: index === 0 ? "var(--brand-100)" : "white" }}><strong>{item}</strong><small style={{ display: "block", marginTop: 8, color: "var(--muted)" }}>{index === 0 ? "UNIBEN · Selected" : "Available in the future"}</small></button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
          <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>Programme<select style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px", background: "white" }}><option>Optometry</option></select></label>
          <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>Current level<select style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px", background: "white" }}><option>300 Level</option></select></label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}><Link className="button button-primary" href="/home">Complete setup</Link></div>
      </section>
    </main>
  );
}
