"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CircleHelp, Clock3, RotateCcw, XCircle } from "lucide-react";
import type { PracticeAttemptResult } from "@visora/shared";
import AppShell from "../../../../../components/AppShell";
import "../../../../../components/practice/practice.css";
import "./results.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function PracticeResultsPage() {
  const { getToken } = useAuth();
  const params = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/attempts/${params.attemptId}/results`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 400 ? "Submit the practice session before reviewing results." : "We couldn’t load your results.");
      setResult(await response.json() as PracticeAttemptResult);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load results."); }
    finally { setLoading(false); }
  }, [getToken, params.attemptId]);

  useEffect(() => { void load(); }, [load]);

  return <AppShell active="Practice">
    <Link className="course-back-link" href="/practice"><ArrowLeft size={16} /> Practice</Link>
    {loading ? <div className="practice-loading" aria-busy="true"><span className="skeleton" style={{ height: 190 }} /><span className="skeleton" style={{ height: 240 }} /></div> : error ? <section className="alert alert-danger" role="alert"><div>{error}</div><button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button></section> : result ? <>
      <header className={`result-summary${result.passed === true ? " passed" : result.passed === false ? " needs-work" : " pending"}`}>
        <span className="result-summary-icon">{result.passed === true ? <CheckCircle2 size={26} /> : result.passed === false ? <XCircle size={26} /> : <Clock3 size={26} />}</span>
        <div><p className="premium-eyebrow">{result.test.type.replaceAll("_", " ")} · {result.status.replaceAll("_", " ")}</p><h1>{result.test.title}</h1><p>{result.awaitingManualReview ? "Written answers are awaiting review. Your final score will update when marking is complete." : result.passed === true ? "Well done — you met the pass mark." : result.passed === false ? "Review the corrections below and try another practice set." : "Your session has been submitted."}</p></div>
        <div className="result-score-block"><strong>{result.percentage === null ? "—" : `${Math.round(result.percentage)}%`}</strong><span>{result.score === null || result.totalMarks === null ? "Score pending" : `${result.score} / ${result.totalMarks} marks`}</span></div>
      </header>
      {result.status === "EXPIRED" ? <p className="result-expired-note"><Clock3 size={14} /> Time expired. Answers saved before the deadline were submitted automatically.</p> : null}
      {result.awaitingManualReview ? <p className="learn-action-message result-review-note"><CircleHelp size={15} /> Theory and unrecognized short responses need a marker; objective corrections below are available now.</p> : null}
      <section className="result-review-section"><header><div><p className="premium-eyebrow">SESSION REVIEW</p><h2>Answers & corrections</h2></div><Link className="button button-secondary" href="/practice"><RotateCcw size={14} /> Practice again</Link></header>
        <div className="result-review-list">{result.reviewQuestions.map((question, questionIndex) => <article className="result-question-card" key={question.answerId}><div className="result-question-top"><span>Question {questionIndex + 1}</span><span>{question.needsReview ? "Needs review" : question.isCorrect ? "Correct" : "Incorrect"}</span><span>{question.marksAwarded === null ? "Marks pending" : `${question.marksAwarded} / ${question.marks}`}</span></div><h3>{question.body}</h3>
          {question.options.length ? <div className="result-options">{question.options.map((option) => { const selected = question.selectedOptionIds.includes(option.id); const correct = question.correctOptionIds.includes(option.id); return <div key={option.id} className={`result-option${selected ? " selected" : ""}${correct ? " correct" : ""}`}><span>{correct ? <CheckCircle2 size={14} /> : selected ? <XCircle size={14} /> : null}</span><span>{option.text}</span>{correct ? <small>Correct answer</small> : selected ? <small>Your answer</small> : null}</div>; })}</div> : <div className="result-written-answer"><strong>Your response</strong><p>{question.textAnswer || "No response submitted."}</p>{question.correctAnswer ? <><strong>Expected answer</strong><p>{question.correctAnswer}</p></> : null}</div>}
          {question.explanation ? <div className="result-explanation"><BookOpen size={15} /><div><strong>Explanation</strong><p>{question.explanation}</p></div></div> : null}{question.needsReview && question.markingGuide ? <div className="result-explanation"><CircleHelp size={15} /><div><strong>Marker guidance</strong><p>{question.markingGuide}</p></div></div> : null}
        </article>)}</div>
      </section>
      <div className="result-bottom-actions"><Link className="button button-secondary" href="/practice/history">View session history <ArrowRight size={14} /></Link><Link className="button button-primary" href="/practice">Back to practice <ArrowRight size={14} /></Link></div>
    </> : null}
  </AppShell>;
}
