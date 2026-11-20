import Link from "next/link";
import type { ReactNode } from "react";
import "./AppShell.css";

const navigation = [
  ["Home", "/home", "H"],
  ["Learn", "/learn", "L"],
  ["Practice", "/practice", "P"],
  ["Ask Visora AI", "/ai", "A"],
  ["Community", "/community", "C"],
  ["Profile", "/profile", "Pr"],
];

export default function AppShell({ children, active }: { children: ReactNode; active: string }) {
  return (
    <div>
      <aside className="app-sidebar">
        <div className="app-brand"><Link href="/home" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link></div>
        <nav className="app-nav" aria-label="Student navigation">
          {navigation.map(([label, href, icon]) => (
            <Link key={href} href={href} className={active === label ? "active" : ""}><b aria-hidden="true" style={{ width: 18, textAlign: "center", fontSize: 12 }}>{icon}</b><span>{label}</span></Link>
          ))}
        </nav>
      </aside>
      <main className="app-main">
        <header className="app-topbar">
          <div className="search-box" role="search"><span aria-hidden="true">⌕</span><span>Search courses, materials, questions…</span></div>
          <div className="topbar-actions">
            <Link className="icon-button" href="/notifications" aria-label="Notifications">•</Link>
            <div className="avatar" aria-label="Ifeoma Okafor">IO</div>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
