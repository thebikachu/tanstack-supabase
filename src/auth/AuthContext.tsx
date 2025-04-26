import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { checkAuthFn, logoutFn } from '~/routes/_authed/-server'
import { useRouter } from '@tanstack/react-router'
import { useToast } from '~/hooks/use-toast'

type User = {
  id: string
  email: string | undefined
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  refreshAuth: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  async function refreshAuth() {
    setLoading(true)
    try {
      const response = await checkAuthFn()

      if (response.error || !response.user) {
        setUser(null)
      } else {
        setUser(response.user)
      }
    } catch (error) {
      console.error('Auth refresh error', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    const response = await logoutFn()
    if (!response.error) {
      setUser(null)
      toast({
        title: "Success",
        description: "Successfully logged out",
        variant: "default",
      })
      await router.invalidate()
      router.navigate({
        to: '/login',
        search: { redirect: undefined },
        replace: true
      })
    } else {
      toast({
        title: "Error",
        description: response.message || "Failed to logout",
        variant: "destructive",
      })
    }
  }

  // Initial load
  useEffect(() => {
    refreshAuth()
  }, [])

  // Revalidate on tab focus and network reconnection
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshAuth()
      }
    }

    function onOnline() {
      refreshAuth()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('online', onOnline)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}