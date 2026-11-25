"use client";

import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface University { id: string; name: string; shortName?: string | null }
interface Program { id: string; name: string; code?: string | null }
interface Level { id: string; name: string }

export default function OnboardingPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [programId, setProgramId] = useState("");
  const [academicLevelId, setAcademicLevelId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/academic/universities`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`University service returned ${response.status}`);
        return response.json() as Promise<University[]>;
      })
      .then((items) => {
        setUniversities(items);
        if (items.length === 0) setError("No universities are configured yet. Start the API, apply database migrations, and run the seed command.");
      })
      .catch(() => setError("Unable to reach the university service. Make sure PostgreSQL and the NestJS API are running."));
  }, []);

  useEffect(() => {
    setProgramId("");
    setAcademicLevelId("");
    setPrograms([]);
    setLevels([]);
    if (!universityId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/academic/universities/${universityId}/programs`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load programmes");
        return response.json();
      })
      .then(setPrograms)
      .catch(() => setError("Unable to load programmes. Please try again."));
  }, [universityId]);

  useEffect(() => {
    setAcademicLevelId("");
    setLevels([]);
    if (!programId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/academic/programs/${programId}/levels`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load academic levels");
        return response.json();
      })
      .then(setLevels)
      .catch(() => setError("Unable to load academic levels. Please try again."));
  }, [programId]);

  async function completeSetup() {
    setError("");
    setLoading(true);
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
      const provisionResponse = await fetch(`${apiUrl}/users/provision`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!provisionResponse.ok) throw new Error((await provisionResponse.json()).message ?? "Unable to create the local user");
      const response = await fetch(`${apiUrl}/users/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ universityId, programId, academicLevelId, displayName: displayName || user?.fullName || undefined, phoneNumber, matricNumber }),
      });
      if (!response.ok) throw new Error((await response.json()).message ?? "Unable to complete onboarding");
      window.location.assign("/home");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to complete onboarding");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="card" style={{ width: "min(760px, 100%)", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Link href="/" className="wordmark" style={{ textDecoration: "none" }}><span className="mark">V</span><span>Visora</span></Link><span style={{ color: "var(--muted)", fontSize: 13 }}>Step 1 of 2</span></div>
        <h1 style={{ margin: "40px 0 8px", letterSpacing: "-.04em" }}>Where are you studying?</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>This helps Visora organise the right courses and resources for you.</p>

        {error ? <div className="alert alert-danger" role="alert" style={{ marginBottom: 16 }}>{error}</div> : null}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label className="field"><span className="field-label">University</span><select className="field-select" value={universityId} onChange={(event) => setUniversityId(event.target.value)}><option value="">Select university</option>{universities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field"><span className="field-label">Programme</span><select className="field-select" value={programId} onChange={(event) => setProgramId(event.target.value)} disabled={!universityId}><option value="">Select programme</option>{programs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field"><span className="field-label">Current level</span><select className="field-select" value={academicLevelId} onChange={(event) => setAcademicLevelId(event.target.value)} disabled={!programId}><option value="">Select level</option>{levels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field"><span className="field-label">Matriculation number <span style={{ fontWeight: 500, color: "var(--muted)" }}>(optional)</span></span><input className="field-input" value={matricNumber} onChange={(event) => setMatricNumber(event.target.value)} placeholder="e.g. ENG/OPT/20/001" /></label>
          <label className="field"><span className="field-label">Display name</span><input className="field-input" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder={user?.fullName ?? "Your name"} /></label>
          <label className="field"><span className="field-label">Phone number <span style={{ fontWeight: 500, color: "var(--muted)" }}>(optional)</span></span><input className="field-input" type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+234" /></label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28 }}>
          <button className={`button button-primary${loading ? " button-loading" : ""}`} type="button" disabled={!universityId || !programId || !academicLevelId || loading} onClick={completeSetup}>Complete setup</button>
        </div>
      </section>
    </main>
  );
}
