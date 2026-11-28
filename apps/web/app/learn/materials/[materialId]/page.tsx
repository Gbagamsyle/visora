"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark, BookmarkCheck, CalendarDays, ExternalLink, FileText } from "lucide-react";
import type { LearningMaterialDetail } from "@visora/shared";
import AppShell from "../../../../components/AppShell";
import "../../learn.css";
import "../../learning-milestone.css";
import "./material.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LearningMaterialPage() {
  const { getToken } = useAuth();
  const params = useParams<{ materialId: string }>();
  const materialId = params.materialId;
  const [material, setMaterial] = useState<LearningMaterialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${apiUrl}/learning/materials/${materialId}`, { headers, cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 404 ? "This material is unavailable in your study library." : "We couldn’t load this material.");
      const result = await response.json() as LearningMaterialDetail;
      setMaterial(result);
      void fetch(`${apiUrl}/learning/materials/${materialId}/view`, { method: "POST", headers }).catch(() => undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load this material.");
    } finally {
      setLoading(false);
    }
  }, [getToken, materialId]);

  useEffect(() => { void load(); }, [load]);

  const toggleSave = async () => {
    if (!material) return;
    setSaving(true);
    setSaveError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/learning/materials/${material.id}/save`, {
        method: material.isSaved ? "DELETE" : "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("We couldn’t update your saved materials.");
      setMaterial({ ...material, isSaved: !material.isSaved });
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "Unable to update saved materials.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell active="Learn">
      <Link className="course-back-link" href={material?.courseId ? `/learn/courses/${material.courseId}` : "/learn"}><ArrowLeft size={16} /> {material?.course?.title ?? "Course library"}</Link>
      {loading ? (
        <div className="learn-loading" aria-busy="true" aria-label="Loading material"><span className="skeleton" style={{ height: 190 }} /><span className="skeleton" style={{ height: 310 }} /></div>
      ) : error ? (
        <section className="alert alert-danger learn-error" role="alert"><div><strong>Material unavailable</strong><p>{error}</p></div><button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button></section>
      ) : material ? (
        <article className="material-detail">
          <header className="material-detail-heading">
            <span className="material-detail-icon"><FileText size={24} /></span>
            <div className="material-detail-copy"><span className="material-type-badge">{material.type}</span><h1>{material.title}</h1><p>{[material.course?.code, material.course?.title, material.topic?.title].filter(Boolean).join(" · ") || "Programme resource"}</p></div>
            <button className={`button button-secondary material-save-button${material.isSaved ? " saved" : ""}`} type="button" onClick={() => void toggleSave()} disabled={saving} aria-pressed={material.isSaved}><BookmarkIcon saved={material.isSaved} /> {material.isSaved ? "Saved" : "Save"}</button>
          </header>
          {saveError ? <p className="learn-action-message error" role="alert">{saveError}</p> : null}
          {material.description ? <p className="material-description">{material.description}</p> : null}
          <section className="material-open-panel">
            <div className="material-open-art"><FileText size={38} strokeWidth={1.4} /></div>
            <div><p className="learn-kicker">RESOURCE</p><h2>{material.externalUrl ? "Ready to open" : "Resource preview unavailable"}</h2><p>{material.externalUrl ? "This resource is hosted externally. Open it in a new tab to view the original material." : "This item does not have a public resource link yet. File storage is not configured for this workspace."}</p></div>
            {material.externalUrl ? <a className="button button-primary" href={material.externalUrl} target="_blank" rel="noopener noreferrer">Open resource <ExternalLink size={15} /></a> : null}
          </section>
          <footer className="material-detail-footer"><span><CalendarDays size={14} /> Added {new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" }).format(new Date(material.createdAt))}</span>{material.externalUrl ? <a href={material.externalUrl} target="_blank" rel="noopener noreferrer">Open link <ArrowUpRight size={14} /></a> : null}</footer>
        </article>
      ) : null}
    </AppShell>
  );
}

function BookmarkIcon({ saved }: { saved: boolean }) {
  const Icon = saved ? BookmarkCheck : Bookmark;
  return <Icon size={16} aria-hidden="true" />;
}
