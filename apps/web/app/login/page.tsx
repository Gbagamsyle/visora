import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(440px, 1fr)", background: "white" }}>
      <section style={{ padding: "28px 42px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Link href="/" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link>
        <div style={{ width: "min(440px, 100%)", margin: "auto", padding: "32px 0" }}>
          <SignIn forceRedirectUrl="/onboarding" signUpUrl="/register" />
        </div>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>© 2026 Visora</span>
      </section>
      <aside style={{ minHeight: 520, margin: 12, borderRadius: 18, background: "var(--brand-950)", color: "white", padding: 44, display: "flex", flexDirection: "column", justifyContent: "end" }}>
        <span className="badge" style={{ alignSelf: "start", background: "rgba(255,255,255,.12)", color: "white" }}>Your academic workspace</span>
        <h2 style={{ maxWidth: 500, margin: "18px 0 10px", fontSize: 46, lineHeight: 1.05, letterSpacing: "-.05em" }}>Every resource. Every revision. One clear direction.</h2>
        <p style={{ color: "#C8D7DB", maxWidth: 480, lineHeight: 1.7 }}>Designed around the courses, levels, and study routines of Optometry students.</p>
      </aside>
    </main>
  );
}
