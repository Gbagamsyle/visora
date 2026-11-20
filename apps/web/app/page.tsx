import Link from "next/link";
import "./page.css";

function Icon({ type }: { type: "book" | "practice" | "ai" | "community" | "arrow" | "check" }) {
  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5z"/></>,
    practice: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 14 3-3 3 2 4-5"/><path d="M7 8h2"/></>,
    ai: <><path d="M12 3 14.2 8.8 20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z"/><path d="M19 3v4M17 5h4"/></>,
    community: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 19c.6-3.4 2.6-5 6-5s5.4 1.6 6 5M15 14c3.2 0 5 1.4 5.5 4"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,

  };

  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

const universities = ["University of Benin", "University of Lagos", "University of Ibadan", "Ahmadu Bello University", "University of Nigeria", "Other universities"];

export default function HomePage() {
  return (
    <>
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          <Link className="landing-wordmark" href="/" aria-label="Visora home">
            <span className="landing-mark">V</span>
            <span>Visora</span>
          </Link>
          <nav className="landing-nav" aria-label="Primary navigation">
            <a href="#platform">Platform</a>
            <a href="#how-it-works">How it works</a>
            <a href="#community">Community</a>
          </nav>
          <div className="landing-actions">
            <Link className="landing-button landing-button-outline" href="/login">Sign in</Link>
            <Link className="landing-button landing-button-primary" href="/register">Register <Icon type="arrow" /></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero" id="platform">
          <div className="landing-hero-decoration decoration-left" aria-hidden="true"><span /><span /><span /></div>
          <div className="landing-hero-decoration decoration-right" aria-hidden="true"><span /><span /><span /></div>
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="hero-kicker"><span /> One academic space. Every study need.</div>
              <h1>Connect, Learn<br />and <span>Grow</span> with Visora</h1>
              <p className="hero-lead">A clearer way to find course resources, prepare for exams and learn alongside students across your university.</p>
              <div className="landing-hero-actions">
                <Link className="landing-button landing-button-primary" href="/register">Start learning <Icon type="arrow" /></Link>
                <a className="landing-button landing-button-outline" href="#platform">Explore Visora</a>
              </div>
              <div className="hero-proof">
                <div className="proof-avatars"><span>IO</span><span>AM</span><span>UE</span></div>
                <p><strong>Built for the academic journey</strong><br />Learning resources · Practice · Community</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section feature-section">
          <div className="landing-container">
            <div className="premium-section-heading">
              <div><span className="section-eyebrow">The Visora platform</span><h2>Everything you need to move forward.</h2></div>
              <p>Organised around real academic needs, Visora brings learning, preparation and student connection into one focused experience.</p>
            </div>

            <div className="feature-mosaic">
              <article className="premium-feature feature-peach">
                <div className="feature-top"><span className="feature-index">01</span><span className="feature-icon"><Icon type="book" /></span></div>
                <div><h3>Learning resources</h3><p>Find course notes, lecture slides and study materials organised by university, level and semester.</p></div>
                <div className="feature-mini-preview resource-preview"><span /><span /><span /></div>
              </article>

              <article className="premium-feature feature-mint">
                <div className="feature-top"><span className="feature-index">02</span><span className="feature-icon"><Icon type="practice" /></span></div>
                <div><h3>Practice & assessments</h3><p>Prepare with past questions, timed tests, theory prompts and clear performance feedback.</p></div>
                <div className="feature-mini-preview practice-preview"><b /><b /><b /></div>
              </article>

              <article className="premium-feature feature-lavender">
                <div className="feature-top"><span className="feature-index">03</span><span className="feature-icon"><Icon type="ai" /></span></div>
                <div><h3>Ask Visora AI</h3><p>Get thoughtful explanations and academic support when a difficult concept needs another perspective.</p></div>
                <div className="feature-mini-preview ai-preview"><span /><span /></div>
              </article>

              <article className="premium-feature feature-yellow">
                <div className="feature-top"><span className="feature-index">04</span><span className="feature-icon"><Icon type="community" /></span></div>
                <div><h3>Student community</h3><p>Ask questions, share useful resources and grow alongside students in your academic community.</p></div>
                <div className="feature-mini-preview community-preview"><span /><span /><span /></div>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-section how-section" id="how-it-works">
          <div className="landing-container">
            <div className="premium-section-heading centred">
              <div><span className="section-eyebrow">How Visora works</span><h2>Three steps from setup to study.</h2></div>
            </div>
            <div className="process-grid">
              {[['01','Create your account','Set up your student profile and academic details.'],['02','Enter your academic space','Choose your university, programme and current level.'],['03','Learn, practice and connect','Access resources, prepare for tests and join discussions.']].map(([number,title,copy]) => (
                <article className="process-card" key={number}><span>{number}</span><div className="process-line"/><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section showcase-section">
          <div className="landing-container showcase-grid">
            <div className="showcase-copy">
              <span className="section-eyebrow">Designed for focused learning</span>
              <h2>Your academic week, finally in context.</h2>
              <p>Move from course discovery to study resources and practice without losing direction.</p>
              <ul>
                <li><Icon type="check" /> Personalised academic context</li>
                <li><Icon type="check" /> Clearly organised course materials</li>
                <li><Icon type="check" /> Practical exam preparation</li>
              </ul>
              <Link className="landing-button landing-button-primary" href="/register">Explore the experience <Icon type="arrow" /></Link>
            </div>

            <div className="product-window">
              <div className="window-bar"><div><i/><i/><i/></div><span>visora.app/home</span></div>
              <div className="product-body">
                <aside><b>V</b><i/><i/><i/><i/><i/></aside>
                <div className="product-content">
                  <div className="product-heading"><div><small>300 Level · First Semester</small><h3>Good morning, Ifeoma</h3></div><div className="product-avatar">IO</div></div>
                  <div className="product-course-row"><article><span>Continue learning</span><h4>Visual Optics</h4><div><i/></div></article><article><span>Practice</span><h4>Clinical Optics</h4><strong>18 questions</strong></article></div>
                  <div className="product-resource"><span>PDF</span><div><b>Accommodation and presbyopia</b><small>Lecture note · OPT 301</small></div><em>View</em></div>
                  <div className="product-resource"><span>PDF</span><div><b>Binocular vision assessment</b><small>Clinical slide · OPT 307</small></div><em>View</em></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section university-section">
          <div className="landing-container">
            <div className="premium-section-heading">
              <div><span className="section-eyebrow">University communities</span><h2>Find your academic circle.</h2></div>
              <p>Designed to grow across Nigerian universities, beginning with a focused Optometry experience.</p>
            </div>
            <div className="university-pills">{universities.map((university,index)=><button className={index===0?'selected':''} key={university}>{university}</button>)}</div>
          </div>
        </section>

        <section className="community-section" id="community">
          <div className="landing-container community-grid">
            <div className="community-copy">
              <span className="section-eyebrow">Learn together</span>
              <h2>Knowledge feels lighter when it is shared.</h2>
              <p>Ask questions, exchange resources and follow conversations that help you understand more.</p>
              <div className="community-actions"><Link className="landing-button landing-button-primary" href="/register">Join Visora <Icon type="arrow" /></Link><Link className="landing-button landing-button-outline" href="/login">Learn more</Link></div>
            </div>
            <div className="community-visual" aria-hidden="true"><div className="community-card card-a"><span>AM</span><p><b>Visual Optics</b><small>Shared a study note</small></p></div><div className="community-card card-b"><span>IO</span><p><b>Clinical Optics</b><small>Started a discussion</small></p></div><div className="community-card card-c"><span>UE</span><p><b>Ocular Anatomy</b><small>Saved a resource</small></p></div><div className="community-spark">✦</div></div>
          </div>
        </section>

        <section className="final-cta">
          <div className="landing-container final-cta-inner">
            <div><span className="section-eyebrow">Start with Visora</span><h2>Make your next study<br />session feel clearer.</h2></div>
            <div><p>Create your academic space and bring everything you need into one place.</p><Link className="landing-button landing-button-light" href="/register">Get started <Icon type="arrow" /></Link></div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div><Link className="landing-wordmark" href="/"><span className="landing-mark">V</span><span>Visora</span></Link><p>Learning, preparation and community for university students.</p></div>
          <nav aria-label="Footer navigation"><Link href="#platform">Platform</Link><Link href="#how-it-works">How it works</Link><Link href="#community">Community</Link><Link href="/login">Sign in</Link></nav>
          <div className="footer-meta"><span>© 2026 Visora</span><a href="#">Privacy</a><a href="#">Terms</a></div>
        </div>
      </footer>
    </>
  );
}
