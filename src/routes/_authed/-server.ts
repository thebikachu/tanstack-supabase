import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getServerSupabase } from '~/utils/supabase'
import { authMiddleware } from '~/middleware/authMiddleware'

type LogoutResponse = {
  error: boolean
  message?: string
}

type AuthCheckResponse = {
  error: boolean
  message?: string
  user?: {
    id: string
    email: string | undefined
    created_at: string
  } | null
}

const authInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type SerializableUser = {
  id: string
  email: string | undefined
  created_at: string
}

type SerializableSession = {
  access_token: string
  expires_at: number | undefined
  refresh_token: string
}

type AuthSuccessResponse = {
  error: false
  data: {
    user: SerializableUser | null
    session: SerializableSession | null
  }
}

type AuthErrorResponse = {
  error: true
  message: string
}

type AuthResponse = AuthSuccessResponse | AuthErrorResponse

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return authInputSchema.parse(data)
  })
  .handler(async ({ data }): Promise<AuthResponse> => {
    const supabase = getServerSupabase()
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      // Map Supabase error messages to more user-friendly messages
      let message = error.message
      switch (error.message) {
        case 'Invalid login credentials':
          message = 'Invalid email or password'
          break
        case 'Email not confirmed':
          message = 'Please confirm your email address before logging in'
          break
        case 'Invalid email or password':
          message = 'The email or password you entered is incorrect'
          break
      }
      
      return {
        error: true,
        message
      }
    }

    if (!authData.user?.email_confirmed_at) {
      return {
        error: true,
        message: 'Email not confirmed'
      }
    }

    return {
      error: false,
      data: {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email,
          created_at: authData.user.created_at,
        } : null,
        session: authData.session ? {
          access_token: authData.session.access_token,
          expires_at: authData.session.expires_at,
          refresh_token: authData.session.refresh_token,
        } : null,
      }
    }
  })

export const signupFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return authInputSchema.parse(data)
  })
  .handler(async ({ data }): Promise<AuthResponse> => {
    console.log('signupFn', data)
    const supabase = getServerSupabase()
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${process.env.VITE_APP_URL}/login`,
      },
    })

    if (error) {
      console.error('Error signing up:', error)
      return {
        error: true,
        message: error.message,
      }
    }

    return {
      error: false,
      data: {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email,
          created_at: authData.user.created_at,
        } : null,
        session: authData.session ? {
          access_token: authData.session.access_token,
          expires_at: authData.session.expires_at,
          refresh_token: authData.session.refresh_token,
        } : null,
      }
    }
  })

export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async (): Promise<LogoutResponse> => {
    const supabase = getServerSupabase()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        error: true,
        message: error.message
      }
    }

    return {
      error: false
    }
  })

type GetCreditsResponse = {
  error: boolean
  message?: string
  credits?: number
}

export const getCredits = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({context}): Promise<GetCreditsResponse> => {
    const user = context.user

    if (!user) {
      return {
        error: true,
        message: 'Not authenticated'
      }
    }

    // TODO: Replace with actual credits fetch from your backend using user.id
    // This is a mock implementation
    const mockCredits = 100

    return {
      error: false,
      credits: mockCredits
    }
  })

export const checkAuthFn = createServerFn({ method: 'GET' })
  .handler(async (): Promise<AuthCheckResponse> => {
    const supabase = getServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return {
        error: true,
        message: error.message
      }
    }

    if (!user) {
      return {
        error: true,
        message: 'Not authenticated'
      }
    }

    return {
      error: false,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    }
  })