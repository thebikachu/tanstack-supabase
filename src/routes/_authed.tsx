import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedNav } from '~/components/ProtectedNav'
import { Footer } from '~/components/Footer'
import { checkAuthFn } from './_authed/-server'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ location }) => {
    const response = await checkAuthFn()

    console.log('checkAuthFn response', response)

    if (!response?.user || response.error) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      })
    }

    return { user: response.user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
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
