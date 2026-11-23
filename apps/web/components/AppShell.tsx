import Link from "next/link";
import type { ReactNode } from "react";
import { BellIcon, HomeIcon, SearchIcon } from "./icons";
import "./AppShell.css";

const navigation = [
  ["Home", "/home", "H"],
  ["Learn", "/learn", "L"],
  ["Practice", "/practice", "P"],
  ["Ask Visora AI", "/ai", "AI"],
  ["Community", "/community", "C"],
  ["Profile", "/profile", "Pr"],
] as const;

export default function AppShell({ children, active }: { children: ReactNode; active: string }) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <Link href="/home" className="wordmark" aria-label="Visora home">
            <span className="mark">V</span><span>Visora</span>
          </Link>
        </div>
        <nav className="app-nav" aria-label="Student navigation">
          {navigation.map(([label, href, icon]) => (
            <Link
              key={href}
              href={href}
              className={active === label ? "active" : ""}
              aria-current={active === label ? "page" : undefined}
            >
              {label === "Home" ? <HomeIcon size={19} /> : (
                <b className="nav-icon" aria-hidden="true">{icon}</b>
              )}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <button className="search-box" type="button" aria-label="Search Visora">
            <SearchIcon size={19} />
            <span>Search courses, materials, questions…</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="topbar-actions">
            <Link className="icon-button" href="/notifications" aria-label="Notifications">
              <BellIcon size={20} />
              <span className="notification-dot" aria-label="Unread notifications" />
            </Link>
            <Link href="/profile" className="avatar" aria-label="Open profile for Ifeoma Okafor">IO</Link>
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
