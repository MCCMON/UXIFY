import { useState, useRef, useCallback } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --blue-deep: #0a0f2e; --blue-electric: #2d5fff;
    --purple-bright: #6c35de; --purple-glow: #9b59f5; --purple-light: #c084fc;
    --accent-cyan: #38bdf8; --accent-pink: #f472b6;
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
  .hero { text-align:center; padding:64px 24px 48px; max-width:800px; margin:0 auto; }
  .hero-tag { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,rgba(45,95,255,0.15),rgba(108,53,222,0.15)); border:1px solid rgba(108,53,222,0.35); padding:6px 16px; border-radius:100px; font-size:13px; color:var(--purple-light); margin-bottom:24px; animation:fadeUp 0.6s ease forwards; }
  .hero-tag::before { content:''; width:6px; height:6px; background:var(--purple-glow); border-radius:50%; box-shadow:0 0 8px var(--purple-glow); animation:blink 2s ease infinite; }
  h1 { font-family:'Syne',sans-serif; font-size:clamp(38px,5.5vw,68px); font-weight:800; line-height:1.05; letter-spacing:-2px; margin-bottom:18px; animation:fadeUp 0.6s 0.1s ease both; }
  h1 .gradient-text { background:linear-gradient(135deg,var(--blue-electric),var(--purple-light),var(--accent-pink)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hero-sub { font-size:17px; color:var(--text-secondary); line-height:1.6; max-width:520px; margin:0 auto 40px; animation:fadeUp 0.6s 0.2s ease both; font-weight:300; }
  .upload-section { max-width:740px; margin:0 auto; padding:0 24px 80px; animation:fadeUp 0.6s 0.3s ease both; }
  .tabs { display:flex; gap:8px; background:rgba(13,26,74,0.5); border:1px solid var(--glass-border); border-radius:14px; padding:6px; margin-bottom:20px; width:fit-content; margin-left:auto; margin-right:auto; }
  .tab { padding:8px 22px; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; border:none; background:transparent; color:var(--text-secondary); transition:all 0.2s; font-family:'DM Sans',sans-serif; }
  .tab.active { background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); color:white; box-shadow:0 4px 20px rgba(108,53,222,0.4); }
  .drop-zone { border:2px dashed rgba(108,53,222,0.35); border-radius:20px; padding:52px 40px; text-align:center; cursor:pointer; transition:all 0.3s; background:var(--glass-bg); backdrop-filter:blur(20px); position:relative; overflow:hidden; }
  .drop-zone:hover,.drop-zone.drag-over { border-color:rgba(108,53,222,0.7); box-shadow:0 0 40px rgba(108,53,222,0.15); }
  .drop-icon { width:68px; height:68px; background:linear-gradient(135deg,rgba(45,95,255,0.2),rgba(108,53,222,0.2)); border:1px solid rgba(108,53,222,0.3); border-radius:18px; display:flex; align-items:center; justify-content:center; margin:0 auto 18px; font-size:30px; transition:transform 0.3s; }
  .drop-zone:hover .drop-icon { transform:scale(1.05) rotate(3deg); }
  .drop-title { font-family:'Syne',sans-serif; font-size:19px; font-weight:700; margin-bottom:6px; }
  .drop-sub { color:var(--text-muted); font-size:14px; margin-bottom:18px; }
  .browse-btn { display:inline-block; background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright)); color:white; padding:10px 22px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; border:none; font-family:'DM Sans',sans-serif; box-shadow:0 4px 20px rgba(108,53,222,0.35); transition:all 0.2s; }
  .browse-btn:hover { transform:translateY(-1px); box-shadow:0 6px 25px rgba(108,53,222,0.5); }
  .preview-box { display:flex; align-items:center; gap:16px; background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:16px; padding:18px; backdrop-filter:blur(20px); }
  .preview-img { width:76px; height:76px; object-fit:cover; border-radius:10px; border:1px solid var(--glass-border); }
  .preview-info { flex:1; }
  .preview-name { font-weight:600; font-size:15px; margin-bottom:4px; }
  .preview-size { color:var(--text-muted); font-size:13px; }
  .remove-btn { background:rgba(244,114,182,0.15); border:1px solid rgba(244,114,182,0.3); color:var(--accent-pink); padding:6px 14px; border-radius:8px; cursor:pointer; font-size:13px; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .remove-btn:hover { background:rgba(244,114,182,0.25); }
  .url-input { width:100%; background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:14px; padding:16px 20px; font-size:15px; color:var(--text-primary); font-family:'DM Sans',sans-serif; backdrop-filter:blur(20px); outline:none; transition:all 0.3s; }
  .url-input::placeholder { color:var(--text-muted); }
  .url-input:focus { border-color:rgba(108,53,222,0.6); box-shadow:0 0 0 4px rgba(108,53,222,0.1); }
  .url-preview { border-radius:14px; overflow:hidden; border:1px solid rgba(108,53,222,0.25); background:rgba(13,26,74,0.4); }
  .url-preview-bar { font-size:12px; color:var(--text-muted); padding:9px 14px; border-bottom:1px solid rgba(108,53,222,0.15); display:flex; align-items:center; gap:6px; }
  .live-dot { width:8px; height:8px; border-radius:50%; background:var(--purple-glow); box-shadow:0 0 6px var(--purple-glow); animation:blink 2s infinite; display:inline-block; }
  .analyze-btn { width:100%; background:linear-gradient(135deg,var(--blue-electric),var(--purple-bright),var(--purple-glow)); color:white; padding:17px; border-radius:14px; font-size:17px; font-weight:700; cursor:pointer; border:none; font-family:'Syne',sans-serif; box-shadow:0 8px 32px rgba(108,53,222,0.4); transition:all 0.3s; position:relative; overflow:hidden; margin-top:16px; }
  .analyze-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); transition:left 0.5s; }
  .analyze-btn:hover::before { left:100%; }
  .analyze-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(108,53,222,0.55); }
  .analyze-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .loading-state { text-align:center; padding:60px 24px; max-width:500px; margin:0 auto; }
  .loader-ring { width:80px; height:80px; border-radius:50%; border:3px solid rgba(108,53,222,0.2); border-top-color:var(--purple-bright); border-right-color:var(--blue-electric); animation:spin 1s linear infinite; margin:0 auto 24px; }
  .loading-steps { display:flex; flex-direction:column; gap:10px; text-align:left; max-width:300px; margin:24px auto 0; }
  .step { display:flex; align-items:center; gap:10px; font-size:14px; color:var(--text-muted); transition:all 0.3s; }
  .step.active { color:var(--text-primary); }
  .step.done { color:#4ade80; }
  .step-dot { width:8px; height:8px; border-radius:50%; background:var(--text-muted); flex-shrink:0; transition:all 0.3s; }
  .step.active .step-dot { background:var(--purple-glow); box-shadow:0 0 10px var(--purple-glow); }
  .step.done .step-dot { background:#22c55e; }
  .results { max-width:1000px; margin:0 auto; padding:0 24px 80px; animation:fadeUp 0.5s ease forwards; }
  .results-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:32px; gap:16px; flex-wrap:wrap; }
  .results-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; }
  .new-analysis-btn { background:transparent; border:1px solid var(--glass-border); color:var(--text-secondary); padding:10px 20px; border-radius:10px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; transition:all 0.2s; }
  .new-analysis-btn:hover { border-color:rgba(108,53,222,0.5); color:var(--text-primary); }
  .score-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:16px; margin-bottom:24px; }
  @media(max-width:700px){.score-grid{grid-template-columns:1fr 1fr}}
  .score-card { background:var(--card-bg); border:1px solid var(--glass-border); border-radius:16px; padding:24px 20px; text-align:center; backdrop-filter:blur(20px); position:relative; overflow:hidden; transition:transform 0.2s; }
  .score-card:hover { transform:translateY(-3px); }
  .score-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; }
  .score-card.blue::before { background:linear-gradient(90deg,var(--blue-electric),var(--accent-cyan)); }
  .score-card.purple::before { background:linear-gradient(90deg,#3d1a8c,var(--purple-light)); }
  .score-card.pink::before { background:linear-gradient(90deg,var(--accent-pink),var(--purple-light)); }
  .score-card.cyan::before { background:linear-gradient(90deg,var(--accent-cyan),var(--blue-electric)); }
  .score-val { font-family:'Syne',sans-serif; font-size:48px; font-weight:800; line-height:1; margin-bottom:4px; }
  .score-card.blue .score-val{color:var(--accent-cyan)} .score-card.purple .score-val{color:var(--purple-light)} .score-card.pink .score-val{color:var(--accent-pink)} .score-card.cyan .score-val{color:var(--accent-cyan)}
  .score-label { font-size:12px; color:var(--text-muted); font-weight:500; text-transform:uppercase; letter-spacing:0.8px; }
  .analysis-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  @media(max-width:700px){.analysis-grid{grid-template-columns:1fr}}
  .analysis-card { background:var(--card-bg); border:1px solid var(--glass-border); border-radius:16px; padding:24px; backdrop-filter:blur(20px); transition:all 0.2s; }
  .analysis-card:hover { border-color:rgba(108,53,222,0.4); }
  .card-title { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .card-icon { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; }
  .card-icon.blue{background:rgba(45,95,255,0.2)} .card-icon.purple{background:rgba(108,53,222,0.2)} .card-icon.pink{background:rgba(244,114,182,0.2)} .card-icon.cyan{background:rgba(56,189,248,0.2)}
  .issue-item { display:flex; gap:10px; padding:10px 0; border-bottom:1px solid rgba(108,53,222,0.1); font-size:14px; line-height:1.5; color:var(--text-secondary); }
  .issue-item:last-child { border-bottom:none; }
  .issue-bullet { width:6px; height:6px; border-radius:50%; margin-top:7px; flex-shrink:0; }
  .issue-bullet.red{background:#f87171;box-shadow:0 0 6px #f87171} .issue-bullet.yellow{background:#fbbf24;box-shadow:0 0 6px #fbbf24} .issue-bullet.green{background:#4ade80;box-shadow:0 0 6px #4ade80} .issue-bullet.blue{background:var(--blue-electric);box-shadow:0 0 6px var(--blue-electric)}
  .rec-item { margin-bottom:14px; }
  .rec-header { display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; color:var(--text-secondary); }
  .rec-bar { height:6px; background:rgba(108,53,222,0.15); border-radius:100px; overflow:hidden; }
  .rec-fill { height:100%; border-radius:100px; background:linear-gradient(90deg,var(--blue-electric),var(--purple-bright)); transition:width 1s cubic-bezier(0.4,0,0.2,1); }
  .palette { display:flex; gap:10px; flex-wrap:wrap; }
  .color-chip { display:flex; flex-direction:column; align-items:center; gap:5px; }
  .color-swatch { width:52px; height:52px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:transform 0.2s; cursor:pointer; }
  .color-swatch:hover { transform:scale(1.1); }
  .color-hex { font-size:10px; color:var(--text-muted); font-family:monospace; }
  .summary-card { background:linear-gradient(135deg,rgba(45,95,255,0.1),rgba(108,53,222,0.15)); border:1px solid rgba(108,53,222,0.35); border-radius:20px; padding:32px; margin-top:16px; backdrop-filter:blur(20px); }
  .summary-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; margin-bottom:12px; background:linear-gradient(135deg,var(--text-primary),var(--purple-light)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .summary-text { color:var(--text-secondary); line-height:1.7; font-size:15px; }
  .error-card { background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.25); border-radius:16px; padding:20px; text-align:center; color:#fca5a5; }
  footer { text-align:center; padding:28px; color:var(--text-muted); font-size:13px; border-top:1px solid rgba(108,53,222,0.1); }
`

function ScoreBar({ value, animated }) {
  return (
    <div className="rec-bar">
      <div className="rec-fill" style={{ width: animated ? `${value}%` : '0%' }} />
    </div>
  )
}

const STEPS = [
  'Preprocessing image...',
  'Extracting UI elements...',
  'Running design analysis...',
  'Scoring accessibility...',
  'Generating recommendations...',
]

export default function AppMain({ session, onSignOut }) {
  const [tab, setTab] = useState('image')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [url, setUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadStep, setLoadStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [barsAnimated, setBarsAnimated] = useState(false)
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const analyze = async () => {
    if (tab === 'image' && !file) return
    if (tab === 'url' && !url.trim()) return
    setLoading(true); setError(null); setResult(null); setLoadStep(0); setBarsAnimated(false)

    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 650))
      setLoadStep(i + 1)
    }

    try {
      let body = {}

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

      // Call OUR backend API route — key is hidden server-side
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)

      setResult(data)
      setTimeout(() => setBarsAnimated(true), 200)
    } catch (e) {
      setError('Analysis failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setResult(null); setFile(null); setPreview(null); setUrl(''); setError(null) }
  const severityColor = (s) => ({ error: 'red', warning: 'yellow', pass: 'green', info: 'blue' }[s] || 'blue')
  const userEmail = session?.user?.email || ''

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="bg-mesh" />
        <div className="bg-grid" />
        <div className="content">
          <nav>
            <div className="logo">
              <div className="logo-icon">🔍</div>
              UX<span>IFY</span>
            </div>
            <div className="nav-right">
              <div className="nav-user">👤 {userEmail}</div>
              <button className="signout-btn" onClick={onSignOut}>Sign out</button>
            </div>
          </nav>

          {!loading && !result && (
            <>
              <div className="hero">
                <div className="hero-tag">Powered by Claude Vision AI</div>
                <h1>Analyse Any UI<br /><span className="gradient-text">Instantly with AI</span></h1>
                <p className="hero-sub">Upload a screenshot or paste a URL. Get deep insights on design quality, accessibility, UX patterns, typography and more — in seconds.</p>
              </div>

              <div className="upload-section">
                <div className="tabs">
                  <button className={`tab ${tab === 'image' ? 'active' : ''}`} onClick={() => setTab('image')}>📷 Upload Image</button>
                  <button className={`tab ${tab === 'url' ? 'active' : ''}`} onClick={() => setTab('url')}>🔗 Paste URL</button>
                </div>

                {tab === 'image' ? (
                  !file ? (
                    <div className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current.click()}>
                      <div className="drop-icon">🖼️</div>
                      <div className="drop-title">Drop your UI screenshot here</div>
                      <div className="drop-sub">Supports PNG, JPG, WEBP — max 10MB</div>
                      <button className="browse-btn" onClick={(e) => { e.stopPropagation(); fileRef.current.click() }}>Browse Files</button>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
                    </div>
                  ) : (
                    <div className="preview-box">
                      <img src={preview} alt="preview" className="preview-img" />
                      <div className="preview-info">
                        <div className="preview-name">{file.name}</div>
                        <div className="preview-size">{(file.size / 1024).toFixed(1)} KB · Ready to analyse</div>
                      </div>
                      <button className="remove-btn" onClick={() => { setFile(null); setPreview(null) }}>Remove</button>
                    </div>
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="url-input" type="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                    {url && url.startsWith('http') && (
                      <div className="url-preview">
                        <div className="url-preview-bar">
                          <span className="live-dot" /> Live preview — screenshot captured automatically
                        </div>
                        <img
                          src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1280&h=960`}
                          alt="Site preview"
                          style={{ width: '100%', height: 200, objectFit: 'cover', objectPosition: 'top', display: 'block', opacity: 0.85 }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                      🖥️ UXIFY captures and analyses the real visual UI of the URL
                    </div>
                  </div>
                )}

                <button className="analyze-btn" onClick={analyze} disabled={(tab === 'image' && !file) || (tab === 'url' && !url.trim())}>
                  ✦ Analyse UI with AI
                </button>
                {error && <div className="error-card" style={{ marginTop: 16 }}>{error}</div>}
              </div>
            </>
          )}

          {loading && (
            <div className="loading-state">
              <div className="loader-ring" />
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Analysing your UI...</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Claude is examining design patterns</div>
              <div className="loading-steps">
                {STEPS.map((s, i) => (
                  <div key={i} className={`step ${loadStep > i ? 'done' : loadStep === i ? 'active' : ''}`}>
                    <div className="step-dot" />{loadStep > i ? '✓ ' : ''}{s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="results">
              <div className="results-header">
                <div className="results-title">✦ Analysis Complete</div>
                <button className="new-analysis-btn" onClick={reset}>← New Analysis</button>
              </div>

              <div className="score-grid">
                {[
                  { label: 'Overall Score', val: result.scores?.overall, cls: 'blue' },
                  { label: 'Design Quality', val: result.scores?.design, cls: 'purple' },
                  { label: 'Accessibility', val: result.scores?.accessibility, cls: 'pink' },
                  { label: 'UX Score', val: result.scores?.ux, cls: 'cyan' },
                ].map((s, i) => (
                  <div key={i} className={`score-card ${s.cls}`}>
                    <div className="score-val">{s.val}</div>
                    <div className="score-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="analysis-grid">
                <div className="analysis-card">
                  <div className="card-title"><div className="card-icon pink">♿</div>Accessibility</div>
                  {result.accessibility?.map((item, i) => (
                    <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                  ))}
                </div>
                <div className="analysis-card">
                  <div className="card-title"><div className="card-icon blue">🧭</div>UX Patterns</div>
                  {result.ux?.map((item, i) => (
                    <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                  ))}
                </div>
                <div className="analysis-card">
                  <div className="card-title"><div className="card-icon purple">🎨</div>Design Notes</div>
                  {result.design?.map((item, i) => (
                    <div key={i} className="issue-item"><div className={`issue-bullet ${severityColor(item.severity)}`} /><span>{item.text}</span></div>
                  ))}
                </div>
                <div className="analysis-card">
                  <div className="card-title"><div className="card-icon cyan">Aa</div>Typography</div>
                  {result.typography && <>
                    {['hierarchy', 'readability', 'consistency'].map(k => (
                      <div className="rec-item" key={k}>
                        <div className="rec-header"><span style={{ textTransform: 'capitalize' }}>{k}</span><span>{result.typography[k]}/100</span></div>
                        <ScoreBar value={result.typography[k]} animated={barsAnimated} />
                      </div>
                    ))}
                    <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{result.typography.notes}</div>
                  </>}
                </div>
                <div className="analysis-card">
                  <div className="card-title"><div className="card-icon blue">📊</div>Area Scores</div>
                  {result.recommendations?.map((r, i) => (
                    <div className="rec-item" key={i}>
                      <div className="rec-header"><span>{r.label}</span><span>{r.score}/100</span></div>
                      <ScoreBar value={r.score} animated={barsAnimated} />
                    </div>
                  ))}
                </div>
                <div className="analysis-card">
                  <div className="card-title"><div className="card-icon pink">🎭</div>Color Palette</div>
                  <div className="palette">
                    {result.colors?.map((c, i) => (
                      <div className="color-chip" key={i}>
                        <div className="color-swatch" style={{ background: c.hex }} title={`${c.role}: ${c.hex}`} />
                        <span className="color-hex">{c.hex}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-title">AI Summary</div>
                <div className="summary-text">{result.summary}</div>
              </div>
            </div>
          )}

          <footer>UXIFY © 2026 · Powered by Claude Vision AI · Built for designers & developers</footer>
        </div>
      </div>
    </>
  )
}
