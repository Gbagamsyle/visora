"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import type { FlashcardSummary } from "@visora/shared";
import AppShell from "../../../components/AppShell";
import "../../../components/practice/practice.css";
import "./flashcards.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const ratings = [
  { key: "AGAIN", label: "Again", detail: "Review soon", tone: "again" },
  { key: "HARD", label: "Hard", detail: "Tomorrow", tone: "hard" },
  { key: "GOOD", label: "Good", detail: "A few days", tone: "good" },
  { key: "EASY", label: "Easy", detail: "Later", tone: "easy" },
] as const;

export default function FlashcardsPage() {
  const { getToken } = useAuth();
  const [cards, setCards] = useState<FlashcardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dueOnly, setDueOnly] = useState(true);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/flashcards?dueOnly=${dueOnly}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("We couldn’t load your flashcards.");
      setCards(await response.json() as FlashcardSummary[]);
      setIndex(0); setFlipped(false);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load flashcards."); }
    finally { setLoading(false); }
  }, [dueOnly, getToken]);
  useEffect(() => { void load(); }, [load]);

  const review = async (rating: typeof ratings[number]["key"]) => {
    const card = cards[index];
    if (!card || reviewing) return;
    setReviewing(true); setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/practice/flashcards/${card.id}/review`, { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ rating }) });
      if (!response.ok) throw new Error("We couldn’t save your flashcard review.");
      setReviewCount((count) => count + 1);
      setFlipped(false);
      if (index < cards.length - 1) setIndex(index + 1);
      else await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to save review."); }
    finally { setReviewing(false); }
  };

  const current = cards[index];
  return <AppShell active="Practice"><Link className="course-back-link" href="/practice"><ArrowLeft size={16} /> Practice</Link><header className="premium-page-header"><div><p className="premium-eyebrow">SPACED REPETITION</p><h1>Flashcards</h1><p>Strengthen recall with short, focused reviews.</p></div><label className="flashcard-due-toggle"><input type="checkbox" checked={dueOnly} onChange={(event) => setDueOnly(event.target.checked)} /> Due cards only</label></header>
    {error ? <p className="learn-action-message error" role="alert">{error}</p> : null}
    {loading ? <div className="practice-loading" aria-busy="true"><span className="skeleton" style={{ height: 330 }} /></div> : current ? <section className="flashcard-session"><div className="flashcard-session-top"><span><Sparkles size={14} /> REVIEW SESSION</span><strong>{index + 1} <i /> {cards.length}</strong></div><div className="flashcard-progress"><i style={{ width: `${((index + 1) / cards.length) * 100}%` }} /></div>
      <button type="button" className={`flashcard-flip-card${flipped ? " flipped" : ""}`} onClick={() => setFlipped((value) => !value)} aria-label={flipped ? "Show flashcard front" : "Reveal flashcard answer"}><span className="flashcard-face-label">{flipped ? "ANSWER" : "PROMPT"}</span><strong>{flipped ? current.back : current.front}</strong><small>{flipped ? "Click to see prompt" : "Click to reveal answer"}</small></button>
      <div className="flashcard-controls"><button type="button" className="flashcard-nav" disabled={index === 0} onClick={() => { setIndex((value) => Math.max(0, value - 1)); setFlipped(false); }} aria-label="Previous flashcard"><ChevronLeft size={17} /></button><button type="button" className="flashcard-reveal-button" onClick={() => setFlipped((value) => !value)}><RotateCcw size={14} /> {flipped ? "Show prompt" : "Reveal answer"}</button><button type="button" className="flashcard-nav" disabled={index >= cards.length - 1} onClick={() => { setIndex((value) => Math.min(cards.length - 1, value + 1)); setFlipped(false); }} aria-label="Next flashcard"><ChevronRight size={17} /></button></div>
      {flipped ? <div className="flashcard-rating"><p>How well did you recall it?</p><div>{ratings.map((rating) => <button key={rating.key} type="button" className={`rating-${rating.tone}`} disabled={reviewing} onClick={() => void review(rating.key)}><strong>{rating.label}</strong><small>{rating.detail}</small></button>)}</div></div> : <p className="flashcard-reminder"><Check size={13} /> Rate your recall after revealing the answer to schedule your next review.</p>}
      <div className="flashcard-session-footer"><span>{current.course?.code ?? "General"}{current.topic ? ` · ${current.topic.title}` : ""}</span><span>{reviewCount} reviewed this session</span></div>
    </section> : <section className="learn-empty"><span><Check size={22} /></span><h2>{dueOnly ? "You’re all caught up" : "No flashcards available yet"}</h2><p>{dueOnly ? "No cards are due right now. You can include all cards or come back later." : "Published flashcards for your study plan will appear here."}</p><div className="flashcard-empty-actions"><button className="button button-secondary" type="button" onClick={() => setDueOnly(false)}>Browse all cards</button><Link className="button button-primary" href="/practice">Back to practice</Link></div></section>}
  </AppShell>;
}
