// ═══════════════════════════════════════════════════════
//  MangaService.js  —  Supabase backend for Manga List
// ═══════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

const TABLE       = 'manga_list'
const USERS_TABLE = 'users'

// ─────────────────────────────────────────────────────
//  SESSION HELPERS
// ─────────────────────────────────────────────────────
const SESSION_KEY = 'manga_session'

export function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAdmin() {
  const session = getSession()
  return session?.role === 'admin'
}

// ─────────────────────────────────────────────────────
//  SIMPLE HASH
// ─────────────────────────────────────────────────────
function simpleHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h.toString()
}

// ─────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────
export async function login(username, password) {
  const hash = simpleHash(password)

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('username', username)
    .eq('password', hash)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('Invalid credentials')

  saveSession(data)
  return data
}

// ─────────────────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────────────────
export async function register(username, password) {
  if (!username.trim() || !password.trim()) throw new Error('Username and password required')
  if (password.length < 6) throw new Error('Password must be at least 6 characters')

  const hash = simpleHash(password)

  // Check if username already exists
  const { data: existing } = await supabase
    .from(USERS_TABLE)
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (existing) throw new Error('Username already taken')

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert([{ username, password: hash, role: 'user' }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  saveSession(data)
  return data
}

// ─────────────────────────────────────────────────────
//  FETCH — admin sees all, user sees own only
// ─────────────────────────────────────────────────────
export async function fetchManga() {
  const session = getSession()
  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false })

  if (session?.role !== 'admin') {
    query = query.eq('user_id', session?.id)
  }

  const { data, error } = await query
  if (error) throw new Error(`fetchManga: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  ADD
// ─────────────────────────────────────────────────────
export async function addManga(manga) {
  const session = getSession()
  const payload = { ...sanitize(manga), user_id: session?.id }

  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single()

  if (error) throw new Error(`addManga: ${error.message}`)
  return data
}

// ─────────────────────────────────────────────────────
//  EDIT
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
//  DELETE
// ─────────────────────────────────────────────────────
export async function deleteManga(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteManga: ${error.message}`)
}

// ─────────────────────────────────────────────────────
//  REALTIME
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
//  INTERNAL
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