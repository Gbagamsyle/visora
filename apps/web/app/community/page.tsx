import AppShell from "../../components/AppShell";

export default function CommunityPage() {
  return <AppShell active="Community"><div className="page-heading"><div><p>University of Benin community</p><h1>Community</h1></div><button className="button button-primary">Create post</button></div><section className="card" style={{ padding: 28 }}><span className="badge">Student community</span><h2>Discuss, share, and learn together.</h2><p style={{ margin: 0, color: "var(--muted)" }}>The interactive feed is planned for a later implementation milestone.</p></section></AppShell>;
}
