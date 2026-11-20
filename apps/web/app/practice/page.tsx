import AppShell from "../../components/AppShell";

export default function PracticePage() {
  return <AppShell active="Practice"><div className="page-heading"><div><p>Exam preparation</p><h1>Practice</h1></div></div><section className="card" style={{ padding: 28 }}><span className="badge">Coming in the next milestone</span><h2 style={{ marginBottom: 8 }}>Build confidence before the exam.</h2><p style={{ margin: 0, color: "var(--muted)" }}>Past questions, timed tests, flashcards, and performance history will be available here.</p></section></AppShell>;
}
