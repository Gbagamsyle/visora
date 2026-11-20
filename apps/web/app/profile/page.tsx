import AppShell from "../../components/AppShell";

export default function ProfilePage() {
  return (
    <AppShell active="Profile">
      <div className="card" style={{ padding: 24, display: "grid", gridTemplateColumns: "82px 1fr auto", alignItems: "center", gap: 18 }}>
        <div style={{ width: 82, height: 82, borderRadius: "50%", background: "var(--brand-900)", color: "white", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 850 }}>IO</div>
        <div><h1 style={{ margin: "0 0 5px", fontSize: 28, letterSpacing: "-.04em" }}>Ifeoma Okafor</h1><p style={{ margin: 0, color: "var(--muted)" }}>Optometry · 300 Level · University of Benin</p></div>
        <button className="button button-secondary">Edit profile</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr .75fr", gap: 16, marginTop: 16 }}>
        <section className="card" style={{ padding: 22 }}><h2 style={{ marginTop: 0, fontSize: 18 }}>Learning activity</h2>{[["Materials viewed", "42"], ["Practice questions", "186"], ["Tests completed", "12"], ["Posts shared", "8"]].map(([label, value]) => <div key={label} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--line)", padding: "16px 0" }}><span style={{ color: "var(--muted)" }}>{label}</span><strong>{value}</strong></div>)}</section>
        <aside style={{ display: "grid", gap: 16, alignContent: "start" }}><section className="card" style={{ padding: 22 }}><h2 style={{ marginTop: 0, fontSize: 18 }}>Academic details</h2><p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 4 }}>University of Benin</p><p style={{ color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>Doctor of Optometry<br />300 Level · First Semester</p></section><section className="card" style={{ padding: 22 }}><h2 style={{ marginTop: 0, fontSize: 18 }}>Learning interests</h2><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{["Visual Optics", "Clinical Optics", "Anatomy", "Binocular Vision"].map((item) => <span className="badge" key={item}>{item}</span>)}</div></section></aside>
      </div>
    </AppShell>
  );
}
