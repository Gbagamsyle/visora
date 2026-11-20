import Link from "next/link";

export default function RegisterPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="card" style={{ width: "min(520px, 100%)", padding: 32 }}>
        <Link href="/" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link>
        <p className="eyebrow" style={{ marginTop: 32 }}>Create your account</p>
        <h1 style={{ margin: "10px 0 8px", letterSpacing: "-.04em" }}>Start learning with clarity.</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>Set up your profile and academic programme.</p>
        <form style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[["First name", "Ifeoma"], ["Last name", "Okafor"]].map(([label, placeholder]) => <label key={label} style={{ display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>{label}<input aria-label={label} placeholder={placeholder} style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px" }} /></label>)}
          <label style={{ gridColumn: "1 / -1", display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>Email address<input aria-label="Email address" type="email" placeholder="student@uniben.edu" style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px" }} /></label>
          <label style={{ gridColumn: "1 / -1", display: "grid", gap: 7, fontSize: 13, fontWeight: 800 }}>Password<input aria-label="Password" type="password" placeholder="Create a strong password" style={{ height: 46, border: "1px solid var(--line)", borderRadius: 8, padding: "0 12px" }} /></label>
          <Link className="button button-primary" href="/onboarding" style={{ gridColumn: "1 / -1", marginTop: 6 }}>Continue</Link>
        </form>
        <p style={{ marginTop: 20, textAlign: "center", color: "var(--muted)" }}>Already have an account? <Link href="/login" style={{ color: "var(--brand-700)", fontWeight: 800 }}>Sign in</Link></p>
      </section>
    </main>
  );
}
