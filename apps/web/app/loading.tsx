export default function LoadingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--canvas)", padding: 32 }}>
      <div style={{ width: "min(1180px, 100%)", marginInline: "auto" }}>
        <span className="skeleton" style={{ width: 180, height: 34, marginBottom: 24 }} />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          <section className="card" style={{ minHeight: 260, padding: 22, display: "grid", gap: 14, alignContent: "start" }}>
            <span className="skeleton" style={{ width: "35%", height: 24 }} />
            <span className="skeleton" style={{ width: "72%", height: 16 }} />
            <span className="skeleton" style={{ width: "100%", height: 96, marginTop: 16 }} />
          </section>
          <section className="card" style={{ minHeight: 260, padding: 22, display: "grid", gap: 14, alignContent: "start" }}>
            <span className="skeleton" style={{ width: "55%", height: 24 }} />
            <span className="skeleton" style={{ width: "100%", height: 16 }} />
            <span className="skeleton" style={{ width: "82%", height: 16 }} />
          </section>
        </div>
      </div>
    </main>
  );
}
