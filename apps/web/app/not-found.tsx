import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#ffffff" }}>
      <section style={{ maxWidth: 480, textAlign: "center" }}>
        <span className="landing-mark" aria-hidden="true">V</span>
        <h1 style={{ margin: "18px 0 8px", letterSpacing: "-.04em" }}>Page not found</h1>
        <p style={{ color: "#737084", lineHeight: 1.7 }}>The page you requested is not available.</p>
        <Link className="landing-button landing-button-primary" href="/">Return home</Link>
      </section>
    </main>
  );
}
