import Link from "next/link";

export default function AdminHome() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px 1fr" }}>
      <aside style={{ background: "#17182a", color: "white", padding: "28px 20px" }}>
        <strong style={{ fontSize: 22 }}>VISORA <span style={{ color: "#aaa2ff" }}>ADMIN</span></strong>
        <nav style={{ display: "grid", gap: 8, marginTop: 36 }}>
          {["Overview", "Universities", "Academic Structure", "Learning Materials", "Question Bank", "Community", "Users", "Roles"].map((item, index) => (
            <span key={item} style={{ padding: "10px 12px", borderRadius: 8, background: index === 0 ? "rgba(255,255,255,.10)" : "transparent", color: index === 0 ? "white" : "#bbbcd1" }}>{item}</span>
          ))}
        </nav>
      </aside>
      <section style={{ padding: "34px 42px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><p style={{ margin: 0, color: "#77778c" }}>Visora Administration</p><h1 style={{ margin: "5px 0" }}>Platform overview</h1></div>
          <button style={{ border: 0, borderRadius: 8, background: "#4c3cc4", color: "white", padding: "11px 16px" }}>Add content</button>
        </header>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 28 }}>
          {[["Users", "2,481"], ["Materials", "326"], ["Questions", "1,204"], ["Posts", "892"]].map(([label, value]) => (
            <article key={label} style={{ background: "white", border: "1px solid #e7e7ef", borderRadius: 12, padding: 20 }}><p style={{ margin: 0, color: "#77778c" }}>{label}</p><strong style={{ display: "block", fontSize: 28, marginTop: 8 }}>{value}</strong></article>
          ))}
        </div>
        <article style={{ background: "white", border: "1px solid #e7e7ef", borderRadius: 12, padding: 20, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Recent moderation queue</h2>
          {["Anatomy of the Retina — PDF upload", "Clinical Optics past question", "Community post reported for review"].map((item) => <div key={item} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eeeef4", padding: "14px 0" }}><span>{item}</span><Link href="#" style={{ color: "#4c3cc4", textDecoration: "none" }}>Review</Link></div>)}
        </article>
      </section>
    </main>
  );
}
