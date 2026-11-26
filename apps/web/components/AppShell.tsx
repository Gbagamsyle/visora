import Link from "next/link";
import type { ReactNode } from "react";
import { Bell, BookOpen, BrainCircuit, House, Search, UsersRound, ClipboardCheck } from "lucide-react";
import ProfileLink from "./ProfileLink";
import "./AppShell.css";

const navigation = [
  { label: "Home", href: "/home", icon: House },
  { label: "Learn", href: "/learn", icon: BookOpen },
  { label: "Practice", href: "/practice", icon: ClipboardCheck },
  { label: "Ask Visora AI", href: "/ai", icon: BrainCircuit },
  { label: "Community", href: "/community", icon: UsersRound },
  { label: "Profile", href: "/profile", icon: null },
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
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={active === label ? "active" : ""}
              aria-current={active === label ? "page" : undefined}
              prefetch={true}
            >
              {Icon ? <Icon size={19} strokeWidth={1.8} aria-hidden="true" /> : <span className="nav-profile-icon" aria-hidden="true">P</span>}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <button className="search-box" type="button" aria-label="Search Visora">
            <Search size={19} strokeWidth={1.8} aria-hidden="true" />
            <span>Search courses, materials, questions…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="topbar-actions">
            <Link className="icon-button" href="/notifications" aria-label="Notifications" prefetch={true}>
              <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            </Link>
            <ProfileLink />
          </div>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
