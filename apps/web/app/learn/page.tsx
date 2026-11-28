"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, FileText, Layers3, Search, Sparkles, Upload, X } from "lucide-react";
import type { LearningMaterialSummary, LearningOverview, LearningMaterialType, LearningSubmissionSummary, SubmitLearningMaterialInput } from "@visora/shared";
import AppShell from "../../components/AppShell";
import MaterialCard from "../../components/learning/MaterialCard";
import "./learn.css";
import "./learning-milestone.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function SubmissionRow({ submission }: { submission: LearningSubmissionSummary }) {
  const statusLabel = submission.status.toLowerCase().replaceAll("_", " ");
  const statusClass = submission.status.toLowerCase().replaceAll("_", "-");

  return (
    <article className="learn-submission-row">
      <span className="submission-file-icon"><FileText size={17} aria-hidden="true" /></span>
      <div><strong>{submission.title}</strong><span>{submission.course?.code ?? "Programme-wide"} · {submission.type}</span>{submission.rejectionReason ? <small>{submission.rejectionReason}</small> : null}</div>
      <span className={`submission-status status-${statusClass}`}>{statusLabel}</span>
    </article>
  );
}

export default function LearnPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<LearningOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialResults, setMaterialResults] = useState<LearningMaterialSummary[] | null>(null);
  const [searchingMaterials, setSearchingMaterials] = useState(false);
  const [materialSearchError, setMaterialSearchError] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "saved">("all");
  const [materialView, setMaterialView] = useState<"recent" | "saved">("recent");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/learning/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (!response.ok) throw new Error("We couldn’t load your learning workspace.");
      setData(await response.json() as LearningOverview);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load your courses.");
    } finally { if (!quiet) setLoading(false); }
  }, [getToken]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const searchTerm = materialSearch.trim();
    if (!searchTerm) {
      setMaterialResults(null);
      setMaterialSearchError("");
      setSearchingMaterials(false);
      return;
    }

    let active = true;
    setSearchingMaterials(true);
    setMaterialSearchError("");
    const timer = window.setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Your session could not be verified. Please sign in again.");
        const response = await fetch(`${apiUrl}/learning/materials?q=${encodeURIComponent(searchTerm)}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("We couldn’t search learning materials.");
        const results = await response.json() as LearningMaterialSummary[];
        if (active) setMaterialResults(results);
      } catch (caught) {
        if (active) setMaterialSearchError(caught instanceof Error ? caught.message : "Unable to search learning materials.");
      } finally {
        if (active) setSearchingMaterials(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [getToken, materialSearch]);

  const courses = data?.courses.filter((course) => {
    const matchesQuery = `${course.code} ${course.title}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || (filter === "recent" ? course.recentlyViewed : course.savedMaterialCount > 0);
    return matchesQuery && matchesFilter;
  }) ?? [];
  const resourceItems = materialSearch.trim()
    ? materialResults ?? []
    : materialView === "recent" ? data?.recentMaterials ?? [] : data?.savedMaterials ?? [];

  const toggleSave = async (materialId: string, isSaved: boolean) => {
    setSavingId(materialId);
    setActionError("");
    setActionMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/learning/materials/${materialId}/save`, {
        method: isSaved ? "DELETE" : "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("We couldn’t update your saved materials.");
      setMaterialResults((current) => current?.map((material) => material.id === materialId ? { ...material, isSaved: !isSaved } : material) ?? null);
      await load(true);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to update saved materials.");
    } finally {
      setSavingId("");
    }
  };

  const submitResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const input: SubmitLearningMaterialInput = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      type: String(formData.get("type") ?? "LINK") as LearningMaterialType,
      url: String(formData.get("url") ?? ""),
      courseId: String(formData.get("courseId") ?? "") || undefined,
    };
    setUploading(true);
    setActionError("");
    setActionMessage("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/learning/materials`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { message?: string | string[] };
        throw new Error(Array.isArray(result.message) ? result.message.join(" ") : result.message ?? "We couldn’t submit this resource.");
      }
      form.reset();
      setUploadOpen(false);
      setActionMessage("Resource submitted. It will appear in the library after review.");
      await load(true);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to submit this resource.");
    } finally {
      setUploading(false);
    }
  };

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
                  <Link className="button learn-hero-button" href={courses[0] ? `/learn/courses/${courses[0].id}` : "/practice"}>Open course <ArrowRight size={16} /></Link>
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
                  <div className="learn-library-actions">
                    <label className="learn-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" aria-label="Search courses" /></label>
                    <button className="button button-secondary learn-upload" type="button" onClick={() => setUploadOpen((open) => !open)}><Upload size={15} /> Share a resource</button>
                  </div>
                </div>

                {uploadOpen ? (
                  <form className="learn-submit-form" onSubmit={(event) => void submitResource(event)}>
                    <div className="learn-submit-heading"><div><p className="learn-kicker">CONTRIBUTE TO YOUR LIBRARY</p><h3>Share a study resource</h3></div><button type="button" className="learn-close-button" aria-label="Close resource form" onClick={() => setUploadOpen(false)}><X size={17} /></button></div>
                    <p className="learn-storage-note">Submit a publicly reachable resource link. New materials stay pending until reviewed; direct file uploads will be enabled with storage setup.</p>
                    <div className="learn-submit-grid">
                      <label className="field"><span className="field-label">Resource title</span><input className="field-input" name="title" maxLength={180} required placeholder="e.g. Visual pathway lecture notes" /></label>
                      <label className="field"><span className="field-label">Resource URL</span><input className="field-input" type="url" name="url" required placeholder="https://…" /></label>
                      <label className="field"><span className="field-label">Material type</span><select className="field-select" name="type" defaultValue="LINK"><option value="LINK">Link</option><option value="PDF">PDF</option><option value="DOCUMENT">Document</option><option value="PRESENTATION">Presentation</option><option value="VIDEO">Video</option><option value="IMAGE">Image</option><option value="OTHER">Other</option></select></label>
                      <label className="field"><span className="field-label">Course (optional)</span><select className="field-select" name="courseId" defaultValue=""><option value="">Programme-wide</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select></label>
                      <label className="field learn-submit-description"><span className="field-label">Description (optional)</span><textarea className="field-textarea" name="description" maxLength={1500} placeholder="What should other students know about this resource?" /></label>
                    </div>
                    <div className="learn-submit-footer"><span>Submissions are visible to you while they’re under review.</span><button className="button button-primary" type="submit" disabled={uploading}>{uploading ? "Submitting…" : "Submit for review"}</button></div>
                  </form>
                ) : null}

                <div className="learn-filter-row" aria-label="Course filters">
                  {([
                    { key: "all", label: "All courses" },
                    { key: "recent", label: "Recently opened" },
                    { key: "saved", label: "Courses with saved resources" },
                  ] as const).map(({ key, label }) => (
                    <button key={key} type="button" className={filter === key ? "active" : ""} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
                  ))}
                </div>

                {courses.length ? (
                  <div className="learn-course-grid">
                    {courses.map((course, index) => (
                      <article className="learn-course-card" key={course.id}>
                        <div className={`course-cover cover-${index % 4}`}>
                          <span className="course-code">{course.code}</span>
                          <span className="course-resource-count">{course.materialCount} {course.materialCount === 1 ? "resource" : "resources"}</span>
                          <div className="course-cover-mark"><Layers3 size={25} strokeWidth={1.35} /></div>
                        </div>
                        <div className="learn-course-body">
                          <div><h3>{course.title}</h3><p>{course.semester} · {course.creditUnits ? `${course.creditUnits} units` : "Course"} · {course.topicCount} topics</p></div>
                          <Link href={`/learn/courses/${course.id}`} className="course-open" aria-label={`Open ${course.title}`}><ArrowUpRight size={17} /></Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <section className="learn-empty"><span><BookOpen size={22} /></span><h3>{query ? "No matching courses" : filter === "recent" ? "No recently opened courses" : filter === "saved" ? "No saved resources yet" : "Your courses are being organized"}</h3><p>{query ? "Try another course name or code." : filter === "all" ? "Course offerings for this level will appear here once they’re added." : "Open a course or save a resource to see it here."}</p></section>
                )}
              </section>

              <section className="learn-resources">
                <div className="learn-library-heading">
                  <div><p className="learn-kicker">YOUR ACTIVITY</p><h2>{materialView === "recent" ? "Recently opened" : "Saved materials"}</h2></div>
                  <div className="learn-material-tools">
                    <label className="learn-search learn-material-search"><Search size={15} aria-hidden="true" /><input value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} placeholder="Search materials" aria-label="Search learning materials" /></label>
                    {!materialSearch.trim() ? <div className="learn-resource-tabs" role="tablist" aria-label="Material list">
                      <button type="button" role="tab" aria-selected={materialView === "recent"} className={materialView === "recent" ? "active" : ""} onClick={() => setMaterialView("recent")}>Recent</button>
                      <button type="button" role="tab" aria-selected={materialView === "saved"} className={materialView === "saved" ? "active" : ""} onClick={() => setMaterialView("saved")}>Saved</button>
                    </div> : null}
                  </div>
                </div>
                {actionError ? <p className="learn-action-message error" role="alert">{actionError}</p> : null}
                {actionMessage ? <p className="learn-action-message" role="status">{actionMessage}</p> : null}
                {materialSearchError ? <p className="learn-action-message error" role="alert">{materialSearchError}</p> : null}
                {searchingMaterials ? <p className="learn-search-status" role="status">Searching approved materials…</p> : null}
                {resourceItems.length && (!materialSearch.trim() || !searchingMaterials) ? (
                  <div className="learn-resource-list">
                    {resourceItems.map((material) => <MaterialCard key={material.id} material={material} saving={savingId === material.id} onToggleSave={(id, isSaved) => void toggleSave(id, isSaved)} />)}
                  </div>
                ) : !searchingMaterials ? <section className="learn-empty compact"><span><FileText size={20} /></span><h3>{materialSearch.trim() ? "No matching materials" : materialView === "recent" ? "Nothing opened yet" : "Nothing saved yet"}</h3><p>{materialSearch.trim() ? "Try a different title, topic or course code." : materialView === "recent" ? "Open a course resource to build your recent reading list." : "Save useful materials to keep them close at hand."}</p></section> : null}
              </section>

              {data.submissions.length ? (
                <section className="learn-submissions">
                  <div className="learn-library-heading"><div><p className="learn-kicker">YOUR CONTRIBUTIONS</p><h2>Resource review status</h2></div></div>
                  {data.submissions.map((submission) => <SubmissionRow key={submission.id} submission={submission} />)}
                </section>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
