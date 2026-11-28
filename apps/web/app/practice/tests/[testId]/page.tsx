"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, FileQuestion, ShieldCheck } from "lucide-react";
import AppShell from "../../../../components/AppShell";
import "../../../../components/practice/practice.css";
import "./test.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
interface TestDetail { id: string; title: string; description: string | null; type: string; durationMin: number | null; questionCount: number; passMark: number | null; courseNames: string[]; questions: Array<{ id: string; type: string; body: string; marks: number; options: Array<{ id: string; text: string }> }> }

export default function PracticeTestPage() {
  const { getToken } = useAuth();
  const params = useParams<{ testId: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [timed, setTimed] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/tests/${params.testId}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "This practice set is unavailable for your study plan." : "We couldn’t load this practice set.");
      const detail = await response.json() as TestDetail;
      setTest(detail);
      setTimed(detail.type !== "PRACTICE" && detail.durationMin !== null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load practice set."); }
    finally { setLoading(false); }
  }, [getToken, params.testId]);

  useEffect(() => { void load(); }, [load]);

  const start = async () => {
    setStarting(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/tests/${params.testId}/attempts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ timed }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { message?: string };
        throw new Error(body.message ?? "We couldn’t start this practice session.");
      }
      const result = await response.json() as { attemptId: string };
      router.push(`/practice/attempts/${result.attemptId}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to start practice."); setStarting(false); }
  };

  return <AppShell active="Practice">
    <Link className="course-back-link" href="/practice"><ArrowLeft size={16} /> Practice sets</Link>
    {loading ? <div className="practice-loading" aria-busy="true"><span className="skeleton" style={{ height: 190 }} /></div> : error && !test ? <section className="alert alert-danger" role="alert"><div>{error}</div><button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button></section> : test ? <>
      <header className="test-setup-hero"><span className="test-setup-icon"><FileQuestion size={25} /></span><div><p className="premium-eyebrow">{test.type.replaceAll("_", " ")} · {test.courseNames.join(" · ") || "YOUR PROGRAMME"}</p><h1>{test.title}</h1><p>{test.description || "A focused question set selected for your academic programme."}</p></div></header>
      <section className="test-setup-card"><h2>Session setup</h2><div className="test-setup-facts"><span><FileQuestion size={16} /> {test.questionCount} questions</span><span><Clock3 size={16} /> {timed ? `${test.durationMin} minutes` : "No time limit"}</span><span><ShieldCheck size={16} /> {test.passMark === null ? "Practice & review" : `Pass mark ${test.passMark}%`}</span></div>
        {test.durationMin ? <fieldset className="test-timing-choice"><legend>Choose your pace</legend><label><input type="radio" name="mode" checked={!timed} onChange={() => setTimed(false)} /><span><strong>Untimed practice</strong><small>Work through the questions at your own pace.</small></span></label><label><input type="radio" name="mode" checked={timed} onChange={() => setTimed(true)} /><span><strong>Timed session</strong><small>Submit automatically when the {test.durationMin}-minute timer expires.</small></span></label></fieldset> : <p className="test-untimed-note">This practice set has no time limit. You can review your answers after submitting.</p>}
        <p className="test-integrity-note">Your answers are saved as you go. Objective questions are graded automatically; written responses may require manual review.</p>
        {error ? <p className="learn-action-message error" role="alert">{error}</p> : null}
        <div className="test-setup-actions"><Link className="button button-secondary" href="/practice">Not now</Link><button className="button button-primary" type="button" onClick={() => void start()} disabled={starting}>{starting ? "Starting…" : "Start session"} <ArrowRight size={16} /></button></div>
      </section>
    </> : null}
  </AppShell>;
}
