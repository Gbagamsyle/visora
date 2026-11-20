import AppShell from "../../components/AppShell";

export default function AIPage() {
  return <AppShell active="Ask Visora AI"><div className="page-heading"><div><p>Academic study companion</p><h1>Ask Visora AI</h1></div></div><section className="card" style={{ minHeight: 480, padding: 28, display: "grid", placeItems: "center", textAlign: "center" }}><div style={{ maxWidth: 520 }}><span className="mark" style={{ width: 48, height: 48 }}>V</span><h2>What would you like to understand?</h2><p style={{ color: "var(--muted)", lineHeight: 1.6 }}>The conversational experience will support course explanations and study prompts in a later milestone.</p><div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>{["Explain schematic eyes", "Review visual acuity", "Create an optics quiz"].map((prompt) => <button key={prompt} className="button button-secondary">{prompt}</button>)}</div></div></section></AppShell>;
}
