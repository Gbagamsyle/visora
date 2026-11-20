import AppShell from "../../components/AppShell";

export default function LearnPage() {
  const courses = [["OPT 301", "Visual Optics", "8 topics", "68%"], ["OPT 303", "Ocular Physiology", "10 topics", "58%"], ["OPT 305", "Clinical Optics", "7 topics", "41%"], ["OPT 307", "Binocular Vision", "9 topics", "22%"]];
  return (
    <AppShell active="Learn">
      <div className="page-heading"><div><p>University of Benin · Optometry</p><h1>Learn</h1><p>300 Level · First Semester</p></div><button className="button button-primary">Upload material</button></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>{["All courses", "First semester", "Recently viewed", "Saved"].map((item, index) => <button key={item} className="button" style={{ minHeight: 38, background: index === 0 ? "var(--brand-700)" : "white", color: index === 0 ? "white" : "var(--ink)", border: "1px solid var(--line)" }}>{item}</button>)}</div>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {courses.map(([code, title, topics, progress]) => <article key={code} className="card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}><span className="badge">{code}</span><button aria-label={`Save ${title}`} style={{ border: 0, background: "transparent", color: "var(--muted)" }}>♡</button></div><h2 style={{ margin: "22px 0 5px", fontSize: 21 }}>{title}</h2><p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>{topics} · {progress} complete</p><div style={{ height: 6, borderRadius: 999, background: "#eeedf4", marginTop: 18 }}><div style={{ width: progress, height: "100%", borderRadius: 999, background: "var(--brand-700)" }} /></div></article>)}
      </section>
    </AppShell>
  );
}
