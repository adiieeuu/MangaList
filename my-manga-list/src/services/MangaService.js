// ═══════════════════════════════════════════════════════
//  MangaService.js  —  Supabase backend for Manga List
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bkqbiqsmtflgcujbtiyn.supabase.co'
const supabaseKey = 'sb_publishable_cuZW3wzmnfqFEOvmjjmthQ_Mu1O58mY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Table name ────────────────────────────────────────
const TABLE = 'manga_list'

// ─────────────────────────────────────────────────────
//  FETCH — get all manga, newest first
// ─────────────────────────────────────────────────────
export async function fetchManga() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`fetchManga: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  ADD — insert a new manga row
// ─────────────────────────────────────────────────────
export async function addManga(manga) {
  const payload = sanitize(manga)

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single()

  if (error) throw new Error(`addManga: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  EDIT — update an existing row by id
// ─────────────────────────────────────────────────────
export async function editManga(id, updates) {
  const payload = sanitize(updates)

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`editManga: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  DELETE — remove a row by id
// ─────────────────────────────────────────────────────
export async function deleteManga(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteManga: ${error.message}`)
}

// ─────────────────────────────────────────────────────
//  SEARCH — filter on title / author / genre server-side
// ─────────────────────────────────────────────────────
export async function searchManga(query) {
  const q = query.trim()
  if (!q) return fetchManga()

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .or(
      `title.ilike.%${q}%,` +
      `author.ilike.%${q}%,` +
      `genre.ilike.%${q}%`
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(`searchManga: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  FILTER BY STATUS  ('Ongoing' | 'Finished' | 'All')
// ─────────────────────────────────────────────────────
export async function filterByStatus(status) {
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })

  if (status !== 'All') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw new Error(`filterByStatus: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  REALTIME — subscribe to live changes on the table
// ─────────────────────────────────────────────────────
export function subscribeToManga(onChange) {
  const channel = supabase
    .channel('manga_list_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      (payload) => {
        onChange({
          eventType: payload.eventType,
          newRow:    payload.new,
          oldRow:    payload.old,
        })
      }
    )
    .subscribe()

  return channel
}

// ─────────────────────────────────────────────────────
//  AUTH HELPERS
// ─────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`signIn: ${error.message}`)
  return data.session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(`signOut: ${error.message}`)
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ─────────────────────────────────────────────────────
//  INTERNAL — strip unknown keys, map imageUrl → image_url
// ─────────────────────────────────────────────────────
function sanitize(fields) {
  const allowed = ['title', 'author', 'genre', 'status', 'url', 'image_url']
  const out = {}

  if (fields.imageUrl !== undefined) fields.image_url = fields.imageUrl

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      out[key] = typeof fields[key] === 'string' ? fields[key].trim() : fields[key]
    }
  }
  return out
}