'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Vérifiez votre email pour confirmer votre compte.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email ou mot de passe incorrect.')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f7f8fa',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1e3a6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 14 14" fill="none" width="16" height="16">
                <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 8.5H10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 800, fontSize: 18, color: '#0f1729', letterSpacing: '-0.5px' }}>
              Alma<span style={{ color: '#1e3a6e' }}>.</span>+
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', padding: '36px 40px', boxShadow: '0 4px 24px rgba(30,58,110,0.08)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f7f8fa', borderRadius: 8, padding: 4, marginBottom: 28 }}>
            {['Se connecter', 'Créer un compte'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsSignup(i === 1); setError(''); setSuccess('') }}
                style={{
                  flex: 1, padding: '9px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
                  background: (i === 1) === isSignup ? '#fff' : 'transparent',
                  color: (i === 1) === isSignup ? '#0f1729' : '#94a3b8',
                  boxShadow: (i === 1) === isSignup ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}
              >{tab}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a' }}>
                {success}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                background: '#1e3a6e', color: '#fff', border: 'none', borderRadius: 9,
                padding: '13px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', opacity: loading ? 0.7 : 1, transition: 'all 0.15s',
                marginTop: 4
              }}
            >
              {loading ? 'Chargement...' : isSignup ? 'Créer mon compte →' : 'Se connecter →'}
            </button>
          </form>

          {!isSignup && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={async () => {
                  if (!email) { setError('Entrez votre email d\'abord.'); return }
                  setLoading(true)
                  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dashboard` })
                  setLoading(false)
                  if (error) setError(error.message)
                  else setSuccess('Email de réinitialisation envoyé.')
                }}
                style={{ fontSize: 12, color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
          7 jours gratuits · CB requise · Annulable à tout moment
        </p>
      </div>
    </div>
  )
}
