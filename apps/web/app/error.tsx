"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#ffffff" }}>
      <section style={{ maxWidth: 480, textAlign: "center" }}>
        <span className="landing-mark" aria-hidden="true">V</span>
        <h1 style={{ margin: "18px 0 8px", letterSpacing: "-.04em" }}>We could not load this page.</h1>
        <p style={{ color: "#737084", lineHeight: 1.7 }}>Please try again or return to the Visora home page.</p>
        <button className="landing-button landing-button-primary" onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
