"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, FileQuestion, Search } from "lucide-react";
import type { PracticeQuestionSummary, PracticeOverview } from "@visora/shared";
import AppShell from "../../../components/AppShell";
import "../../../components/practice/practice.css";
import "./questions.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function PastQuestionsPage() {
  const { getToken } = useAuth();
  const [courses, setCourses] = useState<PracticeOverview["courses"]>([]);
  const [questions, setQuestions] = useState<PracticeQuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [examYear, setExamYear] = useState("");
  const [type, setType] = useState("");
  const [topics, setTopics] = useState<Array<{ id: string; title: string }>>([]);

  const loadCatalog = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified.");
      const response = await fetch(`${apiUrl}/practice/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("We couldn’t load your academic courses.");
      const overview = await response.json() as PracticeOverview;
      setCourses(overview.courses);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load courses.");
    }
  }, [getToken]);

  useEffect(() => { void loadCatalog(); }, [loadCatalog]);

  useEffect(() => {
    let active = true;
    if (!courseId) { setTopics([]); setTopicId(""); return; }
    void (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await fetch(`${apiUrl}/learning/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!response.ok) return;
        const detail = await response.json() as { topics: Array<{ id: string; title: string }> };
        if (active) setTopics(detail.topics);
      } catch { if (active) setTopics([]); }
    })();
    return () => { active = false; };
  }, [courseId, getToken]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = window.setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your session could not be verified. Please sign in again.");
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (courseId) params.set("courseId", courseId);
        if (topicId) params.set("topicId", topicId);
        if (difficulty) params.set("difficulty", difficulty);
        if (examYear) params.set("examYear", examYear);
        if (type) params.set("type", type);
        const response = await fetch(`${apiUrl}/practice/questions${params.size ? `?${params}` : ""}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
        if (!response.ok) throw new Error("We couldn’t load past questions.");
        if (active) setQuestions(await response.json() as PracticeQuestionSummary[]);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load past questions.");
      } finally { if (active) setLoading(false); }
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [courseId, difficulty, examYear, getToken, query, topicId, type]);

  return (
    <AppShell active="Practice">
      <Link className="course-back-link" href="/practice"><ArrowLeft size={16} /> Practice</Link>
      <header className="premium-page-header"><div><p className="premium-eyebrow">PRACTICE LIBRARY</p><h1>Past questions</h1><p>Filter previous exam questions by course, topic and difficulty.</p></div></header>
      <section className="question-browser">
        <div className="question-filter-grid">
          <label className="practice-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search question text" aria-label="Search question text" /></label>
          <select value={courseId} onChange={(event) => { setCourseId(event.target.value); setTopicId(""); }} aria-label="Course"><option value="">All courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select>
          <select value={topicId} onChange={(event) => setTopicId(event.target.value)} aria-label="Topic" disabled={!courseId}><option value="">All topics</option>{topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</select>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} aria-label="Difficulty"><option value="">Any difficulty</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select>
          <input className="question-year-input" type="number" min="1900" max={new Date().getFullYear() + 1} value={examYear} onChange={(event) => setExamYear(event.target.value)} placeholder="Exam year" aria-label="Exam year" />
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Question type"><option value="">All types</option><option value="SINGLE_CHOICE">Single choice</option><option value="MULTIPLE_CHOICE">Multiple choice</option><option value="TRUE_FALSE">True / false</option><option value="SHORT_ANSWER">Short answer</option><option value="THEORY">Theory</option></select>
        </div>
        {error ? <section className="alert alert-danger" role="alert">{error}</section> : null}
        <div className="question-result-heading"><strong>{loading ? "Searching…" : `${questions.length} ${questions.length === 1 ? "question" : "questions"}`}</strong><span>Answers and explanations are hidden until you complete a practice session.</span></div>
        {loading ? <div className="practice-question-skeletons" aria-busy="true"><span className="skeleton" style={{ height: 128 }} /><span className="skeleton" style={{ height: 128 }} /></div> : questions.length ? <div className="question-result-list">{questions.map((question) => (
          <article className="question-preview-card" key={question.id}>
            <div className="question-preview-meta"><span>{question.course?.code ?? "General"}</span>{question.topic ? <><i /> <span>{question.topic.title}</span></> : null}{question.examYear ? <><i /> <span>{question.examYear}{question.examSession ? ` · ${question.examSession}` : ""}</span></> : null}<span className="question-type-pill">{question.type.replaceAll("_", " ")}</span>{question.difficulty ? <span className="question-difficulty">Level {question.difficulty}/5</span> : null}</div>
            <h2>{question.body}</h2>
            {question.options.length ? <ol type="A" className="question-option-preview">{question.options.map((option) => <li key={option.id}>{option.text}</li>)}</ol> : <p className="question-answer-hint">{question.type === "THEORY" ? "Written response" : "Short response"}</p>}
          </article>
        ))}</div> : <section className="learn-empty"><span><FileQuestion size={22} /></span><h3>No matching questions</h3><p>Try changing a filter, or check back when questions have been published for your study plan.</p><Link className="button button-secondary" href="/practice">Back to practice sets</Link></section>}
      </section>
    </AppShell>
  );
}
