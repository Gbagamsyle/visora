import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(440px, 1fr)", background: "white" }}>
      <section style={{ padding: "28px 42px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Link href="/" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link>
        <div style={{ width: "min(440px, 100%)", margin: "auto", padding: "32px 0" }}>
          <SignUp forceRedirectUrl="/onboarding" signInUrl="/login" />
        </div>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>© 2026 Visora</span>
      </section>
      <aside style={{ margin: 12, borderRadius: 18, background: "var(--brand-950)", color: "white", padding: 44, display: "flex", alignItems: "center" }}>
        <div>
          <span className="badge" style={{ background: "rgba(255,255,255,.12)", color: "white" }}>Create your academic space</span>
          <h2 style={{ maxWidth: 500, margin: "18px 0 10px", fontSize: 46, lineHeight: 1.05, letterSpacing: "-.05em" }}>Learning becomes clearer with the right context.</h2>
          <p style={{ color: "#C8D7DB", maxWidth: 480, lineHeight: 1.7 }}>Choose your university, Optometry programme, and current academic level.</p>
        </div>
      </aside>
    </main>
  );
}
