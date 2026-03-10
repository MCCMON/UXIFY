import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --blue-deep: #0a0f2e; --blue-electric: #2d5fff;
    --purple-bright: #6c35de; --purple-glow: #9b59f5; --purple-light: #c084fc;
    --accent-cyan: #38bdf8; --accent-pink: #f472b6; --green: #4ade80;
    --text-primary: #f0f4ff; --text-secondary: #94a3c4; --text-muted: #5a6b8a;
    --glass-bg: rgba(13,26,74,0.4); --glass-border: rgba(108,53,222,0.25); --card-bg: rgba(10,15,46,0.7);
  }
  body { font-family: 'DM Sans', sans-serif; background: var(--blue-deep); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; }
  .app { min-height: 100vh; position: relative; }
  .bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .bg-mesh::before { content:''; position:absolute; width:800px; height:800px; background:radial-gradient(circle,rgba(108,53,222,0.15) 0%,transparent 70%); top:-200px; left:-200px; animation:drift1 18s ease-in-out infinite alternate; }
  .bg-mesh::after { content:''; position:absolute; width:600px; height:600px; background:radial-gradient(circle,rgba(45,95,255,0.12) 0%,transparent 70%); bottom:-100px; right:-100px; animation:drift2 14s ease-in-out infinite alternate; }
  .bg-grid { position:fixed; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(45,95,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,95,255,0.04) 1px,transparent 1px); background-size:50px 50px; }
  @keyframes drift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(80px,60px) scale(1.2)} }
  @keyframes drift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-60px,-80px) scale(1.15)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .content { position:relative; z-index:1; }
  nav { display:flex; align-items:center; justify-content:space-between; padding:18px 40px; border-bottom:1px solid rgba(108,53,222,0.15); backdrop-filter:blur(20px); background:rgba(10,15,46,0.6); position:sticky; top:0; z-index:100; }
  .logo { display:flex; align-items:center; gap:10px; font-family:'Syne',sans-serif; font-size:22px; font-weight:800; }
  .logo-icon { width:36px; height:36px; background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 0 20px rgba(108,53,222,0.5); }
  .logo span { color:var(--purple-light); }
  .nav-right { display:flex; align-items:center; gap:12px; }
  .nav-user { font-size:13px; color:var(--text-muted); background:rgba(13,26,74,0.5); border:1px solid var(--glass-border); padding:6px 14px; border-radius:100px; }
  .signout-btn { background:transparent; border:1px solid rgba(244,114,182,0.3); color:var(--accent-pink); padding:6px 14px; border-radius:100px; font-size:13px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .signout-btn:hover { background:rgba(244,114,182,0.1); }
  .signin-nav-btn { background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); color:white; border:none; padding:8px 20px; border-radius:100px; font-size:13px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 16px rgba(108,53,222,0.4); transition:all 0.2s; }
  .signin-nav-btn:hover { transform:translateY(-1px); }
  .hero { text-align:center; padding:64px 24px 48px; max-width:800px; margin:0 auto; }
  .hero-tag { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,rgba(45,95,255,0.15),rgba(108,53,222,0.15)); border:1px solid rgba(108,53,222,0.35); padding:6px 16px; border-radius:100px; font-size:13px; color:var(--purple-light); margin-bottom:24px; animation:fadeUp 0.6s ease forwards; }
  .hero-tag::before { content:''; width:6px; height:6px; background:var(--purple-glow); border-radius:50%; box-shadow:0 0 8px var(--purple-glow); animation:blink 2s ease infinite; }
  h1 { font-family:'Syne',sans-serif; font-size:clamp(36px,5.5vw,64px); font-weight:800; line-height:1.05; letter-spacing:-2px; margin-bottom:18px; animation:fadeUp 0.6s 0.1s ease both; }
  h1 .gradient-text { background:linear-gradient(135deg,var(--blue-electric),var(--purple-light),var(--accent-pink)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hero-sub { font-size:17px; color:var(--text-secondary); line-height:1.6; max-width:520px; margin:0 auto 40px; animation:fadeUp 0.6s 0.2s ease both; font-weight:300; }
  .upload-section { max-width:740px; margin:0 auto; padding:0 24px 80px; animation:fadeUp 0.6s 0.3s ease both; }
  .tabs { display:flex; gap:8px; background:rgba(13,26,74,0.5); border:1px solid var(--glass-border); border-radius:14px; padding:6px; margin-bottom:20px; width:fit-content; margin-left:auto; margin-right:auto; }
  .tab { padding:8px 22px; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; border:none; background:transparent; color:var(--text-secondary); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .tab.active { background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); color:white; box-shadow:0 4px 20px rgba(108,53,222,0.4); }
  .drop-zone { border:2px dashed rgba(108,53,222,0.35); border-radius:20px; padding:52px 40px; text-align:center; cursor:pointer; transition:all 0.3s; background:var(--glass-bg); backdrop-filter:blur(20px); }
  .drop-zone:hover { border-color:rgba(108,53,222,0.7); box-shadow:0 0 40px rgba(108,53,222,0.15); }
  .drop-icon { width:68px; height:68px; background:linear-gradient(135deg,rgba(45,95,255,0.2),rgba(108,53,222,0.2)); border:1px solid rgba(108,53,222,0.3); border-radius:18px; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:30px; }
  .drop-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:700; margin-bottom:6px; }
  .drop-sub { color:var(--text-muted); font-size:14px; margin-bottom:18px; }
  .browse-btn { display:inline-block; background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); color:white; padding:10px 22px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; }
  .preview-box { display:flex; align-items:center; gap:16px; background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:16px; padding:18px; }
  .preview-img { width:76px; height:76px; object-fit:cover; border-radius:10px; }
  .preview-name { font-weight:600; font-size:15px; margin-bottom:4px; }
  .preview-size { color:var(--text-muted); font-size:13px; }
  .remove-btn { background:rgba(244,114,182,0.15); border:1px solid rgba(244,114,182,0.3); color:var(--accent-pink); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; }
  .url-input { width:100%; background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:14px; padding:16px 20px; font-size:15px; color:var(--text-primary); font-family:'DM Sans',sans-serif; backdrop-filter:blur(20px); outline:none; transition:all 0.3s; }
  .url-input::placeholder { color:var(--text-muted); }
  .url-input:focus { border-color:rgba(108,53,222,0.6); box-shadow:0 0 0 4px rgba(108,53,222,0.1); }
  .url-preview { border-radius:14px; overflow:hidden; border:1px solid rgba(108,53,222,0.25); background:rgba(13,26,74,0.4); margin-top:12px; }
  .url-preview-bar { font-size:12px; color:var(--text-muted); padding:9px 14px; border-bottom:1px solid rgba(108,53,222,0.15); display:flex; align-items:center; gap:6px; }
  .live-dot { width:8px; height:8px; border-radius:50%; background:var(--purple-glow); animation:blink 2s infinite; display:inline-block; }
  .analyze-btn { width:100%; background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright),var(--purple-glow)); color:white; padding:17px; border-radius:14px; font-size:17px; font-weight:700; cursor:pointer; border:none; font-family:'Syne',sans-serif; box-shadow:0 8px 32px rgba(108,53,222,0.4); transition:all 0.3s; margin-top:16px; }
  .analyze-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(108,53,222,0.55); }
  .analyze-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .loading-state { text-align:center; padding:60px 24px; max-width:500px; margin:0 auto; }
  .loader-ring { width:80px; height:80px; border-radius:50%; border:3px solid rgba(108,53,222,0.2); border-top-color:var(--purple-bright); border-right-color:var(--blue-electric); animation:spin 1s linear infinite; margin:0 auto 24px; }
  .loading-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; margin-bottom:8px; }
  .loading-sub { color:var(--text-muted); font-size:14px; }
  .results { max-width:740px; margin:0 auto; padding:0 24px 80px; animation:fadeUp 0.5s ease forwards; }
  .results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .results-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; }
  .new-analysis-btn { background:rgba(108,53,222,0.15); border:1px solid rgba(108,53,222,0.3); color:var(--purple-light); padding:8px 18px; border-radius:10px; cursor:pointer; font-size:14px; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .new-analysis-btn:hover { background:rgba(108,53,222,0.25); }
  .score-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; margin-bottom:24px; }
  .score-card { background:var(--card-bg); border:1px solid var(--glass-border); border-radius:16px; padding:20px; text-align:center; backdrop-filter:blur(20px); }
  .score-card.blue { border-color:rgba(45,95,255,0.3); }
  .score-card.purple { border-color:rgba(108,53,222,0.3); }
  .score-card.pink { border-color:rgba(244,114,182,0.3); }
  .score-card.cyan { border-color:rgba(56,189,248,0.3); }
  .score-val { font-family:'Syne',sans-serif; font-size:42px; font-weight:800; line-height:1; margin-bottom:4px; background:linear-gradient(135deg,var(--blue-electric),var(--purple-light)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .score-label { font-size:12px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; }
  .analysis-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:16px; margin-bottom:24px; }
  .analysis-card { background:var(--card-bg); border:1px solid var(--glass-border); border-radius:16px; padding:20px; backdrop-filter:blur(20px); }
  .card-title { display:flex; align-items:center; gap:10px; font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:16px; }
  .card-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; }
  .card-icon.pink { background:rgba(244,114,182,0.15); }
  .card-icon.blue { background:rgba(45,95,255,0.15); }
  .card-icon.purple { background:rgba(108,53,222,0.15); }
  .card-icon.cyan { background:rgba(56,189,248,0.15); }
  .card-icon.green { background:rgba(74,222,128,0.15); }
  .issue-item { display:flex; align-items:flex-start; gap:10px; padding:8px 0; border-bottom:1px solid rgba(108,53,222,0.08); font-size:14px; line-height:1.5; color:var(--text-secondary); }
  .issue-item:last-child { border-bottom:none; }
  .issue-bullet { width:8px; height:8px; border-radius:50%; margin-top:5px; flex-shrink:0; }
  .issue-bullet.red { background:#f87171; box-shadow:0 0 6px rgba(248,113,113,0.5); }
  .issue-bullet.yellow { background:#fbbf24; box-shadow:0 0 6px rgba(251,191,36,0.5); }
  .issue-bullet.green { background:#4ade80; box-shadow:0 0 6px rgba(74,222,128,0.5); }
  .issue-bullet.blue { background:#60a5fa; box-shadow:0 0 6px rgba(96,165,250,0.5); }
  .priority-high { color:#f87171; font-size:11px; font-weight:700; text-transform:uppercase; }
  .priority-medium { color:#fbbf24; font-size:11px; font-weight:700; text-transform:uppercase; }
  .priority-low { color:#4ade80; font-size:11px; font-weight:700; text-transform:uppercase; }
  .rec-item { margin-bottom:12px; }
  .rec-header { display:flex; justify-content:space-between; font-size:13px; color:var(--text-secondary); margin-bottom:6px; }
  .score-bar-bg { height:6px; background:rgba(108,53,222,0.15); border-radius:100px; overflow:hidden; }
  .score-bar-fill { height:100%; border-radius:100px; background:linear-gradient(90deg,var(--blue-electric),var(--purple-glow)); transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
  .summary-card { background:linear-gradient(135deg,rgba(45,95,255,0.08),rgba(108,53,222,0.08)); border:1px solid rgba(108,53,222,0.2); border-radius:16px; padding:24px; margin-bottom:24px; }
  .summary-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:var(--purple-light); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
  .summary-text { font-size:15px; color:var(--text-secondary); line-height:1.7; }
  .palette { display:flex; flex-wrap:wrap; gap:10px; }
  .color-chip { display:flex; flex-direction:column; align-items:center; gap:4px; }
  .color-swatch { width:40px; height:40px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); }
  .color-hex { font-size:11px; color:var(--text-muted); font-family:monospace; }
  footer { text-align:center; padding:28px; color:var(--text-muted); font-size:13px; border-top:1px solid rgba(108,53,222,0.1); }
  /* PAYWALL */
  .paywall-overlay { position:relative; margin-top:16px; }
  .blurred-section { filter:blur(6px); pointer-events:none; user-select:none; opacity:0.5; }
  .paywall-card { position:relative; z-index:10; background:linear-gradient(135deg,rgba(10,15,46,0.97),rgba(26,10,62,0.97)); border:1px solid rgba(108,53,222,0.5); border-radius:24px; padding:48px 40px; text-align:center; margin-top:24px; backdrop-filter:blur(24px); box-shadow:0 0 80px rgba(108,53,222,0.2); animation:fadeUp 0.5s ease forwards; }
  .paywall-badge { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,rgba(244,114,182,0.2),rgba(108,53,222,0.2)); border:1px solid rgba(244,114,182,0.4); padding:6px 16px; border-radius:100px; font-size:13px; color:var(--accent-pink); margin-bottom:20px; font-weight:600; }
  .paywall-title { font-family:'Syne',sans-serif; font-size:32px; font-weight:800; margin-bottom:12px; line-height:1.1; }
  .paywall-title .highlight { background:linear-gradient(135deg,var(--accent-pink),var(--purple-light)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .paywall-sub { font-size:16px; color:var(--text-secondary); margin-bottom:32px; line-height:1.6; max-width:460px; margin-left:auto; margin-right:auto; }
  .price-tag { display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:28px; }
  .price-old { font-size:22px; color:var(--text-muted); text-decoration:line-through; font-family:'Syne',sans-serif; }
  .price-new { font-size:48px; font-weight:800; font-family:'Syne',sans-serif; background:linear-gradient(135deg,var(--accent-pink),var(--purple-light)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .price-label { font-size:14px; color:var(--text-muted); }
  .early-features { display:flex; justify-content:center; gap:24px; margin-bottom:32px; flex-wrap:wrap; }
  .early-feature { font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:6px; }
  .early-feature::before { content:'✓'; color:#4ade80; font-weight:700; }
  .email-capture { display:flex; gap:10px; max-width:460px; margin:0 auto 16px; }
  .email-input { flex:1; background:rgba(13,26,74,0.6); border:1px solid var(--glass-border); border-radius:12px; padding:14px 18px; font-size:15px; color:var(--text-primary); font-family:'DM Sans',sans-serif; outline:none; transition:all 0.2s; }
  .email-input::placeholder { color:var(--text-muted); }
  .email-input:focus { border-color:rgba(108,53,222,0.6); }
  .claim-btn { background:linear-gradient(135deg,var(--accent-pink),var(--purple-bright)); color:white; padding:14px 24px; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; border:none; font-family:'Syne',sans-serif; white-space:nowrap; transition:all 0.2s; }
  .claim-btn:hover { transform:translateY(-1px); }
  .claim-btn:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
  .spots-left { font-size:13px; color:var(--text-muted); }
  .spots-left span { color:var(--accent-pink); font-weight:600; }
  .claimed-msg { background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.25); border-radius:12px; padding:16px; color:#86efac; font-size:15px; margin-top:8px; }
  .score-preview { background:var(--card-bg); border:1px solid var(--glass-border); border-radius:16px; padding:24px; margin-bottom:16px; }
  .score-preview-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:16px; }
  .overall-score-big { display:flex; align-items:center; justify-content:center; gap:20px; flex-wrap:wrap; }
  .score-circle { width:100px; height:100px; border-radius:50%; background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); display:flex; align-items:center; justify-content:center; flex-direction:column; box-shadow:0 0 40px rgba(108,53,222,0.4); }
  .score-circle-val { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; line-height:1; }
  .score-circle-label { font-size:11px; color:rgba(255,255,255,0.7); }
  .score-breakdown { display:flex; gap:20px; flex-wrap:wrap; }
  .score-mini { text-align:center; }
  .score-mini-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:var(--purple-light); }
  .score-mini-label { font-size:11px; color:var(--text-muted); }
`

const ScoreBar = ({ value }) => (
  <div className="score-bar-bg">
    <div className="score-bar-fill" style={{ width: `${value}%` }} />
  </div>
)

const severityColor = (s) => s === 'error' ? 'red' : s === 'warning' ? 'yellow' : s === 'pass' ? 'green' : 'blue'

export default function AppMain({ session, onSignOut, onAuthRequired }) {
  const [tab, setTab] = useState('url')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [earlyEmail, setEarlyEmail] = useState('')
  const [claimed, setClaimed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('uxify_claimed') === 'true'
    return false
  })
  const [claimLoading, setClaimLoading] = useState(false)
  const fileRef = useRef()

  const userEmail = session?.user?.email || ''

  const handleClaim = async () => {
    if (!earlyEmail || !earlyEmail.includes('@')) return
    setClaimLoading(true)
    setTimeout(() => {
      setClaimed(true)
      localStorage.setItem('uxify_claimed', 'true')
      setClaimLoading(false)
    }, 1000)
    try {
      await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: earlyEmail })
      })
    } catch(e) { console.error('Claim error:', e) }
  }

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const reset = () => { setFile(null); setPreview(null); setUrl(''); setResult(null); setError('') }

  const analyze = async () => {
    if (!session) { onAuthRequired(); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const { data: { session: s } } = await supabase.auth.getSession()
      const token = s?.access_token
      let body
      if (tab === 'image' && file) {
        const base64 = await new Promise((res, rej) => {
          const r = new FileReader()
          r.onload = () => res(r.result.split(',')[1])
          r.onerror = rej
          r.readAsDataURL(file)
        })
        body = { type: 'image', imageBase64: base64, mediaType: file.type }
      } else {
        body = { type: 'url', url }
      }
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="bg-mesh" /><div className="bg-grid" />
        <div className="content">
          <nav>
            <div className="logo">
              <div className="logo-icon">🚀</div>
              UX<span>IFY</span>
            </div>
            <div className="nav-right">
              {session ? (
                <>
                  <div className="nav-user">👤 {userEmail}</div>
                  <button className="signout-btn" onClick={onSignOut}>Sign out</button>
                </>
              ) : (
                <button className="signin-nav-btn" onClick={onAuthRequired}>Sign in</button>
              )}
            </div>
          </nav>

          {!result && !loading && (
            <>
              <div className="hero">
                <div className="hero-tag">✦ AI Landing Page Analyser</div>
                <h1>Is Your Landing Page<br /><span className="gradient-text">Killing Conversions?</span></h1>
                <p className="hero-sub">Paste your URL and get an instant AI analysis of why visitors aren't converting — with actionable fixes.</p>
              </div>

              <div className="upload-section">
                <div className="tabs">
                  <button className={`tab ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}>🔗 Paste URL</button>
                  <button className={`tab ${tab === 'image' ? 'active' : ''}`} onClick={() => setTab('image')}>📸 Upload Screenshot</button>
                </div>

                {tab === 'url' ? (
                  <div>
                    <input className="url-input" placeholder="https://yourlandingpage.com" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && url.trim() && analyze()} />
                    {url.trim() && (
                      <div className="url-preview">
                        <div className="url-preview-bar"><span className="live-dot" /> Live preview — screenshot captured automatically</div>
                        <img src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=960`} style={{ width: '100%', display: 'block' }} alt="Preview" />
                        <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>🚀 UXIFY captures and analyses the real visual landing page</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!file ? (
                      <div className="drop-zone" onClick={() => fileRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}>
                        <div className="drop-icon">📸</div>
                        <div className="drop-title">Drop your screenshot here</div>
                        <div className="drop-sub">PNG, JPG, WebP supported</div>
                        <button className="browse-btn">Browse files</button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                      </div>
                    ) : (
                      <div className="preview-box">
                        <img src={preview} className="preview-img" alt="Preview" />
                        <div style={{ flex: 1 }}>
                          <div className="preview-name">{file.name}</div>
                          <div className="preview-size">{(file.size / 1024).toFixed(0)} KB · Ready to analyse</div>
                        </div>
                        <button className="remove-btn" onClick={() => { setFile(null); setPreview(null) }}>Remove</button>
                      </div>
                    )}
                  </div>
                )}

                {error && <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 12, padding: '14px 18px', color: '#fca5a5', fontSize: 14, marginTop: 16, textAlign: 'center' }}>{error}</div>}

                <button className="analyze-btn" onClick={session ? analyze : onAuthRequired} disabled={(tab === 'image' && !file) || (tab === 'url' && !url.trim())}>
                  ✦ {session ? 'Analyse Landing Page' : 'Sign in to Analyse'}
                </button>
              </div>
            </>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loader-ring" />
              <div className="loading-title">Analysing your landing page...</div>
              <div className="loading-sub">Checking conversions, copy, CTAs and trust signals</div>
            </div>
          )}

          {result && (
            <div className="results">
              <div className="results-header">
                <div className="results-title">✦ Landing Page Report</div>
                <button className="new-analysis-btn" onClick={reset}>← New Analysis</button>
              </div>

              {/* Score preview - always visible */}
              <div className="score-preview" style={{ marginBottom: 16 }}>
                <div className="score-preview-title">Conversion Score</div>
                <div className="overall-score-big">
                  <div className="score-circle">
                    <div className="score-circle-val">{result.scores?.overall}</div>
                    <div className="score-circle-label">/ 100</div>
                  </div>
                  <div className="score-breakdown">
                    {[
                      { label: 'Headline', val: result.scores?.headline },
                      { label: 'CTA', val: result.scores?.cta },
                      { label: 'Trust', val: result.scores?.trust },
                      { label: 'Clarity', val: result.scores?.clarity },
                    ].map((s, i) => (
                      <div key={i} className="score-mini">
                        <div className="score-mini-val">{s.val}</div>
                        <div className="score-mini-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blurred paywall section */}
              <div className="paywall-overlay">
                <div className="blurred-section">
                  <div className="summary-card">
                    <div className="summary-title">AI Summary</div>
                    <div className="summary-text">{result.summary}</div>
                  </div>
                  <div className="analysis-grid">
                    <div className="analysis-card">
                      <div className="card-title"><div className="card-icon pink">👁️</div>First Impression</div>
                      {result.firstimpression?.map((item, i) => (
                        <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                      ))}
                    </div>
                    <div className="analysis-card">
                      <div className="card-title"><div className="card-icon blue">🎯</div>CTA Analysis</div>
                      {result.cta_analysis?.map((item, i) => (
                        <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                      ))}
                    </div>
                    <div className="analysis-card">
                      <div className="card-title"><div className="card-icon green">🛡️</div>Trust Signals</div>
                      {result.trust_signals?.map((item, i) => (
                        <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                      ))}
                    </div>
                    <div className="analysis-card">
                      <div className="card-title"><div className="card-icon purple">✍️</div>Copy Analysis</div>
                      {result.copy_analysis?.map((item, i) => (
                        <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                      ))}
                    </div>
                    <div className="analysis-card">
                      <div className="card-title"><div className="card-icon pink">⚡</div>Quick Wins</div>
                      {result.quick_wins?.map((r, i) => (
                        <div className="rec-item" key={i}>
                          <div className="rec-header"><span>{r.label}</span><span>{r.score}/100</span></div>
                          <ScoreBar value={r.score} />
                        </div>
                      ))}
                    </div>
                    <div className="analysis-card">
                      <div className="card-title"><div className="card-icon cyan">🎨</div>Color Palette</div>
                      <div className="palette">
                        {result.colors?.map((c, i) => (
                          <div className="color-chip" key={i}>
                            <div className="color-swatch" style={{ background: c.hex }} />
                            <span className="color-hex">{c.hex}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paywall */}
                <div className="paywall-card">
                  <div className="paywall-badge">🔥 Beta Launch — Limited Time</div>
                  <div className="paywall-title">
                    Unlock Your Full<br />
                    <span className="highlight">Conversion Report</span>
                  </div>
                  <div className="paywall-sub">
                    Get full access to your CTA analysis, trust signal audit, copy review, quick wins breakdown and detailed AI summary — at <strong>50% off lifetime</strong> before we launch publicly.
                  </div>
                  <div className="price-tag">
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Regular price</div>
                      <div className="price-old">$20/mo</div>
                    </div>
                    <div style={{ fontSize: 28, color: 'var(--text-muted)' }}>→</div>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--accent-pink)', marginBottom: 4, fontWeight: 600 }}>Beta deal</div>
                      <div className="price-new">$99</div>
                      <div className="price-label">lifetime access</div>
                    </div>
                  </div>
                  <div className="early-features">
                    <div className="early-feature">Full conversion report</div>
                    <div className="early-feature">Unlimited analyses</div>
                    <div className="early-feature">All future features</div>
                    <div className="early-feature">Priority support</div>
                  </div>
                  {!claimed ? (
                    <>
                      <div className="email-capture">
                        <input className="email-input" type="email" placeholder="Enter your email to claim deal" value={earlyEmail} onChange={e => setEarlyEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClaim()} />
                        <button className="claim-btn" onClick={handleClaim} disabled={claimLoading}>
                          {claimLoading ? '...' : '🔥 Claim 50% Off'}
                        </button>
                      </div>
                      <div className="spots-left">⚡ <span>47 spots</span> remaining at this price</div>
                    </>
                  ) : (
                    <div className="claimed-msg">🎉 You're on the early access list! We'll email you when payments go live with your 50% discount locked in.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <footer>UXIFY © 2026 · AI Landing Page Analyser · Built for founders & marketers</footer>
        </div>
      </div>
    </>
  )
}
