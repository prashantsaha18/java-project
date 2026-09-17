import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { TiedStackIllustration } from '../components/Illustrations'

export default function MyBorrows() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/borrow/mine')
      setRecords(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleReturn(id) {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/api/borrow/return/${id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not return this book.')
    } finally {
      setBusyId(null)
    }
  }

  const pillClass = (status) =>
    status === 'OVERDUE' ? 'pill pill-overdue' : status === 'RETURNED' ? 'pill pill-returned' : 'pill pill-active'

  return (
    <div style={styles.page}>
      <h1>My Books</h1>
      <p style={styles.sub}>Up to 3 books at a time. Loans run 14 days; late returns accrue ₹5/day.</p>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p style={styles.sub}>Checking the ledger…</p>
      ) : records.length === 0 ? (
        <div className="empty-state">
          <TiedStackIllustration />
          <p>No borrow slips on file yet — head to the catalog.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {records.map(r => (
            <div key={r.id} className="index-card" style={styles.row}>
              <div style={styles.rowMain}>
                <div>
                  <strong>{r.bookTitle}</strong>
                  <div style={styles.borrowedOn}>borrowed {r.borrowDate}</div>
                </div>
                <span className={pillClass(r.status)}>{r.status}</span>
              </div>

              <div style={styles.rowRight}>
                <span className="due-stamp" style={styles.dueStampInline}>
                  {r.returnDate ? `RETURNED ${r.returnDate}` : `DUE ${r.dueDate}`}
                </span>
                {r.fineAmount > 0 && <span style={styles.fine}>Fine ₹{r.fineAmount.toFixed(2)}</span>}
                {r.status !== 'RETURNED' && (
                  <button
                    className="btn btn-outline"
                    disabled={busyId === r.id}
                    onClick={() => handleReturn(r.id)}
                  >
                    {busyId === r.id ? 'Returning…' : 'Return'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { maxWidth: 820, margin: '0 auto', padding: '2rem 1.5rem 3rem' },
  sub: { color: 'var(--ink-soft)', fontSize: '0.9rem', marginTop: '0.2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.9rem', marginTop: '1.4rem' },
  row: {
    padding: '1rem 1.2rem 1rem 1.6rem', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem',
  },
  rowMain: { display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: 220 },
  borrowedOn: { fontSize: '0.76rem', color: 'var(--ink-soft)', marginTop: '0.15rem' },
  rowRight: { display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' },
  dueStampInline: { transform: 'rotate(-6deg)', display: 'inline-block' },
  fine: { color: 'var(--stamp)', fontWeight: 600, fontSize: '0.85rem' },
}
