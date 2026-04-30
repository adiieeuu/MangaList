import { useState, useMemo, useEffect } from 'react'
import './MangaDashboard.css'

/* ─── persistence ─────────────────────────────── */
const STORE_KEY = 'manga_list_v1'

const SEED = [
  { id: 1, title: 'One Piece',     genre: 'Adventure, Fantasy', author: 'Eiichiro Oda',    status: 'Ongoing',  url: 'https://mangaplus.shueisha.co.jp', imageUrl: '' },
  { id: 2, title: 'Berserk',       genre: 'Dark Fantasy',       author: 'Kentaro Miura',   status: 'Finished', url: 'https://berserk.fandom.com',        imageUrl: '' },
  { id: 3, title: 'Vinland Saga',  genre: 'Historical, Action', author: 'Makoto Yukimura', status: 'Ongoing',  url: 'https://kodansha.us',               imageUrl: '' },
]

function loadList() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? SEED }
  catch { return SEED }
}

function saveList(list) {
  localStorage.setItem(STORE_KEY, JSON.stringify(list))
}

/* ─── helpers ─────────────────────────────────── */
const EMPTY_FORM = { title: '', author: '', genre: '', status: 'Ongoing', url: '', imageUrl: '' }

function nextId(list) {
  return list.length ? Math.max(...list.map(m => m.id)) + 1 : 1
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */
export default function MangaDashboard({ onLogout }) {
  const [list,      setList]      = useState(loadList)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [selId,     setSelId]     = useState(null)
  const [filter,    setFilter]    = useState('All')
  const [search,    setSearch]    = useState('')

  /* persist on every change */
  useEffect(() => saveList(list), [list])

  const selected = list.find(m => m.id === selId) ?? null

  /* ── filtered view ── */
  const visible = useMemo(() => {
    const q = search.toLowerCase()
    return list.filter(m => {
      if (filter !== 'All' && m.status !== filter) return false
      if (!q) return true
      return (
        m.title?.toLowerCase().includes(q) ||
        m.author?.toLowerCase().includes(q) ||
        m.genre?.toLowerCase().includes(q)
      )
    })
  }, [list, filter, search])

  /* ── counts ── */
  const ongoing  = list.filter(m => m.status === 'Ongoing').length
  const finished = list.filter(m => m.status === 'Finished').length

  /* ── handlers ── */
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSelect = (manga) => {
    setSelId(manga.id)
    setForm({
      title:    manga.title    ?? '',
      author:   manga.author   ?? '',
      genre:    manga.genre    ?? '',
      status:   manga.status   ?? 'Ongoing',
      url:      manga.url      ?? '',
      imageUrl: manga.imageUrl ?? '',
    })
  }

  const handleAdd = () => {
    if (!form.title.trim()) return
    const newManga = { ...form, id: nextId(list) }
    const updated = [...list, newManga]
    setList(updated)
    setSelId(newManga.id)
  }

  const handleEdit = () => {
    if (!selId || !form.title.trim()) return
    setList(list.map(m => m.id === selId ? { ...m, ...form } : m))
  }

  const handleDelete = () => {
    if (!selId) return
    if (!window.confirm(`Delete "${selected?.title}"?`)) return
    setList(list.filter(m => m.id !== selId))
    setSelId(null)
    setForm(EMPTY_FORM)
  }

  const handleClear = () => {
    setSelId(null)
    setForm(EMPTY_FORM)
  }

  const handleLogout = () => {
    if (window.confirm('Return to login?')) onLogout()
  }

  /* ════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════ */
  return (
    <div className="dash">

      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header-left">
          <span className="dash-header-icon">📚</span>
          <h1>MANGA LIST SYSTEM</h1>
        </div>

        <div className="dash-stats">
          <div className="dash-stat">
            <div className="dash-stat-val">{list.length}</div>
            <div className="dash-stat-lbl">Total</div>
          </div>
          <div className="dash-divider" />
          <div className="dash-stat">
            <div className="dash-stat-val" style={{ color: 'var(--ongoing)' }}>{ongoing}</div>
            <div className="dash-stat-lbl">Ongoing</div>
          </div>
          <div className="dash-divider" />
          <div className="dash-stat">
            <div className="dash-stat-val" style={{ color: 'var(--finished)' }}>{finished}</div>
            <div className="dash-stat-lbl">Finished</div>
          </div>
        </div>

        <button className="dash-logout-btn" onClick={handleLogout}>
          ↩ LOGOUT
        </button>
      </header>

      {/* ── Body ── */}
      <div className="dash-body">

        {/* ── Left detail panel ── */}
        <aside className="detail-panel">
          {selected ? (
            <>
              <div className="detail-cover">
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.title}
                    onError={e => { e.currentTarget.style.display='none' }} />
                ) : (
                  <div className="cover-placeholder">
                    <span>📖</span>
                    <span>No Cover</span>
                  </div>
                )}
              </div>

              <div className="detail-info">
                <DetailRow label="Title"  value={selected.title} />
                <DetailRow label="Author" value={selected.author} />
                <DetailRow label="Genre"  value={selected.genre} />
                <DetailRow label="Status" value={selected.status}
                  valueStyle={{ color: selected.status === 'Ongoing' ? 'var(--ongoing)' : 'var(--finished)', fontWeight: 600 }} />
                {selected.url && selected.url !== '-' && (
                  <div className="detail-row">
                    <label>Website</label>
                    <a href={selected.url} target="_blank" rel="noopener noreferrer">
                      Open link ↗
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <span style={{ fontSize: 36 }}>📚</span>
              <p>Select a manga to see details</p>
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="dash-main">

          {/* ── Form ── */}
          <div className="manga-form">
            {/* Row 1: Title | Author | Add / Delete */}
            <div className="form-row">
              <FormField label="Manga Title" value={form.title}
                onChange={v => setField('title', v)} placeholder="e.g. One Piece" />
              <FormField label="Author" value={form.author}
                onChange={v => setField('author', v)} placeholder="e.g. Eiichiro Oda" />
              <div className="form-btns">
                <button className="form-btn add"    onClick={handleAdd}>+ ADD</button>
                <button className="form-btn delete" onClick={handleDelete} disabled={!selId}>DEL</button>
              </div>
            </div>

            {/* Row 2: Genre | Status | Edit / Clear */}
            <div className="form-row">
              <FormField label="Genre" value={form.genre}
                onChange={v => setField('genre', v)} placeholder="e.g. Action, Fantasy" />
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value)}>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
              <div className="form-btns">
                <button className="form-btn edit"  onClick={handleEdit}  disabled={!selId}>EDIT</button>
                <button className="form-btn clear" onClick={handleClear}>CLEAR</button>
              </div>
            </div>

            {/* Row 3: URL | Cover URL */}
            <div className="form-row">
              <FormField label="Website URL" value={form.url}
                onChange={v => setField('url', v)} placeholder="https://..." />
              <FormField label="Cover Image URL" value={form.imageUrl}
                onChange={v => setField('imageUrl', v)} placeholder="https://image.url/cover.jpg" />
              {/* spacer to align with btn columns above */}
              <div style={{ width: 178, flexShrink: 0 }} />
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="dash-toolbar">
            <div className="filter-btns">
              {['All', 'Ongoing', 'Finished'].map(f => (
                <button
                  key={f}
                  className={`filter-btn${filter === f ? ' active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                  {f === 'Ongoing'  && <span className="filter-badge">{ongoing}</span>}
                  {f === 'Finished' && <span className="filter-badge">{finished}</span>}
                </button>
              ))}
            </div>

            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title, author, genre…"
              />
            </div>
          </div>

          {/* ── Table ── */}
          {visible.length === 0 ? (
            <div className="table-empty">
              <span style={{ fontSize: 32 }}>📭</span>
              <p>{search || filter !== 'All' ? 'No results found.' : 'No manga yet — add some!'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {['#', 'Title', 'Genre', 'Author', 'Status', 'URL'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m, i) => (
                    <tr
                      key={m.id}
                      className={m.id === selId ? 'tr-selected' : ''}
                      onClick={() => handleSelect(m)}
                    >
                      <td className="td-num">{i + 1}</td>
                      <td className="td-title">{m.title}</td>
                      <td className="td-sub">{m.genre || '—'}</td>
                      <td className="td-sub">{m.author || '—'}</td>
                      <td>
                        <span className={`status-badge ${m.status === 'Ongoing' ? 'ongoing' : 'finished'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td>
                        {m.url && m.url !== '-' ? (
                          <a href={m.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}>
                            {m.url.replace(/^https?:\/\//, '')}
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

/* ─── Small sub-components ────────────────────── */
function DetailRow({ label, value, valueStyle = {} }) {
  return (
    <div className="detail-row">
      <label>{label}</label>
      <span style={valueStyle}>{value || '—'}</span>
    </div>
  )
}

function FormField({ label, value, onChange, placeholder }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}