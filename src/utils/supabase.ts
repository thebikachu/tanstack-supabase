import { createServerClient } from '@supabase/ssr'
import { parseCookies, setCookie } from '@tanstack/react-start/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseConfig } from './supabaseConfig'

// Create a singleton instance for server-side auth
export function getServerSupabase() {
  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          const cookies = parseCookies()
          return cookies[name]
        },
        set(name: string, value: string, options: any) {
          setCookie(name, value, { ...getSupabaseConfig().cookieOptions, ...options })
        },
        remove(name: string, options: any) {
          setCookie(name, '', { ...getSupabaseConfig().cookieOptions, ...options, maxAge: 0 })
        }
      }
    }
  )
}

// Helper to check authentication and get JWT for FastAPI
export async function checkAuth() {
  const supabase = getServerSupabase()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (userError || !user || sessionError || !session) {
    throw new Error('Not authenticated')
  }

  return {
    user,
    session,
    // Make JWT available for FastAPI calls
    accessToken: session.access_token
  }
}
