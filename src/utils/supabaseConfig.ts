export const SUPABASE_URL = process.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', SUPABASE_URL)

export const getSupabaseConfig = () => ({
  supabaseUrl: SUPABASE_URL,
  supabaseKey: SUPABASE_ANON_KEY,
  cookieOptions: {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  }
})