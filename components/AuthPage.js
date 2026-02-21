import { useState } from 'react'
import { supabase } from '../lib/supabase'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-deep: #0a0f2e;
    --blue-electric: #2d5fff;
    --purple-bright: #6c35de;
    --purple-glow: #9b59f5;
    --purple-light: #c084fc;
    --accent-pink: #f472b6;
    --text-primary: #f0f4ff;
    --text-secondary: #94a3c4;
    --text-muted: #5a6b8a;
    --glass-bg: rgba(13, 26, 74, 0.45);
    --glass-border: rgba(108, 53, 222, 0.28);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--blue-deep);
    color: var(--text-primary);
    min-height: 100vh;
  }

  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 24px;
  }

  .bg-mesh {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
  }
  .bg-mesh::before {
    content: '';
    position: absolute;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(108,53,222,0.18) 0%, transparent 70%);
    top: -200px; left: -200px;
    animation: drift1 16s ease-in-out infinite alternate;
  }
  .bg-mesh::after {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(45,95,255,0.14) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    animation: drift2 12s ease-in-out infinite alternate;
  }
  .bg-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: linear-gradient(rgba(45,95,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(45,95,255,0.04) 1px, transparent 1px);
    background-size: 50px 50px;
  }
  @keyframes drift1 { from { transform: translate(0,0) scale(1); } to { transform: translate(80px,60px) scale(1.2); } }
  @keyframes drift2 { from { transform: translate(0,0) scale(1); } to { transform: translate(-60px,-80px) scale(1.15); } }

  .card {
    position: relative; z-index: 1;
    width: 100%; max-width: 440px;
    background: rgba(10, 15, 46, 0.75);
    border: 1px solid var(--glass-border);
    border-radius: 24px;
    padding: 44px 40px;
    backdrop-filter: blur(24px);
    box-shadow: 0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(108,53,222,0.1);
    animation: fadeUp 0.5s ease forwards;
  }

  @keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }

  .logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800;
    justify-content: center; margin-bottom: 32px;
  }
  .logo-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--blue-electric), var(--purple-bright));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 24px rgba(108,53,222,0.5);
  }
  .logo span { color: var(--purple-light); }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px; font-weight: 800;
    text-align: center; margin-bottom: 6px;
  }
  .card-sub {
    font-size: 14px; color: var(--text-muted);
    text-align: center; margin-bottom: 32px;
  }

  .field { margin-bottom: 16px; }
  .field label {
    display: block; font-size: 13px; font-weight: 500;
    color: var(--text-secondary); margin-bottom: 6px;
  }
  .field input {
    width: 100%;
    background: rgba(13, 26, 74, 0.5);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 15px; color: var(--text-primary);
    font-family: 'DM Sans', sans-serif;
    outline: none; transition: all 0.2s;
  }
  .field input::placeholder { color: var(--text-muted); }
  .field input:focus {
    border-color: rgba(108,53,222,0.6);
    box-shadow: 0 0 0 3px rgba(108,53,222,0.12);
  }

  .submit-btn {
    width: 100%; margin-top: 8px;
    background: linear-gradient(135deg, var(--blue-electric), var(--purple-bright), var(--purple-glow));
    color: white; padding: 15px;
    border-radius: 12px; font-size: 16px; font-weight: 700;
    cursor: pointer; border: none;
    font-family: 'Syne', sans-serif;
    box-shadow: 0 8px 28px rgba(108,53,222,0.4);
    transition: all 0.2s; position: relative; overflow: hidden;
  }
  .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 36px rgba(108,53,222,0.55); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0; color: var(--text-muted); font-size: 13px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(108,53,222,0.2);
  }

  .toggle-link {
    text-align: center; font-size: 14px; color: var(--text-muted);
  }
  .toggle-link button {
    background: none; border: none; cursor: pointer;
    color: var(--purple-light); font-weight: 600; font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    text-decoration: underline; transition: color 0.2s;
  }
  .toggle-link button:hover { color: white; }

  .error-msg {
    background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
    border-radius: 10px; padding: 12px 14px;
    color: #fca5a5; font-size: 14px; margin-bottom: 16px; text-align: center;
  }

  .success-msg {
    background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25);
    border-radius: 10px; padding: 12px 14px;
    color: #86efac; font-size: 14px; margin-bottom: 16px; text-align: center;
  }

  .features {
    display: flex; justify-content: center; gap: 20px;
    margin-top: 28px; flex-wrap: wrap;
  }
  .feature {
    font-size: 12px; color: var(--text-muted);
    display: flex; align-items: center; gap: 4px;
  }
  .feature span { color: var(--purple-light); }
`

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!email || !password) return setError('Please fill in all fields.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then log in.')
        setMode('login')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.session)
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="bg-mesh" />
        <div className="bg-grid" />
        <div className="card">
          <div className="logo">
            <div className="logo-icon">🔍</div>
            UX<span>IFY</span>
          </div>

          <div className="card-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</div>
          <div className="card-sub">
            {mode === 'login' ? 'Sign in to analyse your UI designs' : 'Start analysing UI with AI for free'}
          </div>

          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          {mode === 'signup' && (
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? '✦ Sign In' : '✦ Create Account'}
          </button>

          <div className="divider">or</div>

          <div className="toggle-link">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}>
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>

          <div className="features">
            <div className="feature"><span>✦</span> AI-Powered</div>
            <div className="feature"><span>✦</span> Free to use</div>
            <div className="feature"><span>✦</span> Instant results</div>
          </div>
        </div>
      </div>
    </>
  )
}
