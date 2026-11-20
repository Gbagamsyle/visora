import AppShell from "../../components/AppShell";

export default function NotificationsPage() {
  return (
    <AppShell active="Profile">
      <div className="page-heading"><div><p>Updates for you</p><h1>Notifications</h1></div><button className="button button-secondary">Mark all as read</button></div>
      <section className="card" style={{ padding: 8 }}>{[["Clinical Optics", "New learning material: Prism adaptation", "12 min ago"], ["Visual Optics", "Quiz opens tomorrow at 10:30 AM", "1 hr ago"], ["Community", "Amara replied to your discussion", "Yesterday"]].map(([title, message, time]) => <article key={title} style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", gap: 12, padding: 14, borderBottom: "1px solid var(--line)" }}><span className="avatar" style={{ width: 42, height: 42 }}>{title[0]}</span><div><strong>{title}</strong><p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: 13 }}>{message}</p></div><span style={{ color: "var(--muted)", fontSize: 12 }}>{time}</span></article>)}</section>
    </AppShell>
  );
}
