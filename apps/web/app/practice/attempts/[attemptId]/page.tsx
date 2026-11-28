"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, Flag, Send } from "lucide-react";
import type { PracticeAttempt } from "@visora/shared";
import AppShell from "../../../../components/AppShell";
import "../../../../components/practice/practice.css";
import "./attempt.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
type AnswerState = { selectedOptionIds: string[]; textAnswer: string };

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function PracticeAttemptPage() {
  const { getToken } = useAuth();
  const params = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const saveTimers = useRef(new Map<string, number>());
  const pendingAnswers = useRef(new Map<string, AnswerState>());
  const saveChains = useRef(new Map<string, Promise<void>>());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/attempts/${params.attemptId}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("This practice session is no longer available.");
      const result = await response.json() as PracticeAttempt;
      if (result.status !== "IN_PROGRESS" || !Array.isArray(result.questions)) { router.replace(`/practice/attempts/${params.attemptId}/results`); return; }
      setAttempt(result);
      setAnswers(Object.fromEntries(result.questions.map((question) => [question.id, { selectedOptionIds: question.selectedOptionIds, textAnswer: question.textAnswer ?? "" }])));
      if (result.expiresAt) setSecondsLeft(Math.max(0, Math.ceil((new Date(result.expiresAt).getTime() - Date.now()) / 1000)));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load this session."); }
    finally { setLoading(false); }
  }, [getToken, params.attemptId, router]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (secondsLeft === null || submitting) return;
    if (secondsLeft <= 0) { void submit(true); return; }
    const timer = window.setTimeout(() => setSecondsLeft((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, submitting]);

  const currentQuestion = attempt?.questions[index];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] ?? { selectedOptionIds: [], textAnswer: "" } : null;
  const answeredCount = useMemo(() => attempt?.questions.filter((question) => {
    const answer = answers[question.id];
    return answer && (answer.selectedOptionIds.length > 0 || answer.textAnswer.trim().length > 0);
  }).length ?? 0, [answers, attempt]);

  const persistAnswer = async (questionId: string, value: AnswerState) => {
    const previous = saveChains.current.get(questionId) ?? Promise.resolve();
    const operation = previous.catch(() => undefined).then(async () => {
      setSaving(true);
      try {
        const token = await getToken();
        if (!token) throw new Error("Your session could not be verified.");
        const response = await fetch(`${apiUrl}/practice/attempts/${params.attemptId}/answers/${questionId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ selectedOptionIds: value.selectedOptionIds, textAnswer: value.textAnswer }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({})) as { message?: string };
          if (body.message?.toLowerCase().includes("time expired")) {
            router.replace(`/practice/attempts/${params.attemptId}/results`);
            return;
          }
          throw new Error(body.message ?? "Your answer could not be saved.");
        }
        if (pendingAnswers.current.get(questionId) === value) pendingAnswers.current.delete(questionId);
        setError("");
      } catch (caught) { setError(caught instanceof Error ? caught.message : "Answer save failed."); }
      finally { setSaving(false); }
    });
    saveChains.current.set(questionId, operation);
    await operation;
    if (saveChains.current.get(questionId) === operation) saveChains.current.delete(questionId);
  };

  const updateAnswer = (questionId: string, value: AnswerState) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    pendingAnswers.current.set(questionId, value);
    const timer = saveTimers.current.get(questionId);
    if (timer !== undefined) window.clearTimeout(timer);
    saveTimers.current.set(questionId, window.setTimeout(() => {
      saveTimers.current.delete(questionId);
      void persistAnswer(questionId, value);
    }, 260));
  };

  async function submit(autoSubmit = false) {
    if (submitting) return;
    if (!autoSubmit && !window.confirm("Submit this session now? You can’t change answers after submitting.")) return;
    setSubmitting(true);
    setError("");
    try {
      const pending = [...pendingAnswers.current.entries()];
      for (const [questionId, timer] of saveTimers.current) window.clearTimeout(timer);
      saveTimers.current.clear();
      await Promise.all(pending.map(([questionId, value]) => persistAnswer(questionId, value)));
      if (pendingAnswers.current.size > 0) throw new Error("Some answers could not be saved. Check your connection and submit again.");
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/attempts/${params.attemptId}/submit`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("We couldn’t submit your session. Check your connection and try again.");
      router.push(`/practice/attempts/${params.attemptId}/results`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to submit this session."); setSubmitting(false); }
  }

  const toggleOption = (optionId: string) => {
    if (!currentQuestion || !currentAnswer) return;
    const selectedOptionIds = currentQuestion.type === "MULTIPLE_CHOICE"
      ? currentAnswer.selectedOptionIds.includes(optionId) ? currentAnswer.selectedOptionIds.filter((id) => id !== optionId) : [...currentAnswer.selectedOptionIds, optionId]
      : currentAnswer.selectedOptionIds.includes(optionId) ? [] : [optionId];
    updateAnswer(currentQuestion.id, { ...currentAnswer, selectedOptionIds });
  };

  return <AppShell active="Practice">
    {loading ? <div className="practice-loading" aria-busy="true"><span className="skeleton" style={{ height: 130 }} /><span className="skeleton" style={{ height: 310 }} /></div> : error && !attempt ? <section className="alert alert-danger" role="alert"><div>{error}</div><Link className="button button-secondary" href="/practice">Back to practice</Link></section> : attempt && currentQuestion && currentAnswer ? <>
      <header className="attempt-header"><div><Link href="/practice" className="attempt-exit"><ArrowLeft size={15} /> Exit</Link><p className="premium-eyebrow">{attempt.test.type.replaceAll("_", " ")}</p><h1>{attempt.test.title}</h1></div><div className="attempt-header-status">{secondsLeft !== null ? <span className={`attempt-timer${secondsLeft < 60 ? " urgent" : ""}`} aria-live="polite"><Clock3 size={15} /> {formatRemaining(secondsLeft)}</span> : <span className="attempt-untimed">Untimed</span>}<small>{saving ? "Saving…" : "Answers saved"}</small></div></header>
      <div className="attempt-layout"><section className="attempt-question-card"><div className="attempt-question-top"><span>Question {index + 1} <i /> {attempt.questions.length}</span><span>{currentQuestion.marks} {currentQuestion.marks === 1 ? "mark" : "marks"}</span></div><div className="attempt-question-progress"><i style={{ width: `${((index + 1) / attempt.questions.length) * 100}%` }} /></div><div className="attempt-question-content"><div className="attempt-question-label"><span>{currentQuestion.type.replaceAll("_", " ")}</span>{currentQuestion.course ? <span>{currentQuestion.course.code}</span> : null}{currentQuestion.topic ? <span>{currentQuestion.topic.title}</span> : null}</div><h2>{currentQuestion.body}</h2>
        {currentQuestion.options.length ? <div className="attempt-options">{currentQuestion.options.map((option, optionIndex) => { const selected = currentAnswer.selectedOptionIds.includes(option.id); return <button key={option.id} type="button" className={`attempt-option${selected ? " selected" : ""}`} onClick={() => toggleOption(option.id)} aria-pressed={selected}><span className="attempt-option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option.text}</span>{selected ? <Check size={16} /> : null}</button>; })}</div> : <label className="attempt-written-answer"><span>{currentQuestion.type === "THEORY" ? "Your response" : "Your answer"}</span><textarea value={currentAnswer.textAnswer} onChange={(event) => updateAnswer(currentQuestion.id, { ...currentAnswer, textAnswer: event.target.value })} maxLength={10000} placeholder="Write your answer here…" /></label>}
      </div><div className="attempt-question-footer"><button type="button" className="attempt-previous" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}><ArrowLeft size={15} /> Previous</button><span>{currentQuestion.type === "MULTIPLE_CHOICE" ? "Select all that apply" : "Your answer is saved automatically"}</span>{index < attempt.questions.length - 1 ? <button type="button" className="button button-primary" onClick={() => setIndex((value) => Math.min(attempt.questions.length - 1, value + 1))}>Next <ArrowRight size={15} /></button> : <button type="button" className="button button-primary" disabled={submitting} onClick={() => void submit()}><Send size={14} /> {submitting ? "Submitting…" : "Submit session"}</button>}</div>{error ? <p className="learn-action-message error attempt-save-error" role="alert">{error}</p> : null}</section>
        <aside className="attempt-question-nav"><div><strong>Questions</strong><small>{answeredCount} of {attempt.questions.length} answered</small></div><div className="attempt-number-grid">{attempt.questions.map((question, questionIndex) => { const answer = answers[question.id]; const answered = Boolean(answer && (answer.selectedOptionIds.length || answer.textAnswer.trim())); return <button key={question.id} type="button" className={`${questionIndex === index ? "current" : ""}${answered ? " answered" : ""}`} onClick={() => setIndex(questionIndex)} aria-label={`Go to question ${questionIndex + 1}${answered ? ", answered" : ", unanswered"}`}>{answered ? <Check size={13} /> : questionIndex + 1}</button>; })}</div><p><Flag size={13} /> Select a number to move between questions.</p><button className="attempt-submit-secondary" type="button" disabled={submitting} onClick={() => void submit()}>{submitting ? "Submitting…" : "Submit session"} <ArrowRight size={14} /></button></aside>
      </div>
    </> : null}
  </AppShell>;
}
