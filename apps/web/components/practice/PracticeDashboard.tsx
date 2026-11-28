"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, CheckCircle2, Clock3, FileQuestion, Layers3, Search, Target } from "lucide-react";
import type { PracticeOverview, PracticeTestSummary } from "@visora/shared";
import AppShell from "../AppShell";
import "./practice.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function TestCard({ test }: { test: PracticeTestSummary }) {
  return (
    <article className="practice-test-card">
      <span className={`practice-test-icon test-${test.type.toLowerCase().replaceAll("_", "-")}`}>
        {test.type === "TIMED_TEST" ? <Clock3 size={19} /> : test.type === "MOCK_EXAM" ? <Target size={19} /> : <FileQuestion size={19} />}
      </span>
      <div className="practice-test-content"><span className="practice-test-meta">{test.type.replaceAll("_", " ")} {test.durationMin ? `· ${test.durationMin} min` : "· untimed"}</span><h3>{test.title}</h3><p>{test.questionCount} questions{test.courseNames.length ? ` · ${test.courseNames.join(", ")}` : " · General practice"}</p></div>
      <Link className="practice-test-open" href={`/practice/tests/${test.id}`} aria-label={`Open ${test.title}`}><ArrowUpRight size={17} /></Link>
    </article>
  );
}

export default function PracticeDashboard() {
  const { getToken } = useAuth();
  const [data, setData] = useState<PracticeOverview | null>(null);
  const [tests, setTests] = useState<PracticeTestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("");
  const [type, setType] = useState("");
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("We couldn’t load your practice workspace.");
      setData(await response.json() as PracticeOverview);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load practice.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your session could not be verified.");
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (courseId) params.set("courseId", courseId);
        if (type) params.set("type", type);
        const [testResponse, questionResponse] = await Promise.all([
          fetch(`${apiUrl}/practice/tests${courseId || type ? `?${params}` : ""}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
          fetch(`${apiUrl}/practice/questions${params.size ? `?${params}` : ""}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }),
        ]);
        if (!testResponse.ok || !questionResponse.ok) throw new Error("We couldn’t apply these practice filters.");
        const [testItems, questionItems] = await Promise.all([testResponse.json(), questionResponse.json()]) as [PracticeTestSummary[], unknown[]];
        if (active) { setTests(testItems); setQuestionCount(questionItems.length); }
      } catch {
        if (active) { setTests([]); setQuestionCount(null); }
      }
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [courseId, getToken, query, type]);

  return (
    <AppShell active="Practice">
      {loading ? <div className="practice-loading" aria-busy="true"><span className="skeleton" style={{ height: 36, width: 250 }} /><span className="skeleton" style={{ height: 170 }} /><span className="skeleton" style={{ height: 280 }} /></div> : (
        <>
          {error ? <section className="alert alert-danger practice-error" role="alert"><div><strong>Practice is unavailable</strong><p>{error}</p></div><button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button></section> : null}
          {data && !data.onboardingComplete ? <section className="card learn-onboarding"><span className="premium-eyebrow">GET STARTED</span><h2>Set up your practice space</h2><p>Complete academic onboarding to find assessments for your programme.</p><Link className="button button-primary" href="/onboarding">Complete setup <ArrowRight size={15} /></Link></section> : null}
          {data?.onboardingComplete ? <>
            <header className="premium-page-header"><div><p className="premium-eyebrow">EXAM PREPARATION {data.academic ? `· ${data.academic.level}` : ""}</p><h1>Practice</h1><p>Build confidence with focused sessions, past questions and review.</p></div><Link className="button button-primary premium-header-action" href="/practice/questions"><Target size={16} /> Browse questions</Link></header>
            <section className="practice-overview-stats" aria-label="Practice statistics">
              <article><span className="practice-stat-icon teal"><FileQuestion size={17} /></span><div><strong>{data.metrics.availableTests}</strong><small>Available sets</small></div></article>
              <article><span className="practice-stat-icon blue"><CheckCircle2 size={17} /></span><div><strong>{data.metrics.completedAttempts}</strong><small>Sessions completed</small></div></article>
              <article><span className="practice-stat-icon amber"><BarChart3 size={17} /></span><div><strong>{data.metrics.averageScore === null ? "—" : `${Math.round(data.metrics.averageScore)}%`}</strong><small>Average score</small></div></article>
              <article><span className="practice-stat-icon violet"><Clock3 size={17} /></span><div><strong>{data.metrics.sessionsThisWeek}</strong><small>This week</small></div></article>
            </section>
            {data.activeAttempt ? <section className="practice-resume-card"><span><Clock3 size={18} /></span><div><p className="premium-eyebrow">SESSION IN PROGRESS</p><strong>{data.activeAttempt.test.title}</strong><small>{data.activeAttempt.expiresAt ? "Timed session — continue before the clock runs out." : "Untimed session — pick up where you left off."}</small></div><Link className="button button-primary" href={`/practice/attempts/${data.activeAttempt.id}`}>Resume session <ArrowRight size={15} /></Link></section> : null}
            <section className="practice-catalog">
              <div className="practice-catalog-heading"><div><p className="premium-eyebrow">ASSESSMENTS</p><h2>Practice sets</h2><p>Choose an objective or written session from your academic workspace.</p></div><Link href="/practice/flashcards" className="practice-flashcard-link"><Layers3 size={15} /> Review flashcards <ArrowRight size={14} /></Link></div>
              <div className="practice-filters">
                <label className="practice-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search practice sets and questions" placeholder="Search sets and question text" /></label>
                <select value={courseId} onChange={(event) => setCourseId(event.target.value)} aria-label="Filter by course"><option value="">All courses</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select>
                <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by session type"><option value="">All formats</option><option value="PRACTICE">Untimed practice</option><option value="TIMED_TEST">Timed tests</option><option value="MOCK_EXAM">Mock exams</option></select>
              </div>
              {tests.length ? <div className="practice-test-grid">{tests.map((test) => <TestCard key={test.id} test={test} />)}</div> : <section className="learn-empty"><span><BookOpen size={22} /></span><h3>{query || courseId || type ? "No matching practice sets" : "No published practice sets yet"}</h3><p>{questionCount ? `${questionCount} published questions match your filters. Practice sets will appear when assessments are published for your programme.` : "Published tests and mock exams for your current study plan will appear here."}</p><Link href="/practice/questions" className="button button-secondary">Browse past questions <ArrowRight size={14} /></Link></section>}
            </section>
            <section className="practice-history">
              <div className="practice-catalog-heading"><div><p className="premium-eyebrow">YOUR PERFORMANCE</p><h2>Recent activity</h2></div><Link href="/practice/history">Full history <ArrowRight size={14} /></Link></div>
              {data.recentAttempts.length ? <div className="practice-history-list">{data.recentAttempts.map((attempt) => <Link className="practice-history-row" href={`/practice/attempts/${attempt.id}/results`} key={attempt.id}><span className="practice-history-icon"><CheckCircle2 size={16} /></span><span className="practice-history-copy"><strong>{attempt.test.title}</strong><small>{attempt.test.type.replaceAll("_", " ")} · {formatDate(attempt.submittedAt ?? attempt.startedAt)}</small></span><span className={`practice-result-status ${attempt.status.toLowerCase()}`}>{attempt.status.replaceAll("_", " ")}</span><strong className="practice-history-score">{attempt.percentage === null ? "Review pending" : `${Math.round(attempt.percentage)}%`}</strong><ArrowUpRight size={15} /></Link>)}</div> : <section className="learn-empty compact"><span><Clock3 size={20} /></span><h3>No practice history yet</h3><p>Complete a session and your results will be saved here.</p></section>}
            </section>
          </> : null}
        </>
      )}
    </AppShell>
  );
}
