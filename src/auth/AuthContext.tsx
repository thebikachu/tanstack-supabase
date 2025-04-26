// src/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { checkAuthFn, logoutFn } from '~/routes/_authed/-server'
import { useRouter } from '@tanstack/react-router'
import { useToast } from '~/hooks/use-toast'

type User = {
  id: string
  email?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  loggingOut: boolean
  refreshAuth: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const refreshTimer = useRef<number | undefined>(undefined)

  const clearTimer = useCallback(() => {
    if (refreshTimer.current !== undefined) {
      clearTimeout(refreshTimer.current)
      refreshTimer.current = undefined
    }
  }, [])

  const scheduleRefresh = useCallback(
    (expires_at: number) => {
      clearTimer()
      const now = Date.now() / 1000
      const ms = (expires_at - now - 60) * 1000
      refreshTimer.current = window.setTimeout(refreshAuth, Math.max(ms, 30_000))
    },
    [clearTimer],
  )

  const refreshAuth = useCallback(async () => {
    setLoading(true)
    try {
      const response = await checkAuthFn()
      if (response.error || !response.user) {
        setUser(null)
        clearTimer()
        toast({ title: 'Session expired', description: 'Please log in again.', variant: 'destructive' })
        await router.navigate({ to: '/login', search: { redirect: undefined }, replace: true })
      } else {
        setUser(response.user)
        const anyResp = response as any
        if (anyResp.data?.session?.expires_at) {
          scheduleRefresh(anyResp.data.session.expires_at)
        }
      }
    } catch (err) {
      console.error('Auth refresh error', err)
      setUser(null)
      clearTimer()
    } finally {
      setLoading(false)
    }
  }, [clearTimer, router, scheduleRefresh, toast])

  const logout = useCallback(async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      const res = await logoutFn()
      if (!res.error) {
        clearTimer()
        setUser(null)
        toast({ title: 'Logged out', description: 'You have been signed out.' })
        await router.invalidate()
        await router.navigate({ to: '/login', search: { redirect: undefined }, replace: true })
      } else {
        toast({ title: 'Logout failed', description: res.message ?? 'Try again.', variant: 'destructive' })
      }
    } finally {
      setLoggingOut(false)
    }
  }, [clearTimer, router, toast, loggingOut])

  useEffect(() => {
    refreshAuth()
    return clearTimer
  }, [refreshAuth, clearTimer])

  return (
    <AuthContext.Provider value={{ user, loading, loggingOut, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
