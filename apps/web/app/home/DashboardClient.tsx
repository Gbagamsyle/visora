"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import AppShell from "../../components/AppShell";

interface DashboardData {
  onboardingComplete: boolean;
  student: { displayName: string; avatarUrl: string | null };
  academic: {
    university: string;
    universityShortName: string | null;
    program: string;
    level: string;
    semester: string | null;
  } | null;
  metrics: {
    courses: number;
    newMaterials: number;
    completedAttempts: number;
    averageScore: number | null;
    unreadNotifications: number;
  };
  courses: Array<{ id: string; code: string; title: string; creditUnits: number | null; semester: string }>;
  recentMaterials: Array<{
    id: string;
    title: string;
    type: string;
    createdAt: string;
    courseCode: string | null;
    courseTitle: string | null;
  }>;
  announcements: Array<{ id: string; title: string; content: string; publishedAt: string | null }>;
  practice: { availableTests: number };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function DashboardLoading() {
  return (
    <AppShell active="Home">
      <div className="simple-dashboard-loading" aria-label="Loading your dashboard" aria-busy="true">
        <span className="skeleton" style={{ width: 230, height: 14 }} />
        <span className="skeleton" style={{ width: 340, height: 38 }} />
        <span className="skeleton" style={{ width: 390, height: 18 }} />
        <div className="simple-dashboard-stats">{[0, 1, 2].map((item) => <span className="skeleton" key={item} style={{ height: 102 }} />)}</div>
        <div className="simple-dashboard-main"><span className="skeleton" style={{ minHeight: 420 }} /><span className="skeleton" style={{ minHeight: 320 }} /></div>
      </div>
    </AppShell>
  );
}

export default function DashboardClient() {
  const { getToken } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/dashboard/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? `Dashboard service returned ${response.status}`);
      }
      setDashboard(await response.json() as DashboardData);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) return <DashboardLoading />;

  return (
    <AppShell active="Home">
      <header className="simple-dashboard-header">
        <div>
          <p className="simple-dashboard-date">{new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p>
          <h1>{greeting()}{dashboard?.student.displayName ? `, ${dashboard.student.displayName}` : ""}</h1>
          {dashboard?.academic ? (
            <p className="simple-dashboard-context"><GraduationCap size={16} /><span>{dashboard.academic.university}</span><span className="context-separator">/</span><span>{dashboard.academic.program}</span><span className="context-separator">/</span><span>{dashboard.academic.level}{dashboard.academic.semester ? ` · ${dashboard.academic.semester}` : ""}</span></p>
          ) : <p className="simple-dashboard-context">Your academic workspace</p>}
        </div>
        <Link className="button button-primary simple-ai-cta" href="/ai"><Sparkles size={16} /> Ask Visora AI <ArrowUpRight size={15} /></Link>
      </header>

      {error ? (
        <section className="alert alert-danger simple-dashboard-error" role="alert">
          <div><strong>We couldn’t load your dashboard.</strong><p>{error}</p></div>
          <button className="button button-secondary" onClick={() => void loadDashboard()}>Try again</button>
        </section>
      ) : null}

      {dashboard && !dashboard.onboardingComplete ? (
        <section className="card simple-onboarding-card">
          <span className="simple-section-label">GET STARTED</span>
          <h2>Complete your academic profile</h2>
          <p>Choose your university, programme, and level to see the right courses and resources.</p>
          <Link className="button button-primary" href="/onboarding">Continue setup <ArrowRight size={16} /></Link>
        </section>
      ) : null}

      {dashboard?.onboardingComplete ? (
        <>
          <section className="simple-dashboard-stats" aria-label="Your study summary">
            <article className="simple-stat-card">
              <span className="simple-stat-icon stat-icon-teal"><BookOpen size={18} /></span>
              <div><strong>{dashboard.metrics.courses}</strong><span>Courses this semester</span></div>
            </article>
            <article className="simple-stat-card">
              <span className="simple-stat-icon stat-icon-blue"><FileText size={18} /></span>
              <div><strong>{dashboard.metrics.newMaterials}</strong><span>Learning resources</span></div>
            </article>
            <article className="simple-stat-card">
              <span className="simple-stat-icon stat-icon-amber"><Target size={18} /></span>
              <div><strong>{dashboard.metrics.averageScore === null ? "—" : `${Math.round(dashboard.metrics.averageScore)}%`}</strong><span>Average practice score</span></div>
            </article>
          </section>

          <div className="simple-dashboard-main">
            <section className="simple-courses-section">
              <div className="simple-section-heading">
                <div><span className="simple-section-label">YOUR STUDY PLAN</span><h2>Courses this semester</h2></div>
                <Link href="/learn">View all <ArrowRight size={15} /></Link>
              </div>

              {dashboard.courses.length ? (
                <div className="simple-course-list">
                  {dashboard.courses.map((course) => (
                    <Link className="simple-course-row" href="/learn" key={course.id}>
                      <span className="simple-course-code">{course.code}</span>
                      <span className="simple-course-info"><strong>{course.title}</strong><span>{course.creditUnits ? `${course.creditUnits} credit units` : course.semester}</span></span>
                      <span className="simple-course-arrow"><ArrowUpRight size={17} /></span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="simple-empty-state"><BookOpen size={21} /><div><strong>Courses are being organized</strong><p>Your school’s course offerings for this level will appear here once they’re added.</p></div></div>
              )}

              <section className="simple-materials">
                <div className="simple-section-heading">
                  <div><span className="simple-section-label">PICK UP WHERE YOU LEFT OFF</span><h2>Recent resources</h2></div>
                  <Link href="/learn">Library <ArrowRight size={15} /></Link>
                </div>
                {dashboard.recentMaterials.length ? (
                  <div className="simple-resource-list">
                    {dashboard.recentMaterials.slice(0, 3).map((material) => (
                      <Link className="simple-resource-row" href="/learn" key={material.id}>
                        <span className="simple-resource-icon"><FileText size={17} /></span>
                        <span className="simple-resource-info"><strong>{material.title}</strong><span>{[material.courseCode, material.courseTitle].filter(Boolean).join(" · ") || "Course material"}</span></span>
                        <time dateTime={material.createdAt}>{formatDate(material.createdAt)}</time>
                      </Link>
                    ))}
                  </div>
                ) : <p className="simple-inline-empty">Your approved course materials will appear here.</p>}
              </section>
            </section>

            <aside className="simple-dashboard-aside">
              <section className="simple-ai-card">
                <span className="simple-ai-icon"><BrainCircuit size={19} /></span>
                <span className="simple-section-label">VISORA AI</span>
                <h2>Need a concept explained?</h2>
                <p>Get a clear, course-aware explanation whenever you need another perspective.</p>
                <Link href="/ai">Ask Visora AI <ArrowRight size={15} /></Link>
              </section>

              <section className="simple-practice-card">
                <div className="simple-mini-heading"><span className="simple-mini-icon"><Target size={16} /></span><h2>Practice</h2><Link href="/practice" aria-label="Open practice"><ArrowUpRight size={16} /></Link></div>
                <p>{dashboard.practice.availableTests ? `${dashboard.practice.availableTests} practice ${dashboard.practice.availableTests === 1 ? "test is" : "tests are"} available for your programme.` : "Practice tests for your programme will appear here when available."}</p>
                <div className="simple-practice-foot"><span><CheckCircle2 size={14} /> {dashboard.metrics.completedAttempts} completed</span><span>{dashboard.metrics.averageScore === null ? "No scores yet" : `${Math.round(dashboard.metrics.averageScore)}% avg.`}</span></div>
              </section>

              {dashboard.announcements.length ? (
                <section className="simple-announcement-card">
                  <div className="simple-mini-heading"><span className="simple-mini-icon"><Bell size={16} /></span><h2>Notice board</h2></div>
                  {dashboard.announcements.slice(0, 2).map((announcement) => (
                    <article className="simple-announcement" key={announcement.id}>
                      <strong>{announcement.title}</strong>
                      <p>{announcement.content}</p>
                      {announcement.publishedAt ? <time dateTime={announcement.publishedAt}>{formatDate(announcement.publishedAt)}</time> : null}
                    </article>
                  ))}
                </section>
              ) : null}

              <Link className="simple-notification-link" href="/notifications">
                <span className="simple-mini-icon"><CalendarDays size={16} /></span>
                <span><strong>Notifications</strong><small>{dashboard.metrics.unreadNotifications ? `${dashboard.metrics.unreadNotifications} unread` : "You’re all caught up"}</small></span>
                <ChevronRight size={17} />
              </Link>
            </aside>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
