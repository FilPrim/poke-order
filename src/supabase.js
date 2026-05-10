import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const configured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.trim().length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.trim().length > 0

/** True solo se URL e chiave anon sono definiti (build-time con Vite). */
export const isSupabaseConfigured = configured

/** Client Supabase; `null` se mancano le env (evita crash a import con createClient senza URL). */
export const supabase = configured ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim()) : null
