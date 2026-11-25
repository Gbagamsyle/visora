import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, BrainCircuit, CheckCircle2, Clock3, FileQuestion, Layers3, Target } from "lucide-react";
import AppShell from "../../components/AppShell";

export default function PracticePage() {
  const modes = [
    { title: "Past questions", copy: "Practise real questions from previous examinations.", icon: FileQuestion, count: "240+", color: "teal" },
    { title: "Timed tests", copy: "Build exam stamina with focused timed sessions.", icon: Clock3, count: "12 sets", color: "blue" },
    { title: "Quick review", copy: "Sharpen key concepts in short, focused rounds.", icon: Layers3, count: "18 topics", color: "amber" },
  ];

  return (
    <AppShell active="Practice">
      <header className="premium-page-header">
        <div><p className="premium-eyebrow">EXAM PREPARATION</p><h1>Practice</h1><p>Turn what you know into confidence, one focused session at a time.</p></div>
        <button className="button button-primary premium-header-action"><Target size={16} /> Start a practice set</button>
      </header>

      <section className="practice-hero">
        <div className="practice-hero-copy"><span className="practice-hero-label"><BrainCircuit size={14} /> RECOMMENDED NEXT</span><h2>Visual Optics review</h2><p>12 questions · 20 minutes · Medium difficulty</p><button className="button practice-hero-button">Continue session <ArrowRight size={16} /></button></div>
        <div className="practice-progress"><div className="practice-progress-ring"><span>68<small>%</small></span></div><div><strong>Weekly progress</strong><span>3 of 5 sessions completed</span></div></div>
      </section>

      <section className="practice-section">
        <div className="premium-section-heading"><div><p className="premium-eyebrow">CHOOSE YOUR SESSION</p><h2>Practice modes</h2></div></div>
        <div className="practice-mode-grid">
          {modes.map(({ title, copy, icon: Icon, count, color }) => (
            <article className="practice-mode-card" key={title}><span className={`practice-mode-icon ${color}`}><Icon size={20} /></span><div className="practice-mode-count">{count}</div><h3>{title}</h3><p>{copy}</p><button type="button" aria-label={`Open ${title}`}>Open <ArrowUpRight size={15} /></button></article>
          ))}
        </div>
      </section>

      <div className="practice-bottom-grid">
        <section className="premium-panel">
          <div className="premium-section-heading"><div><p className="premium-eyebrow">YOUR PERFORMANCE</p><h2>Recent activity</h2></div><Link href="/practice">View report <ArrowRight size={14} /></Link></div>
          <div className="practice-activity-list">
            {[["Visual Optics", "84%", "12 questions", "Today"],["Anatomy of the Eye", "76%", "20 questions", "Yesterday"],["Clinical Optics", "91%", "15 questions", "Nov 22"]].map(([title, score, detail, date]) => <article key={title}><span className="practice-result-icon"><CheckCircle2 size={17} /></span><div><strong>{title}</strong><span>{detail}</span></div><span className="practice-score">{score}</span><time>{date}</time></article>)}
          </div>
        </section>
        <aside className="practice-streak-card"><span><BarChart3 size={18} /></span><p className="premium-eyebrow">CURRENT STREAK</p><strong>5 days</strong><p>Keep practising for 2 more days to reach your personal best.</p><div className="practice-week">{["M","T","W","T","F","S","S"].map((day, index) => <span className={index < 5 ? "done" : ""} key={`${day}-${index}`}>{index < 5 ? <CheckCircle2 size={13} /> : day}</span>)}</div></aside>
      </div>
    </AppShell>
  );
}
