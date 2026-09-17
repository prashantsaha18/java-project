import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(fullName, email, password)
      navigate('/catalog')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div className="library-card">
        <div className="library-card-band" />
        <div style={styles.cardHeader}>
          <span style={styles.cardLabel}>New membership</span>
          <h1 style={styles.title}>Join Stacks</h1>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Prashant Saha" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="library-card-barcode" aria-hidden="true">
          {barcodeBars.map((w, i) => <span key={i} style={{ width: w }} />)}
        </div>

        <p style={styles.footer}>
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const barcodeBars = [1, 3, 1, 2, 1, 1, 4, 1, 2, 3, 1, 1, 2, 1, 4, 1, 1, 2, 3, 1, 1, 2, 1, 4].map(n => `${n}px`)

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
  title: { fontSize: '1.7rem' },
  footer: { textAlign: 'center', fontSize: '0.88rem', marginTop: '1.2rem', color: 'var(--ink-soft)' },
}
