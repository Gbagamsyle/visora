import Link from "next/link";

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "white" }}>
      <section style={{ padding: "28px 42px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Link href="/" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link>
        <div style={{ width: "min(390px, 100%)", margin: "auto" }}>
          <p className="eyebrow">Welcome back</p>
          <h1 style={{ margin: "12px 0 8px", fontSize: 42, letterSpacing: "-.05em" }}>Continue your learning.</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>Sign in to resume where you left off.</p>
          <form style={{ display: "grid", gap: 14 }}>
            <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>Email address<input aria-label="Email address" type="email" placeholder="student@uniben.edu" style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px" }} /></label>
            <label style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>Password<input aria-label="Password" type="password" placeholder="Enter your password" style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px" }} /></label>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><label><input type="checkbox" /> Remember me</label><a href="#" style={{ color: "var(--brand-700)" }}>Forgot password?</a></div>
            <Link className="button button-primary" href="/home">Sign in</Link>
          </form>
          <p style={{ marginTop: 24, textAlign: "center", color: "var(--muted)" }}>New to Visora? <Link href="/register" style={{ color: "var(--brand-700)", fontWeight: 800 }}>Create an account</Link></p>
        </div>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>© 2026 Visora</span>
      </section>
      <aside style={{ margin: 12, borderRadius: 18, background: "var(--brand-950)", color: "white", padding: 44, display: "flex", flexDirection: "column", justifyContent: "end" }}>
        <span className="badge" style={{ alignSelf: "start", background: "rgba(255,255,255,.12)", color: "white" }}>Your academic workspace</span>
        <h2 style={{ maxWidth: 500, margin: "18px 0 10px", fontSize: 46, lineHeight: 1.05, letterSpacing: "-.05em" }}>Every resource. Every revision. One clear direction.</h2>
        <p style={{ color: "#c9c8df", maxWidth: 480, lineHeight: 1.7 }}>Designed around the courses, levels, and study routines of Optometry students.</p>
      </aside>
    </main>
  );
}
