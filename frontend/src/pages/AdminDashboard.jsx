import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../api/client'
import { DeskLampIllustration } from '../components/Illustrations'

const TABS = ['Books', 'Active Loans', 'Reports']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Books')

  return (
    <div style={styles.page}>
      <div style={styles.headRow}>
        <div>
          <h1>Librarian's desk</h1>
          <p style={styles.sub}>Manage the catalog, watch active loans, and pull reports.</p>
        </div>
        <DeskLampIllustration />
      </div>

      <div className="drawer-front" style={{ marginTop: '1.4rem' }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`drawer-tab ${tab === t ? 'active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={styles.panel} className="drawer-panel" key={tab}>
        {tab === 'Books' && <BooksPanel />}
        {tab === 'Active Loans' && <ActiveLoansPanel />}
        {tab === 'Reports' && <ReportsPanel />}
      </div>
    </div>
  )
}

// ---------- Books ----------

function BooksPanel() {
  const [books, setBooks] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  function emptyForm() {
    return { title: '', author: '', isbn: '', totalCopies: 1, categories: '' }
  }

  async function load() {
    const { data } = await api.get('/api/books')
    setBooks(data)
  }

  useEffect(() => { load() }, [])

  function startEdit(book) {
    setEditingId(book.id)
    setForm({
      title: book.title, author: book.author, isbn: book.isbn,
      totalCopies: book.totalCopies, categories: (book.categories || []).join(', '),
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      totalCopies: Number(form.totalCopies),
      categories: form.categories.split(',').map(s => s.trim()).filter(Boolean),
    }
    try {
      if (editingId) {
        await api.put(`/api/books/${editingId}`, payload)
      } else {
        await api.post('/api/books', payload)
      }
      setForm(emptyForm())
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save this book.')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this book from the catalog?')) return
    await api.delete(`/api/books/${id}`)
    load()
  }

  return (
    <div style={styles.twoCol}>
      <form onSubmit={handleSubmit} className="index-card" style={{ '--card-tilt': '0deg' }}>
        <h3 style={{ marginBottom: '0.9rem', marginLeft: '0.6rem' }}>
          {editingId ? 'Edit book' : 'New accession card'}
        </h3>
        {error && <div className="error-banner">{error}</div>}
        <div className="field">
          <label>Title</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="field">
          <label>Author</label>
          <input required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
        </div>
        <div className="field">
          <label>ISBN</label>
          <input required value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
        </div>
        <div className="field">
          <label>Total copies</label>
          <input type="number" min={1} required value={form.totalCopies}
                 onChange={e => setForm({ ...form, totalCopies: e.target.value })} />
        </div>
        <div className="field">
          <label>Categories (comma-separated)</label>
          <input value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })}
                 placeholder="Computer Science, Fiction" />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-primary" type="submit">{editingId ? 'Save changes' : 'Add to catalog'}</button>
          {editingId && (
            <button type="button" className="btn btn-outline"
                    onClick={() => { setEditingId(null); setForm(emptyForm()) }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="ledger-sheet">
        <table style={styles.table}>
          <thead>
            <tr><th>Title</th><th>Author</th><th className="num">Copies</th><th></th></tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author}</td>
                <td className="num">{b.availableCopies}/{b.totalCopies}</td>
                <td style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn btn-outline" onClick={() => startEdit(b)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---------- Active loans ----------

function ActiveLoansPanel() {
  const [loans, setLoans] = useState([])

  useEffect(() => {
    api.get('/api/borrow/active').then(({ data }) => setLoans(data))
  }, [])

  return (
    <div className="ledger-sheet">
      <table style={styles.table}>
        <thead>
          <tr><th>Book</th><th>Member</th><th className="num">Borrowed</th><th className="num">Due</th><th>Status</th></tr>
        </thead>
        <tbody>
          {loans.map(l => (
            <tr key={l.id}>
              <td>{l.bookTitle}</td>
              <td>{l.memberName}</td>
              <td className="num">{l.borrowDate}</td>
              <td className="num">{l.dueDate}</td>
              <td><span className={l.status === 'OVERDUE' ? 'pill pill-overdue' : 'pill pill-active'}>{l.status}</span></td>
            </tr>
          ))}
          {loans.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--ink-soft)' }}>No active loans.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

// ---------- Reports ----------

function ReportsPanel() {
  const [popular, setPopular] = useState([])
  const [overdue, setOverdue] = useState([])
  const [fines, setFines] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.get('/api/reports/most-borrowed').then(({ data }) => setPopular(data))
    api.get('/api/reports/overdue').then(({ data }) => setOverdue(data))
    api.get('/api/reports/monthly-fines').then(({ data }) => setFines(data))
    api.get('/api/reports/category-trends').then(({ data }) => setCategories(data))
  }, [])

  function downloadCsv(path, filename) {
    api.get(path).then(({ data }) => {
      const blob = new Blob([data], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
      <section>
        <div style={styles.reportHead}>
          <h3>Most borrowed books</h3>
          <button className="btn btn-outline" onClick={() => downloadCsv('/api/reports/most-borrowed/export', 'most-borrowed.csv')}>
            Export CSV
          </button>
        </div>
        <div className="ledger-sheet" style={{ padding: '0.8rem 1rem 0.4rem 2.4rem' }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={popular.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
              <XAxis dataKey="title" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="timesBorrowed" fill="var(--cover-green)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: '0.7rem' }}>Category-wise borrowing</h3>
        <div className="ledger-sheet" style={{ padding: '0.8rem 1rem 0.4rem 2.4rem' }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="timesBorrowed" fill="var(--brass)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: '0.7rem' }}>Monthly fine collection (₹)</h3>
        <div className="ledger-sheet" style={{ padding: '0.8rem 1rem 0.4rem 2.4rem' }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fines}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--rule)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalCollected" stroke="var(--stamp)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <div style={styles.reportHead}>
          <h3>Overdue members</h3>
          <button className="btn btn-outline" onClick={() => downloadCsv('/api/reports/overdue/export', 'overdue-members.csv')}>
            Export CSV
          </button>
        </div>
        <div className="ledger-sheet">
          <table style={styles.table}>
            <thead>
              <tr><th>Member</th><th>Book</th><th className="num">Due</th><th className="num">Days late</th><th className="num">Fine</th></tr>
            </thead>
            <tbody>
              {overdue.map((r, i) => (
                <tr key={i}>
                  <td>{r.memberName}<br /><span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{r.memberEmail}</span></td>
                  <td>{r.bookTitle}</td>
                  <td className="num">{r.dueDate}</td>
                  <td className="num">{r.daysOverdue}</td>
                  <td className="num" style={{ color: 'var(--stamp)', fontWeight: 600 }}>₹{r.fineAmount.toFixed(2)}</td>
                </tr>
              ))}
              {overdue.length === 0 && <tr><td colSpan={5} style={{ color: 'var(--ink-soft)' }}>Nothing overdue right now.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 3rem' },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' },
  sub: { color: 'var(--ink-soft)', fontSize: '0.9rem', marginTop: '0.2rem' },
  panel: {
    background: 'var(--paper-raised)',
    border: '1px solid var(--rule)',
    borderTop: 'none',
    borderRadius: '0 0 3px 3px',
    padding: '1.6rem',
  },
  twoCol: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'flex-start' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  reportHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' },
}
