import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Lazy singleton — reads env vars at first access so the consuming app's
// VITE_SUPABASE_URL/KEY are used even when crm-core is pre-built.
let _supabase: SupabaseClient<Database> | null = null

function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase

  // Try runtime config first (set by consuming app), fall back to build-time env
  const url =
    (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) ||
    import.meta.env.VITE_SUPABASE_URL as string
  const key =
    (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) ||
    import.meta.env.VITE_SUPABASE_ANON_KEY as string

  if (!url || !key) {
    throw new Error('Missing Supabase config. Set window.__SUPABASE_URL__ / __SUPABASE_ANON_KEY__ or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.')
  }

  _supabase = createClient<Database>(url, key)
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})
