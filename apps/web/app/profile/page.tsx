import { ArrowUpRight, Award, BookOpen, CheckCircle2, Edit3, GraduationCap, Heart, MessageCircle } from "lucide-react";
import AppShell from "../../components/AppShell";

export default function ProfilePage() {
  const stats = [["Materials viewed", "42", BookOpen],["Practice questions", "186", CheckCircle2],["Tests completed", "12", Award],["Posts shared", "8", MessageCircle]] as const;

  return (
    <AppShell active="Profile">
      <section className="profile-hero">
        <span className="profile-avatar">IO</span>
        <div className="profile-identity"><p className="premium-eyebrow">STUDENT PROFILE</p><h1>Ifeoma Okafor</h1><p><GraduationCap size={15} /> Optometry <i /> 300 Level</p></div>
        <button className="button button-secondary" type="button"><Edit3 size={15} /> Edit profile</button>
      </section>

      <section className="profile-stats">
        {stats.map(([label, value, Icon]) => <article key={label}><span><Icon size={17} /></span><div><strong>{value}</strong><p>{label}</p></div></article>)}
      </section>

      <div className="profile-layout">
        <section className="profile-panel"><div className="premium-section-heading"><div><p className="premium-eyebrow">RECENT JOURNEY</p><h2>Learning activity</h2></div><button type="button">View all <ArrowUpRight size={14} /></button></div><div className="profile-progress-card"><div><span>Semester progress</span><strong>72%</strong></div><div className="profile-progress-track"><i /></div><p>Keep up the steady momentum across your courses.</p></div></section>

        <aside className="profile-aside">
          <section className="profile-panel"><p className="premium-eyebrow">ACADEMIC DETAILS</p><h2>University of Benin</h2><p className="profile-detail-copy">Doctor of Optometry<br />300 Level · First Semester</p></section>
          <section className="profile-panel"><div className="profile-interests-heading"><span><Heart size={16} /></span><h2>Learning interests</h2></div><div className="profile-tags">{["Visual Optics","Clinical Optics","Anatomy","Binocular Vision"].map((item) => <span key={item}>{item}</span>)}</div></section>
        </aside>
      </div>
    </AppShell>
  );
}
