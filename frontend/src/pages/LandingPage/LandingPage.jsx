import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, FileText, Search, Pin, Share2, Tags, Download, Check, Plus, Mic, ListChecks, Moon, UserRound, ShieldCheck, Printer } from 'lucide-react';
import './LandingPage.css';

const featureGroups = [
  {
    title: 'Capture & create',
    description: 'From a spoken thought to a polished note.',
    items: [
      { icon: FileText, title: 'Rich-text notes', text: 'Create, read, edit, and delete notes. Format with bold, italic, strikethrough, headings, bullet and numbered lists, quotes, and dividers. Undo and redo as you write.' },
      { icon: Mic, title: 'Voice-to-text', text: 'Speak your note title or dictate the content using the microphone controls. English voice input is available in supported browsers with microphone permission.' },
      { icon: ListChecks, title: 'Ideas, notes, and tasks', text: 'Choose General, Idea, or Task for each note. Track tasks with Todo, Doing, and Done statuses as your plans move forward.' },
    ],
  },
  {
    title: 'Organize & find',
    description: 'Keep useful thoughts within easy reach.',
    items: [
      { icon: Search, title: 'Search and sort', text: 'Search your notes, sort newest or oldest first, or browse by title from A–Z or Z–A.' },
      { icon: Tags, title: 'Filter by category', text: 'Switch between All, General, Ideas, Tasks, and Pinned views to narrow down your dashboard.' },
      { icon: Pin, title: 'Pin your priorities', text: 'Pin important notes for easy access, then unpin them whenever your priorities change.' },
    ],
  },
  {
    title: 'Share & take control',
    description: 'Send an idea to a friend or keep a copy for yourself.',
    items: [
      { icon: Share2, title: 'Public links for friends', text: 'Make a note public, copy its link, and send it to friends. They can read it without an account. Disable public sharing whenever you want to stop access.' },
      { icon: Printer, title: 'Read, share, and print', text: 'Public notes show formatted content, reading time, and word count. Copy the link, share through WhatsApp, X/Twitter, or LinkedIn, or print the note.' },
      { icon: Download, title: 'JSON import and export', text: 'Export your notes as a JSON file or import notes from JSON. Duplicate notes are skipped during import.' },
    ],
  },
];

const workspaceFeatures = [
  { icon: Moon, title: 'Light and dark themes', text: 'Switch the dashboard and shared-note reader between light and dark appearances.' },
  { icon: UserRound, title: 'Your profile, your details', text: 'Update your name, upload or replace a profile photo, or remove it to use your initials.' },
  { icon: ShieldCheck, title: 'Account controls', text: 'Verify your email with a code, change your password, recover a forgotten password, or delete your account from profile settings.' },
];

const steps = [
  ['Create your account', 'Sign up with your details, then verify your email using the code sent to your inbox.'],
  ['Make yourself at home', 'Log in to open your personal dashboard and access your notes.'],
  ['Capture, organize, repeat', 'Create your first note. Type or dictate your first note, choose a category, track a task, or make a note public to share with friends.'],
];

function Brand() {
  return <Link className="landing-brand" to="/" aria-label="Notes home"><span className="landing-logo"><FileText size={21} aria-hidden="true" /></span>Notes<span className="landing-brand-dot">.</span></Link>;
}

function SignupLink() {
  return <Link className="landing-button landing-button-primary" to="/signup">Get Started <ArrowRight size={17} aria-hidden="true" /></Link>;
}

function NotesPreview() {
  return (
    <figure className="landing-preview" aria-label="Illustrative preview of organized notes">
      <div className="landing-preview-bar"><span><FileText size={17} aria-hidden="true" /> Your notes, together</span><span className="landing-preview-label">EXAMPLE WORKSPACE</span></div>
      <div className="landing-preview-body">
        <div className="landing-preview-heading"><div><p className="landing-eyebrow">A LITTLE CLARITY, EVERY DAY</p><h2>My notes</h2></div><span className="landing-preview-add" aria-hidden="true"><Plus size={19} /></span></div>
        <div className="landing-preview-search"><Search size={16} aria-hidden="true" /> Search your next great idea…</div>
        <div className="landing-example-note"><span className="landing-note-tag">General</span><Pin size={15} className="landing-pin" aria-hidden="true" /><h3>A little space to think</h3><p>Less scattered thoughts. More room for the things that matter.</p><div className="landing-check"><Check size={15} aria-hidden="true" /> Capture that new idea</div><div className="landing-check"><Check size={15} aria-hidden="true" /> Make a plan for the week</div></div>
        <div className="landing-preview-pair"><article><span className="landing-note-tag">Idea</span><h3>The next big thing</h3><p>It starts with a small note.</p></article><article><span className="landing-note-tag">Task · Todo</span><h3>Monday, made simple</h3><p>A clear head. A fresh start.</p></article></div>
      </div>
      <figcaption>Example notes. Your workspace starts with your ideas.</figcaption>
    </figure>
  );
}

