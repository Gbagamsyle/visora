"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3 } from "lucide-react";
import AppShell from "../../../components/AppShell";
import "../../../components/practice/practice.css";
import "./history.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
interface HistoryItem { id: string; status: string; startedAt: string; submittedAt: string | null; score: number | null; totalMarks: number | null; percentage: number | null; test: { id: string; title: string; type: string }; _count: { answers: number } }

export default function PracticeHistoryPage() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/attempts/history`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("We couldn’t load your session history.");
      setHistory(await response.json() as HistoryItem[]);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load session history."); }
    finally { setLoading(false); }
  }, [getToken]);
  useEffect(() => { void load(); }, [load]);

  return <AppShell active="Practice"><Link className="course-back-link" href="/practice"><ArrowLeft size={16} /> Practice</Link><header className="premium-page-header"><div><p className="premium-eyebrow">YOUR PERFORMANCE</p><h1>Session history</h1><p>Review completed practice sessions and corrections.</p></div></header>
    {error ? <section className="alert alert-danger" role="alert"><div>{error}</div><button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button></section> : null}
    <section className="practice-history history-panel">{loading ? <div className="practice-loading" aria-busy="true"><span className="skeleton" style={{ height: 190 }} /></div> : history.length ? <div className="practice-history-list">{history.map((item) => <Link className="practice-history-row" href={`/practice/attempts/${item.id}/results`} key={item.id}><span className="practice-history-icon">{item.percentage === null ? <Clock3 size={16} /> : <CheckCircle2 size={16} />}</span><span className="practice-history-copy"><strong>{item.test.title}</strong><small>{item.test.type.replaceAll("_", " ")} · {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(item.submittedAt ?? item.startedAt))} · {item._count.answers} questions</small></span><span className={`practice-result-status ${item.status.toLowerCase()}`}>{item.status.replaceAll("_", " ")}</span><strong className="practice-history-score">{item.percentage === null ? item.score === null ? "Review pending" : `${item.score} / ${item.totalMarks ?? "—"}` : `${Math.round(item.percentage)}%`}</strong><ArrowUpRight size={15} /></Link>)}</div> : <section className="learn-empty"><span><Clock3 size={22} /></span><h2>No completed sessions</h2><p>Your submitted practice attempts will appear here.</p><Link className="button button-primary" href="/practice">Find practice sets</Link></section>}</section>
  </AppShell>;
}
