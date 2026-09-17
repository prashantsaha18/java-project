import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DrawerMark } from './Illustrations'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <DrawerMark size={28} />
          <span style={styles.brandText}>
            <span style={styles.brandMark}>Stacks</span>
            <span style={styles.brandSub}>library system</span>
          </span>
        </Link>

        {user && (
          <nav style={styles.nav}>
            <Link to="/catalog" style={styles.link}>Catalog</Link>
            <Link to="/my-borrows" style={styles.link}>My Books</Link>
            {isAdmin && <Link to="/admin" style={styles.link}>Admin</Link>}
            <span style={styles.who}>{user.fullName}</span>
            <button className="btn btn-outline" onClick={handleLogout}>Sign out</button>
          </nav>
        )}
      </div>
    </header>
  )
}

const styles = {
  header: {
    background: 'var(--cover-green)',
    borderBottom: '3px solid var(--brass)',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.5rem',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  brandText: { display: 'flex', flexDirection: 'column', lineHeight: 1 },
  brandMark: {
    fontFamily: 'var(--serif)',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f3eee2',
  },
  brandSub: {
    fontSize: '0.68rem',
    color: '#c9b78f',
    letterSpacing: '0.04em',
  },
  nav: { display: 'flex', alignItems: 'center', gap: '1.3rem' },
  link: { color: '#f3eee2', fontSize: '0.92rem', fontWeight: 500 },
  who: { color: '#c9b78f', fontSize: '0.85rem' },
}

