import { Outlet, createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ProtectedNav } from '~/components/ProtectedNav'
import { Footer } from '~/components/Footer'
import { useAuth } from '~/auth/AuthContext'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({
        to: '/login',
        search: {
          redirect: router.state.location.pathname,
        },
        replace: true
      })
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ProtectedNav />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
