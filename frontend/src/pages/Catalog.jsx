import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { EmptyShelfIllustration } from '../components/Illustrations'

const TILTS = [-1.4, 0.8, -0.6, 1.2, 0, -1]

export default function Catalog() {
  const [books, setBooks] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [stampedId, setStampedId] = useState(null)
  const [dueDate, setDueDate] = useState(null)

  async function load(q) {
    setLoading(true)
    try {
      const { data } = await api.get('/api/books', { params: q ? { q } : {} })
      setBooks(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSearch(e) {
    e.preventDefault()
    load(query)
  }

  async function handleBorrow(bookId) {
    setBusyId(bookId)
    setMessage(null)
    try {
      await api.post(`/api/borrow/${bookId}`)
      const due = new Date()
      due.setDate(due.getDate() + 14)
      setDueDate(due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }))
      setStampedId(bookId)
      setTimeout(() => setStampedId(null), 2200)
      load(query)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Could not borrow this book.' })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.headRow}>
        <div>
          <h1>Catalog</h1>
          <p style={styles.sub}>{books.length} title{books.length !== 1 ? 's' : ''} in the drawer</p>
        </div>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            placeholder="Search by title or author…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={styles.searchInput}
          />
          <button className="btn btn-outline" type="submit">Search</button>
        </form>
      </div>

      {message && <div className="error-banner">{message.text}</div>}

      {loading ? (
        <p style={styles.sub}>Pulling cards from the drawer…</p>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <EmptyShelfIllustration />
          <p>No cards match that search.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {books.map((book, i) => (
            <div
              key={book.id}
              className="index-card entering"
              style={{
                '--card-tilt': `${TILTS[i % TILTS.length]}deg`,
                position: 'relative', overflow: 'visible',
                animationDelay: `${i * 45}ms`,
              }}
            >
              {stampedId === book.id && (
                <span className="due-stamp animate" style={styles.stamp}>DUE {dueDate}</span>
              )}

              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>{book.title}</h3>
                <span style={styles.isbn}>{book.isbn}</span>
              </div>
              <p style={styles.author}>{book.author}</p>

              {book.categories?.length > 0 && (
                <div style={styles.tags}>
                  {book.categories.map(c => <span key={c} style={styles.tag}>{c}</span>)}
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={book.availableCopies > 0 ? styles.available : styles.unavailable}>
                  {book.availableCopies} of {book.totalCopies} on the shelf
                </span>
                <button
                  className="btn btn-brass"
                  disabled={book.availableCopies === 0 || busyId === book.id}
                  onClick={() => handleBorrow(book.id)}
                >
                  {busyId === book.id ? 'Stamping…' : book.availableCopies === 0 ? 'All checked out' : 'Borrow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 3rem' },
  headRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
  },
  sub: { color: 'var(--ink-soft)', fontSize: '0.9rem', margin: '0.2rem 0 0' },
  searchForm: { display: 'flex', gap: '0.5rem' },
  searchInput: {
    padding: '0.55rem 0.8rem', border: '1px solid var(--rule)', borderRadius: 3,
    background: 'var(--paper-raised)', minWidth: 240,
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.4rem 1.2rem', paddingTop: '0.4rem',
  },
  stamp: {
    position: 'absolute', top: '-14px', right: '14px', zIndex: 2,
    background: 'var(--paper-raised)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginLeft: '0.6rem' },
  cardTitle: { fontSize: '1.05rem', lineHeight: 1.3 },
  isbn: { fontSize: '0.68rem', color: '#a89a80', fontFamily: 'var(--mono)', whiteSpace: 'nowrap' },
  author: { color: 'var(--ink-soft)', fontSize: '0.88rem', margin: '0.3rem 0 0.6rem', marginLeft: '0.6rem' },
  tags: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginLeft: '0.6rem', marginBottom: '0.6rem' },
  tag: {
    fontSize: '0.7rem', background: '#e6dcc0', color: 'var(--ink-soft)',
    padding: '0.15rem 0.5rem', borderRadius: 999,
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginTop: '0.5rem', marginLeft: '0.6rem', gap: '0.6rem', flexWrap: 'wrap',
  },
  available: { fontSize: '0.78rem', color: 'var(--cover-green-dark)' },
  unavailable: { fontSize: '0.78rem', color: 'var(--danger)' },
}
