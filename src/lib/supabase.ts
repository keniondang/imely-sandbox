import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Undefined until .env.local has real values (see .env.example) — the app
// still works without it, just falls back to the browser-local overrides
// it always had, so a translator isn't blocked by a missing config.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export interface TranslationRow {
  key: string
  locale: string
  text: string
  updated_at: string
}
