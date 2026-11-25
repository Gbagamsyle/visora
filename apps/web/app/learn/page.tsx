"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Bookmark, BookOpen, Clock3, FileText, Layers3, Search, Sparkles } from "lucide-react";
import AppShell from "../../components/AppShell";
import "./learn.css";

interface LearnData {
  onboardingComplete: boolean;
  academic: { university: string; program: string; level: string; semester: string | null } | null;
  metrics: { courses: number; newMaterials: number };
  courses: Array<{ id: string; code: string; title: string; creditUnits: number | null; semester: string }>;
  recentMaterials: Array<{ id: string; title: string; type: string; createdAt: string; courseCode: string | null; courseTitle: string | null }>;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export default function LearnPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<LearnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All courses");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/dashboard/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("We couldn’t load your learning workspace.");
      setData(await response.json() as LearnData);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load your courses.");
    } finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { void load(); }, [load]);

  const courses = data?.courses.filter((course) => {
    const matchesQuery = `${course.code} ${course.title}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  }) ?? [];

  return (
    <AppShell active="Learn">
      {loading ? (
        <div className="learn-loading" aria-busy="true" aria-label="Loading learning workspace">
          <span className="skeleton" style={{ width: 220, height: 18 }} />
          <span className="skeleton" style={{ width: 350, height: 44 }} />
          <span className="skeleton" style={{ height: 220 }} />
          <div className="learn-loading-grid"><span className="skeleton" /><span className="skeleton" /></div>
        </div>
      ) : (
        <>
          {error ? (
            <section className="alert alert-danger learn-error" role="alert"><div><strong>We couldn’t load your courses.</strong><p>{error}</p></div><button className="button button-secondary" onClick={() => void load()}>Try again</button></section>
          ) : null}

          {data && !data.onboardingComplete ? (
            <section className="card learn-onboarding"><span className="learn-kicker">GET STARTED</span><h2>Personalize your learning library</h2><p>Add your academic profile to see courses and resources from your programme.</p><Link className="button button-primary" href="/onboarding">Complete setup <ArrowRight size={16} /></Link></section>
          ) : null}

          {data?.onboardingComplete ? (
            <>
              <section className="learn-hero">
                <div className="learn-hero-copy">
                  <span className="learn-hero-label"><Sparkles size={14} /> CONTINUE LEARNING</span>
                  <h2>{courses[0]?.title ?? "Your course workspace"}</h2>
                  <p>{courses[0]?.code ?? "Course"} · {courses[0]?.creditUnits ? `${courses[0].creditUnits} credit units` : "Current semester"}</p>
                  <Link className="button learn-hero-button" href={courses[0] ? "#course-library" : "/practice"}>Open course <ArrowRight size={16} /></Link>
                </div>
                <div className="learn-hero-art" aria-hidden="true">
                  <div className="learn-orbit orbit-one" /><div className="learn-orbit orbit-two" />
                  <div className="learn-book"><BookOpen size={39} strokeWidth={1.35} /></div>
                  <span className="learn-art-tag tag-one">Notes</span><span className="learn-art-tag tag-two">Review</span>
                </div>
                <div className="learn-hero-stats">
                  <article><span><BookOpen size={16} /></span><div><strong>{data.metrics.courses}</strong><small>Courses</small></div></article>
                  <article><span><FileText size={16} /></span><div><strong>{data.metrics.newMaterials}</strong><small>Materials</small></div></article>
                </div>
              </section>

              <section className="learn-library" id="course-library">
                <div className="learn-library-heading">
                  <div><p className="learn-kicker">YOUR STUDY PLAN</p><h2>Course library</h2></div>
                  <label className="learn-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" aria-label="Search courses" /></label>
                </div>

                <div className="learn-filter-row" aria-label="Course filters">
                  {["All courses", "Recently opened", "Saved"].map((item) => (
                    <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>
                  ))}
                </div>

                {courses.length ? (
                  <div className="learn-course-grid">
                    {courses.map((course, index) => (
                      <article className="learn-course-card" key={course.id}>
                        <div className={`course-cover cover-${index % 4}`}>
                          <span className="course-code">{course.code}</span>
                          <button type="button" aria-label={`Save ${course.title}`} className="course-save"><Bookmark size={17} /></button>
                          <div className="course-cover-mark"><Layers3 size={25} strokeWidth={1.35} /></div>
                        </div>
                        <div className="learn-course-body">
                          <div><h3>{course.title}</h3><p>{course.semester} · {course.creditUnits ? `${course.creditUnits} units` : "Course"}</p></div>
                          <button type="button" className="course-open" aria-label={`Open ${course.title}`}><ArrowUpRight size={17} /></button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <section className="learn-empty"><span><BookOpen size={22} /></span><h3>{query ? "No matching courses" : "Your courses are being organized"}</h3><p>{query ? "Try another course name or code." : "Course offerings for this level will appear here once they’re added."}</p></section>
                )}
              </section>

              <section className="learn-resources">
                <div className="learn-library-heading"><div><p className="learn-kicker">FRESH FROM THE LIBRARY</p><h2>Recent materials</h2></div><Link href="/learn">View all <ArrowRight size={15} /></Link></div>
                {data.recentMaterials.length ? (
                  <div className="learn-resource-list">
                    {data.recentMaterials.map((material) => (
                      <article className="learn-resource" key={material.id}>
                        <span className="resource-icon"><FileText size={18} /></span>
                        <div className="resource-copy"><strong>{material.title}</strong><span>{[material.courseCode, material.courseTitle].filter(Boolean).join(" · ") || "Course material"}</span></div>
                        <span className="resource-type">{material.type}</span>
                        <time dateTime={material.createdAt}><Clock3 size={13} /> {formatDate(material.createdAt)}</time>
                        <button type="button" aria-label={`Open ${material.title}`}><ArrowUpRight size={16} /></button>
                      </article>
                    ))}
                  </div>
                ) : <section className="learn-empty compact"><span><FileText size={20} /></span><h3>No materials yet</h3><p>Approved learning resources will appear here.</p></section>}
              </section>
            </>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
