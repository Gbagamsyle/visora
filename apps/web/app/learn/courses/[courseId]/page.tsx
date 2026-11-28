"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, FileText, Layers3 } from "lucide-react";
import type { LearningCourseDetail } from "@visora/shared";
import AppShell from "../../../../components/AppShell";
import MaterialCard from "../../../../components/learning/MaterialCard";
import "../../learn.css";
import "../../learning-milestone.css";
import "./course.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LearningCoursePage() {
  const { getToken } = useAuth();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const [data, setData] = useState<LearningCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/learning/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(response.status === 404 ? "This course is not in your current study plan." : "We couldn’t load this course.");
      setData(await response.json() as LearningCourseDetail);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load this course.");
    } finally {
      setLoading(false);
    }
  }, [courseId, getToken]);

  useEffect(() => { void load(); }, [load]);

  const toggleSave = async (materialId: string, isSaved: boolean) => {
    setSavingId(materialId);
    try {
      const token = await getToken();
      if (!token) throw new Error("Your session could not be verified. Please sign in again.");
      const response = await fetch(`${apiUrl}/learning/materials/${materialId}/save`, {
        method: isSaved ? "DELETE" : "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("We couldn’t update your saved materials.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update saved materials.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <AppShell active="Learn">
      <Link className="course-back-link" href="/learn"><ArrowLeft size={16} /> Course library</Link>
      {loading ? (
        <div className="learn-loading" aria-busy="true" aria-label="Loading course"><span className="skeleton" style={{ height: 190 }} /><span className="skeleton" style={{ height: 240 }} /></div>
      ) : error ? (
        <section className="alert alert-danger learn-error" role="alert"><div><strong>Course unavailable</strong><p>{error}</p></div><button className="button button-secondary" type="button" onClick={() => void load()}>Try again</button></section>
      ) : data ? (
        <>
          <header className="course-detail-hero">
            <div className="course-detail-icon"><BookOpen size={25} /></div>
            <div className="course-detail-copy"><span>{data.course.code} <i /> {data.course.semester} semester</span><h1>{data.course.title}</h1><p>{data.course.description || "Your course materials, organized by topic."}</p></div>
            <div className="course-detail-stats"><span><Layers3 size={15} /> {data.topics.length} topics</span><span><FileText size={15} /> {data.topics.reduce((total, topic) => total + topic.materials.length, data.uncategorizedMaterials.length)} resources</span></div>
          </header>

          {error ? <p className="learn-action-message error" role="alert">{error}</p> : null}

          <div className="course-topic-list">
            {data.topics.map((topic) => (
              <section className="course-topic-card" key={topic.id}>
                <header><span className="topic-order">{String(topic.sortOrder).padStart(2, "0")}</span><div><h2>{topic.title}</h2><p>{topic.description || `${topic.materials.length} ${topic.materials.length === 1 ? "resource" : "resources"}`}</p></div></header>
                {topic.materials.length ? <div className="learn-resource-list">{topic.materials.map((material) => <MaterialCard key={material.id} material={material} saving={savingId === material.id} onToggleSave={(id, isSaved) => void toggleSave(id, isSaved)} />)}</div> : <p className="topic-empty">Resources for this topic will appear here after they are approved.</p>}
              </section>
            ))}

            {data.uncategorizedMaterials.length ? (
              <section className="course-topic-card"><header><span className="topic-order"><FileText size={16} /></span><div><h2>Course resources</h2><p>Materials not assigned to a specific topic</p></div></header><div className="learn-resource-list">{data.uncategorizedMaterials.map((material) => <MaterialCard key={material.id} material={material} saving={savingId === material.id} onToggleSave={(id, isSaved) => void toggleSave(id, isSaved)} />)}</div></section>
            ) : null}

            {!data.topics.length && !data.uncategorizedMaterials.length ? <section className="learn-empty"><span><BookOpen size={22} /></span><h3>No course resources yet</h3><p>Approved materials for this course will appear here.</p><Link className="button button-secondary" href="/learn">Back to courses</Link></section> : null}
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
