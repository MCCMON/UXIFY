import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AuthPage from '../components/AuthPage'
import AppMain from '../components/AppMain'

export default function Home() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) setShowAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0a0f2e', color: '#f0f4ff', fontFamily: 'sans-serif', flexDirection: 'column', gap: 16
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(108,53,222,0.2)',
          borderTopColor: '#6c35de', borderRightColor: '#2d5fff',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ color: '#5a6b8a', fontSize: 14 }}>Loading UXIFY...</div>
      </div>
    )
  }

  // Show auth modal overlay
  if (showAuth && !session) {
    return <AuthPage onAuth={(session) => { setSession(session); setShowAuth(false) }} onClose={() => setShowAuth(false)} />
  }

  return (
    <AppMain
      session={session}
      onSignOut={handleSignOut}
      onAuthRequired={() => setShowAuth(true)}
    />
  )
}
