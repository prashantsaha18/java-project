import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/catalog')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign in. Check your details and try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div className="library-card">
        <div className="library-card-band" />
        <div style={styles.cardHeader}>
          <span style={styles.cardLabel}>Member sign-in</span>
          <h1 style={styles.title}>Stacks</h1>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="library-card-barcode" aria-hidden="true">
          {barcodeBars.map((w, i) => <span key={i} style={{ width: w }} />)}
        </div>

        <p style={styles.footer}>
          New here? <Link to="/register">Create an account</Link>
        </p>
        <p style={styles.hint}>Admin demo login: admin@library.com / admin123</p>
      </div>
    </div>
  )
}

// A fixed bar-width pattern for the decorative barcode strip — pure visual
// texture on the membership card, not a real scannable code.
const barcodeBars = [2, 1, 3, 1, 1, 2, 1, 4, 1, 2, 1, 1, 3, 2, 1, 1, 4, 1, 2, 1, 1, 3, 1, 2].map(n => `${n}px`)

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--cover-green-dark)',
    padding: '1rem',
  },
  cardHeader: { marginTop: '0.4rem', marginBottom: '1.4rem' },
  cardLabel: {
    display: 'block',
    fontSize: '0.72rem',
    color: 'var(--brass)',
    fontWeight: 600,
    marginBottom: '0.15rem',
  },
  title: { fontSize: '2rem' },
  footer: { textAlign: 'center', fontSize: '0.88rem', marginTop: '1.2rem', color: 'var(--ink-soft)' },
  hint: { textAlign: 'center', fontSize: '0.72rem', color: '#a89a80', marginTop: '0.6rem' },
}