export default function LandingPage() {
  const token = useSelector((state) => state.auth.token);
  const pageRef = useRef(null);

  useEffect(() => {
    if (token || !pageRef.current || !('IntersectionObserver' in window) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('landing-reveal-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    pageRef.current.querySelectorAll('[data-reveal]').forEach((section) => {
      section.classList.add('landing-reveal-pending');
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [token]);

  // Let the existing dashboard ProtectedRoute restore profiles and enforce verification.
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-page" ref={pageRef}>
      <a className="landing-skip" href="#landing-main">Skip to content</a>
      <header className="landing-header"><div className="landing-container landing-nav"><Brand /><nav aria-label="Main navigation"><a className="landing-section-link" href="#features">Features</a><a className="landing-section-link" href="#how-it-works">How it works</a><Link className="landing-login" to="/login">Login</Link><Link className="landing-button landing-button-primary" to="/signup">Sign Up <ArrowRight size={16} aria-hidden="true" /></Link></nav></div></header>
      <main id="landing-main">
        <section className="landing-container landing-hero" aria-labelledby="hero-title">
          <div><p className="landing-eyebrow"><span className="landing-status-dot" /> YOUR IDEAS DESERVE A HOME</p><h1 id="hero-title">A clear space.<br />A brighter <span>idea.</span></h1><p className="landing-hero-description">Type it. Speak it. Keep it organized. Capture rich-text notes, track your tasks, and share public notes with friends—all from your personal workspace.</p><div className="landing-actions"><SignupLink /><a className="landing-text-link" href="#how-it-works">See how it works <ArrowRight size={16} aria-hidden="true" /></a></div><p className="landing-hero-footnote"><Check size={16} aria-hidden="true" /> Write it down. Find your focus. Keep going.</p></div>
          <NotesPreview />
        </section>
        <section id="features" className="landing-container landing-section" aria-labelledby="features-title">
          <p className="landing-eyebrow">YOUR NOTES, FROM START TO SHARE</p>
          <div className="landing-section-heading"><h2 id="features-title">One workspace.<br />More ways to make it yours.</h2><p>Capture ideas, organize everyday work, and share what matters with the tools already built into Notes.</p></div>
          {featureGroups.map((group) => <section className="landing-feature-group" key={group.title} aria-label={group.title} data-reveal>
            <div className="landing-group-heading"><h3>{group.title}</h3><p>{group.description}</p></div>
            <div className="landing-features">{group.items.map(({ icon: Icon, title, text }) => <article className="landing-feature" key={title}><span className="landing-feature-icon"><Icon size={22} aria-hidden="true" /></span><h4>{title}</h4><p>{text}</p></article>)}</div>
          </section>)}
        </section>
        <section className="landing-container landing-section landing-highlights" aria-label="Voice input and sharing explained">
          <article className="landing-highlight" data-reveal><span className="landing-feature-icon"><Mic size={25} aria-hidden="true" /></span><p className="landing-eyebrow">SAY IT BEFORE IT SLIPS AWAY</p><h2>Turn your voice into a note.</h2><p>Open a new note or edit an existing one. Use the microphone beside the title to speak a heading, or the microphone in the editor to dictate your content. Stop listening, review your words, and save.</p><p className="landing-detail-note">Voice input uses English (US) speech recognition and requires a supported browser and microphone access.</p></article>
          <article className="landing-highlight" data-reveal><span className="landing-feature-icon"><Share2 size={25} aria-hidden="true" /></span><p className="landing-eyebrow">GOOD IDEAS ARE WORTH SHARING</p><h2>A note for you. A link for your friends.</h2><ol className="landing-sharing-steps"><li>Enable public sharing on your note.</li><li>Copy the share link and send it to a friend.</li><li>They open the link and read—no login needed.</li></ol><p className="landing-detail-note">Anyone with the public link can read the note. Friends get a reading page; editing stays in your dashboard. Disable public sharing to stop access through the link.</p></article>
        </section>
        <section className="landing-process landing-section" aria-labelledby="workspace-title"><div className="landing-container" data-reveal><p className="landing-eyebrow">FEEL AT HOME</p><h2 id="workspace-title">A workspace with your preferences.</h2><div className="landing-features">{workspaceFeatures.map(({ icon: Icon, title, text }) => <article className="landing-feature" key={title}><span className="landing-feature-icon"><Icon size={22} aria-hidden="true" /></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
        <section id="how-it-works" className="landing-process landing-section" aria-labelledby="process-title"><div className="landing-container" data-reveal><p className="landing-eyebrow">FROM THOUGHT TO NOTE</p><h2 id="process-title">Your next idea is three steps away.</h2><ol className="landing-steps">{steps.map(([title, text], index) => <li key={title}><span className="landing-step-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>
        <section className="landing-container landing-section" data-reveal aria-labelledby="cta-title"><div className="landing-cta"><div><p className="landing-eyebrow">MAKE ROOM FOR WHAT’S NEXT</p><h2 id="cta-title">Good ideas start with a note.</h2><p>Give yours a place to land.</p></div><div><SignupLink /><p className="landing-existing">Already have an account? <Link to="/login">Login</Link></p></div></div></section>
      </main>
      <footer className="landing-container landing-footer"><Brand /><p>A little more organized. A little more inspired.</p><nav aria-label="Footer navigation"><Link to="/login">Login</Link><Link to="/signup">Sign Up</Link></nav></footer>
    </div>
  );
}
