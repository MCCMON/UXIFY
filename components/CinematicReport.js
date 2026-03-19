import { useEffect, useRef, useState } from 'react'

const reportStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .rpt { background:#0a0203; color:#f5f0f0; font-family:'DM Sans',sans-serif; overflow-x:hidden; }

  /* CINEMATIC INTRO */
  .rpt-intro {
    position:fixed; inset:0; z-index:1000; background:#0a0203;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    pointer-events:none;
  }
  .rpt-intro.done { opacity:0; transition:opacity 0.8s ease 0.3s; pointer-events:none; }
  .rpt-intro-line {
    width:0%; height:1px; background:linear-gradient(90deg,transparent,#6E1E2A,#c0303f,transparent);
    animation:lineExpand 1s ease forwards 0.2s;
  }
  @keyframes lineExpand { to { width:60%; } }
  .rpt-intro-label {
    font-family:'Syne',sans-serif; font-size:11px; letter-spacing:6px; color:#6E1E2A;
    text-transform:uppercase; margin:20px 0; opacity:0;
    animation:fadeIn 0.6s ease forwards 0.6s;
  }
  .rpt-intro-score {
    font-family:'Syne',sans-serif; font-size:clamp(100px,18vw,200px); font-weight:800;
    line-height:1; letter-spacing:-8px; opacity:0;
    background:linear-gradient(135deg,#c0303f,#f5f0f0,#6E1E2A);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    animation:scoreReveal 0.8s cubic-bezier(0.16,1,0.3,1) forwards 0.9s;
  }
  @keyframes scoreReveal {
    from { opacity:0; transform:scale(0.6) translateY(40px); filter:blur(20px); }
    to   { opacity:1; transform:scale(1) translateY(0); filter:blur(0); }
  }
  .rpt-intro-sub {
    font-size:16px; color:#8a8a8a; letter-spacing:2px; opacity:0;
    animation:fadeIn 0.6s ease forwards 1.4s;
  }
  @keyframes fadeIn { to { opacity:1; } }

  /* MAIN CONTENT */
  .rpt-content { opacity:0; animation:fadeIn 0.8s ease forwards 2.4s; }

  /* HEADER */
  .rpt-header {
    position:sticky; top:0; z-index:100; padding:16px 48px;
    background:rgba(10,2,3,0.9); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(110,30,42,0.2);
    display:flex; align-items:center; justify-content:space-between;
  }
  .rpt-header-logo { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; }
  .rpt-header-logo span { color:#6E1E2A; }
  .rpt-header-score { display:flex; align-items:center; gap:12px; }
  .rpt-header-num { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#c0303f; }
  .rpt-header-label { font-size:12px; color:#8a8a8a; letter-spacing:1px; text-transform:uppercase; }
  .rpt-new-btn { background:rgba(110,30,42,0.15); border:1px solid rgba(110,30,42,0.3); color:#c0303f; padding:9px 20px; border-radius:8px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .rpt-new-btn:hover { background:rgba(110,30,42,0.3); }

  /* HERO SCORE */
  .rpt-hero {
    min-height:100vh; display:flex; flex-direction:column; align-items:center;
    justify-content:center; text-align:center; padding:120px 32px 80px;
    position:relative; overflow:hidden;
  }
  .rpt-hero-bg {
    position:absolute; inset:0; pointer-events:none;
    background:radial-gradient(ellipse 80% 60% at 50% 40%, rgba(110,30,42,0.15) 0%, transparent 70%);
  }
  .rpt-hero-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image:linear-gradient(rgba(110,30,42,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(110,30,42,0.04) 1px,transparent 1px);
    background-size:60px 60px;
  }
  .rpt-verdict {
    font-size:11px; letter-spacing:6px; color:#6E1E2A; text-transform:uppercase;
    margin-bottom:24px; position:relative; z-index:1;
  }
  .rpt-big-score {
    font-family:'Syne',sans-serif; font-size:clamp(80px,15vw,160px); font-weight:800;
    line-height:1; letter-spacing:-6px; position:relative; z-index:1;
    background:linear-gradient(135deg,#ffffff 0%,#c0303f 50%,#6E1E2A 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .rpt-big-score-sub { font-size:14px; color:#8a8a8a; letter-spacing:3px; text-transform:uppercase; margin-top:8px; position:relative; z-index:1; }
  .rpt-summary-hero {
    max-width:580px; font-size:18px; color:#B5B7B9; line-height:1.7; margin-top:32px;
    position:relative; z-index:1; font-weight:300;
  }
  .rpt-scroll-hint { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; color:#8a8a8a; font-size:11px; letter-spacing:3px; text-transform:uppercase; animation:bounce 2s ease infinite; }
  .rpt-scroll-arrow { width:1px; height:40px; background:linear-gradient(180deg,transparent,#6E1E2A); }
  @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }

  /* SCORE STRIP */
  .rpt-score-strip { padding:0 48px; max-width:1100px; margin:0 auto 0; }
  .rpt-scores-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:rgba(110,30,42,0.2); border:1px solid rgba(110,30,42,0.2); border-radius:20px; overflow:hidden; }
  .rpt-score-cell { background:#0a0203; padding:40px 32px; text-align:center; position:relative; overflow:hidden; transition:background 0.3s; }
  .rpt-score-cell:hover { background:#180a0c; }
  .rpt-score-cell::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#6E1E2A,transparent); transform:scaleX(0); transition:transform 0.4s ease; }
  .rpt-score-cell:hover::after { transform:scaleX(1); }
  .rpt-score-cell-num { font-family:'Syne',sans-serif; font-size:56px; font-weight:800; letter-spacing:-3px; line-height:1; }
  .rpt-score-cell-lbl { font-size:11px; color:#8a8a8a; text-transform:uppercase; letter-spacing:2px; margin-top:8px; }
  .rpt-score-cell-bar { height:2px; background:rgba(181,183,185,0.08); border-radius:100px; margin-top:16px; overflow:hidden; }
  .rpt-score-cell-fill { height:100%; border-radius:100px; background:linear-gradient(90deg,#6E1E2A,#c0303f); transition:width 1.5s cubic-bezier(.4,0,.2,1); }

  /* SECTION */
  .rpt-section { padding:100px 48px; max-width:1100px; margin:0 auto; }
  .rpt-section-num { font-size:11px; letter-spacing:4px; color:rgba(192,48,63,0.8); text-transform:uppercase; margin-bottom:8px; }
  .rpt-section-title { font-family:'Syne',sans-serif; font-size:clamp(32px,4vw,56px); font-weight:800; letter-spacing:-2px; line-height:1.05; margin-bottom:48px; }
  .rpt-section-title span { color:#6E1E2A; }

  /* ISSUE CARDS */
  .rpt-issues { display:flex; flex-direction:column; gap:0; }
  .rpt-issue {
    display:flex; align-items:flex-start; gap:24px; padding:28px 0;
    border-bottom:1px solid rgba(181,183,185,0.06);
    opacity:0; transform:translateY(30px);
    transition:opacity 0.6s ease, transform 0.6s ease;
  }
  .rpt-issue.visible { opacity:1; transform:translateY(0); }
  .rpt-issue-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; margin-top:2px; }
  .rpt-issue-icon.red { background:rgba(248,113,113,0.12); border:1px solid rgba(248,113,113,0.2); }
  .rpt-issue-icon.yellow { background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.2); }
  .rpt-issue-icon.green { background:rgba(74,222,128,0.12); border:1px solid rgba(74,222,128,0.2); }
  .rpt-issue-body { flex:1; }
  .rpt-issue-tag { font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; }
  .rpt-issue-tag.red { color:#f87171; }
  .rpt-issue-tag.yellow { color:#fbbf24; }
  .rpt-issue-tag.green { color:#4ade80; }
  .rpt-issue-text { font-size:16px; color:#B5B7B9; line-height:1.6; }

  /* QUICK WINS */
  .rpt-wins { display:flex; flex-direction:column; gap:20px; }
  .rpt-win {
    display:flex; align-items:center; gap:24px;
    opacity:0; transform:translateX(-40px);
    transition:opacity 0.7s ease, transform 0.7s ease;
  }
  .rpt-win.visible { opacity:1; transform:translateX(0); }
  .rpt-win-label { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; width:180px; flex-shrink:0; }
  .rpt-win-track { flex:1; height:6px; background:rgba(181,183,185,0.08); border-radius:100px; overflow:hidden; }
  .rpt-win-fill { height:100%; border-radius:100px; background:linear-gradient(90deg,#6E1E2A,#c0303f); transition:width 1.4s cubic-bezier(.4,0,.2,1); }
  .rpt-win-num { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#c0303f; width:48px; text-align:right; }

  /* IMPROVEMENTS */
  .rpt-improvements { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
  .rpt-improvement {
    background:#180a0c; border:1px solid rgba(181,183,185,0.08);
    border-radius:16px; padding:28px; position:relative; overflow:hidden;
    opacity:0; transform:translateY(40px) scale(0.95);
    transition:opacity 0.6s ease, transform 0.6s ease;
  }
  .rpt-improvement.visible { opacity:1; transform:translateY(0) scale(1); }
  .rpt-improvement:hover { border-color:rgba(110,30,42,0.3); transform:translateY(-4px) scale(1) !important; }
  .rpt-improvement-priority { font-size:10px; font-weight:700; letter-spacing:3px; text-transform:uppercase; margin-bottom:14px; }
  .rpt-improvement-priority.high { color:#f87171; }
  .rpt-improvement-priority.medium { color:#fbbf24; }
  .rpt-improvement-priority.low { color:#4ade80; }
  .rpt-improvement-text { font-size:15px; color:#B5B7B9; line-height:1.6; }
  .rpt-improvement::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; }
  .rpt-improvement.high-card::before { background:linear-gradient(90deg,#f87171,transparent); }
  .rpt-improvement.medium-card::before { background:linear-gradient(90deg,#fbbf24,transparent); }
  .rpt-improvement.low-card::before { background:linear-gradient(90deg,#4ade80,transparent); }

  /* PALETTE */
  .rpt-palette { display:flex; gap:16px; flex-wrap:wrap; }
  .rpt-color {
    display:flex; flex-direction:column; align-items:center; gap:10px;
    opacity:0; transform:scale(0.7);
    transition:opacity 0.5s ease, transform 0.5s ease;
  }
  .rpt-color.visible { opacity:1; transform:scale(1); }
  .rpt-color-swatch { width:64px; height:64px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); box-shadow:0 8px 24px rgba(0,0,0,0.4); transition:transform 0.2s; }
  .rpt-color-swatch:hover { transform:scale(1.1) translateY(-4px); }
  .rpt-color-hex { font-size:11px; color:#8a8a8a; font-family:monospace; }
  .rpt-color-role { font-size:11px; color:#5a5a5a; }

  /* DIVIDERS */
  .rpt-div { height:1px; background:linear-gradient(90deg,transparent,rgba(110,30,42,0.3),transparent); margin:0 48px; }

  /* FINAL CTA */
  .rpt-final { padding:120px 48px; text-align:center; position:relative; overflow:hidden; }
  .rpt-final::before { content:''; position:absolute; width:800px; height:800px; background:radial-gradient(circle,rgba(110,30,42,0.12) 0%,transparent 70%); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; }
  .rpt-final-title { font-family:'Syne',sans-serif; font-size:clamp(36px,5vw,64px); font-weight:800; letter-spacing:-2px; line-height:1.05; margin-bottom:16px; position:relative; z-index:1; }
  .rpt-final-sub { font-size:16px; color:#8a8a8a; margin-bottom:36px; position:relative; z-index:1; }
  .rpt-final-btn { background:#6E1E2A; color:#fff; border:none; padding:16px 40px; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; font-family:'Syne',sans-serif; transition:all 0.3s; position:relative; z-index:1; }
  .rpt-final-btn:hover { background:#8a2535; transform:translateY(-2px); box-shadow:0 16px 40px rgba(110,30,42,0.4); }

  /* SCROLL ANIMATIONS */
  .rpt-scroll-reveal { opacity:0; transform:translateY(50px); transition:opacity 0.8s ease, transform 0.8s ease; }
  .rpt-scroll-reveal.visible { opacity:1; transform:translateY(0); }

  /* SCORE COLOR */
  .score-great { background:linear-gradient(135deg,#4ade80,#22d3ee); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .score-good { background:linear-gradient(135deg,#fbbf24,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .score-bad { background:linear-gradient(135deg,#f87171,#c0303f); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  @media (max-width:768px) {
    .rpt-header { padding:14px 20px; }
    .rpt-section { padding:60px 20px; }
    .rpt-scores-row { grid-template-columns:repeat(2,1fr); }
    .rpt-improvements { grid-template-columns:1fr; }
    .rpt-score-strip { padding:0 20px; }
    .rpt-div { margin:0 20px; }
    .rpt-final { padding:80px 20px; }
    .rpt-win-label { width:120px; font-size:13px; }
  }
`

function useScrollReveal(ref, delay = 0) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVisible(true), delay); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])
  return visible
}

function ScoreCell({ label, value, delay }) {
  const ref = useRef(null)
  const visible = useScrollReveal(ref, delay)
  const color = value >= 75 ? 'score-great' : value >= 55 ? 'score-good' : 'score-bad'
  return (
    <div className="rpt-score-cell" ref={ref}>
      <div className={`rpt-score-cell-num ${color}`}>{value}</div>
      <div className="rpt-score-cell-lbl">{label}</div>
      <div className="rpt-score-cell-bar">
        <div className="rpt-score-cell-fill" style={{ width: visible ? `${value}%` : '0%', transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  )
}

function IssueItem({ item, delay }) {
  const ref = useRef(null)
  const visible = useScrollReveal(ref, delay)
  const color = item.severity === 'error' ? 'red' : item.severity === 'warning' ? 'yellow' : 'green'
  const icon = item.severity === 'error' ? '✕' : item.severity === 'warning' ? '⚠' : '✓'
  const tag = item.severity === 'error' ? 'Critical' : item.severity === 'warning' ? 'Warning' : 'Strength'
  return (
    <div ref={ref} className={`rpt-issue ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className={`rpt-issue-icon ${color}`}>{icon}</div>
      <div className="rpt-issue-body">
        <div className={`rpt-issue-tag ${color}`}>{tag}</div>
        <div className="rpt-issue-text">{item.text}</div>
      </div>
    </div>
  )
}

function WinBar({ item, delay }) {
  const ref = useRef(null)
  const visible = useScrollReveal(ref, delay)
  return (
    <div ref={ref} className={`rpt-win ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="rpt-win-label">{item.label}</div>
      <div className="rpt-win-track">
        <div className="rpt-win-fill" style={{ width: visible ? `${item.score}%` : '0%', transitionDelay: `${delay + 200}ms` }} />
      </div>
      <div className="rpt-win-num">{item.score}</div>
    </div>
  )
}

function ImprovementCard({ item, delay }) {
  const ref = useRef(null)
  const visible = useScrollReveal(ref, delay)
  return (
    <div ref={ref} className={`rpt-improvement ${item.priority}-card ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className={`rpt-improvement-priority ${item.priority}`}>{item.priority} priority</div>
      <div className="rpt-improvement-text">{item.text}</div>
    </div>
  )
}

function ColorChip({ c, delay }) {
  const ref = useRef(null)
  const visible = useScrollReveal(ref, delay)
  return (
    <div ref={ref} className={`rpt-color ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className="rpt-color-swatch" style={{ background: c.hex }} />
      <span className="rpt-color-hex">{c.hex}</span>
      <span className="rpt-color-role">{c.role}</span>
    </div>
  )
}

function SectionTitle({ num, title, highlight }) {
  const ref = useRef(null)
  const visible = useScrollReveal(ref)
  return (
    <div ref={ref} className={`rpt-scroll-reveal ${visible ? 'visible' : ''}`}>
      <div className="rpt-section-num">{num}</div>
      <h2 className="rpt-section-title">{title}{highlight && <><br /><span>{highlight}</span></>}</h2>
    </div>
  )
}

export default function CinematicReport({ result, onReset }) {
  const [introDone, setIntroDone] = useState(false)
  const overall = result?.scores?.overall ?? 0
  const scoreColor = overall >= 75 ? 'score-great' : overall >= 55 ? 'score-good' : 'score-bad'
  const verdict = overall >= 75 ? 'Strong Converter' : overall >= 55 ? 'Needs Work' : 'Leaking Money'

  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 2200)
    return () => clearTimeout(t)
  }, [])

  const allIssues = (section) => result?.[section] || []

  return (
    <>
      <style>{reportStyles}</style>

      {/* CINEMATIC INTRO */}
      <div className={`rpt-intro ${introDone ? 'done' : ''}`}>
        <div className="rpt-intro-line" />
        <div className="rpt-intro-label">Conversion Analysis Complete</div>
        <div className="rpt-intro-score">{overall}</div>
        <div className="rpt-intro-sub">out of 100</div>
      </div>

      {/* MAIN */}
      <div className="rpt rpt-content">

        {/* STICKY HEADER */}
        <div className="rpt-header">
          <div className="rpt-header-logo">UX<span>IFY</span></div>
          <div className="rpt-header-score">
            <div className={`rpt-header-num ${scoreColor}`}>{overall}</div>
            <div className="rpt-header-label">/ 100</div>
          </div>
          <button className="rpt-new-btn" onClick={onReset}>← New Analysis</button>
        </div>

        {/* HERO */}
        <div className="rpt-hero">
          <div className="rpt-hero-bg" />
          <div className="rpt-hero-grid" />
          <div className="rpt-verdict">{verdict}</div>
          <div className={`rpt-big-score ${scoreColor}`}>{overall}</div>
          <div className="rpt-big-score-sub">Conversion Score</div>
          {result?.summary && <p className="rpt-summary-hero">{result.summary}</p>}
          <div className="rpt-scroll-hint">
            <span>Scroll to explore</span>
            <div className="rpt-scroll-arrow" />
          </div>
        </div>

        {/* SCORE BREAKDOWN */}
        <div className="rpt-score-strip">
          <div className="rpt-scores-row">
            <ScoreCell label="Headline" value={result?.scores?.headline ?? 0} delay={0} />
            <ScoreCell label="CTA" value={result?.scores?.cta ?? 0} delay={100} />
            <ScoreCell label="Trust" value={result?.scores?.trust ?? 0} delay={200} />
            <ScoreCell label="Clarity" value={result?.scores?.clarity ?? 0} delay={300} />
          </div>
        </div>

        <div className="rpt-div" style={{ margin: '80px 48px' }} />

        {/* FIRST IMPRESSION */}
        <div className="rpt-section">
          <SectionTitle num="01 — First Impression" title="What visitors see" highlight="in 5 seconds." />
          <div className="rpt-issues">
            {allIssues('firstimpression').map((item, i) => <IssueItem key={i} item={item} delay={i * 100} />)}
          </div>
        </div>

        <div className="rpt-div" />

        {/* CTA */}
        <div className="rpt-section">
          <SectionTitle num="02 — Call to Action" title="Is your CTA" highlight="converting?" />
          <div className="rpt-issues">
            {allIssues('cta_analysis').map((item, i) => <IssueItem key={i} item={item} delay={i * 100} />)}
          </div>
        </div>

        <div className="rpt-div" />

        {/* TRUST */}
        <div className="rpt-section">
          <SectionTitle num="03 — Trust Signals" title="Do visitors" highlight="trust you?" />
          <div className="rpt-issues">
            {allIssues('trust_signals').map((item, i) => <IssueItem key={i} item={item} delay={i * 100} />)}
          </div>
        </div>

        <div className="rpt-div" />

        {/* COPY */}
        <div className="rpt-section">
          <SectionTitle num="04 — Copy Analysis" title="Is your copy" highlight="doing the work?" />
          <div className="rpt-issues">
            {allIssues('copy_analysis').map((item, i) => <IssueItem key={i} item={item} delay={i * 100} />)}
          </div>
        </div>

        <div className="rpt-div" />

        {/* QUICK WINS */}
        <div className="rpt-section">
          <SectionTitle num="05 — Quick Wins" title="Your scores" highlight="at a glance." />
          <div className="rpt-wins">
            {(result?.quick_wins || []).map((item, i) => <WinBar key={i} item={item} delay={i * 120} />)}
          </div>
        </div>

        <div className="rpt-div" />

        {/* IMPROVEMENTS */}
        <div className="rpt-section">
          <SectionTitle num="06 — Action Plan" title="Fix these" highlight="right now." />
          <div className="rpt-improvements">
            {(result?.improvements || []).map((item, i) => <ImprovementCard key={i} item={item} delay={i * 150} />)}
          </div>
        </div>

        <div className="rpt-div" />

        {/* PALETTE */}
        {result?.colors?.length > 0 && (
          <div className="rpt-section">
            <SectionTitle num="07 — Color Palette" title="Colors detected" highlight="on your page." />
            <div className="rpt-palette">
              {result.colors.map((c, i) => <ColorChip key={i} c={c} delay={i * 80} />)}
            </div>
          </div>
        )}

        {/* FINAL CTA */}
        <div className="rpt-final">
          <div className="rpt-final-title">Ready to fix it?</div>
          <div className="rpt-final-sub">Run another page through UXIFY and see how it compares.</div>
          <button className="rpt-final-btn" onClick={onReset}>Analyse Another Page →</button>
        </div>

      </div>
    </>
  )
}
