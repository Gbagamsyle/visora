"use client";

import { useUser } from "@clerk/nextjs";
import { Award, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Edit3, GraduationCap, Heart, Mail, MapPin, MessageCircle, Settings, ShieldCheck, Target } from "lucide-react";
import AppShell from "../../components/AppShell";

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const name = user?.fullName || user?.firstName || "Ifeoma Okafor";
  const email = user?.primaryEmailAddress?.emailAddress || "ifeoma.okafor@students.uniben.edu";
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "IO";

  const stats = [
    ["Materials viewed", "42", BookOpen, "+8 this month"],
    ["Practice questions", "186", CheckCircle2, "78% accuracy"],
    ["Tests completed", "12", Award, "4 this semester"],
    ["Community posts", "8", MessageCircle, "3 helpful replies"],
  ] as const;

  return (
    <AppShell active="Profile">
      <section className="profile-hero-new">
        <div className="profile-cover-art" aria-hidden="true"><i /><i /><i /></div>
        <div className="profile-hero-main">
          <span className="profile-avatar-new">{isLoaded && isSignedIn ? initials : "IO"}</span>
          <div className="profile-name-block">
            <span className="profile-status"><i /> Active student</span>
            <h1>{isLoaded && isSignedIn ? name : "Ifeoma Okafor"}</h1>
            <p><GraduationCap size={15} /> Doctor of Optometry <span /> 300 Level</p>
          </div>
          <button className="button button-secondary profile-edit" type="button"><Edit3 size={15} /> Edit profile</button>
        </div>
        <div className="profile-meta-row">
          <span><Mail size={14} /> {email}</span>
          <span><MapPin size={14} /> University of Benin</span>
          <span><CalendarDays size={14} /> Student since 2024</span>
        </div>
      </section>

      <section className="profile-stat-grid" aria-label="Learning statistics">
        {stats.map(([label, value, Icon, detail]) => (
          <article key={label}>
            <span className="profile-stat-icon"><Icon size={18} /></span>
            <div><strong>{value}</strong><p>{label}</p><small>{detail}</small></div>
          </article>
        ))}
      </section>

      <div className="profile-content-grid">
        <main className="profile-main-column">
          <section className="profile-section-card">
            <div className="profile-section-heading"><div><p className="premium-eyebrow">SEMESTER OVERVIEW</p><h2>Learning progress</h2></div><button type="button">View activity <ChevronRight size={15} /></button></div>
            <div className="profile-progress-feature">
              <div className="profile-progress-ring"><span>72<small>%</small></span></div>
              <div className="profile-progress-copy"><div><strong>On track for the semester</strong><span>72% complete</span></div><div className="profile-progress-track"><i /></div><p>Complete 3 more study sessions this week to stay ahead of your plan.</p></div>
            </div>
            <div className="profile-course-progress">
              {[["Visual Optics","84%"],["Clinical Optics","68%"],["Anatomy","61%"]].map(([course, progress]) => (
                <article key={course}><div><strong>{course}</strong><span>{progress}</span></div><div className="profile-course-track"><i style={{ width: progress }} /></div></article>
              ))}
            </div>
          </section>

          <section className="profile-section-card">
            <div className="profile-section-heading"><div><p className="premium-eyebrow">UP NEXT</p><h2>Study goals</h2></div><button type="button"><Target size={14} /> Manage goals</button></div>
            <div className="profile-goal-list">
              { [
                { title: "Complete Visual Optics revision", detail: "12 of 16 topics", progress: "75%" },
                { title: "Attempt 50 practice questions", detail: "186 of 250 questions", progress: "74%" },
                { title: "Review Clinical Optics notes", detail: "6 of 10 resources", progress: "60%" },
              ].map((goal) => (
                <article key={goal.title}><span className="profile-goal-check"><CheckCircle2 size={16} /></span><div><strong>{goal.title}</strong><p>{goal.detail}</p></div><div className="profile-goal-progress"><strong>{goal.progress}</strong><div><i style={{ width: goal.progress }} /></div></div></article>
              ))}
            </div>
          </section>
        </main>

        <aside className="profile-side-column">
          <section className="profile-section-card profile-academic-card">
            <div className="profile-card-icon"><GraduationCap size={19} /></div>
            <p className="premium-eyebrow">ACADEMIC PROFILE</p>
            <h2>University of Benin</h2>
            <p>Doctor of Optometry</p>
            <div className="profile-academic-details"><span><small>Level</small><strong>300 Level</strong></span><span><small>Semester</small><strong>First</strong></span></div>
          </section>

          <section className="profile-section-card">
            <div className="profile-section-heading compact"><div><p className="premium-eyebrow">PERSONALISE</p><h2>Learning interests</h2></div><Heart size={16} /></div>
            <div className="profile-interest-tags">{["Visual Optics","Clinical Optics","Anatomy","Binocular Vision","Refraction"].map((interest) => <span key={interest}>{interest}</span>)}</div>
          </section>

          <section className="profile-section-card profile-security-card">
            <div className="profile-card-icon muted"><ShieldCheck size={18} /></div>
            <div><strong>Account & security</strong><p>Manage sign-in and privacy</p></div>
            <ChevronRight size={16} />
          </section>

          <button className="profile-settings-button" type="button"><span><Settings size={17} /></span><strong>Profile settings</strong><ChevronRight size={16} /></button>
        </aside>
      </div>
    </AppShell>
  );
}
