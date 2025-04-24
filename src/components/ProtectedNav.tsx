import { Link, useRouter } from '@tanstack/react-router'
import { useMutation } from '~/hooks/useMutation'
import { useToast } from '~/hooks/use-toast'
import { logoutFn } from '~/routes/_authed/-server'

export function ProtectedNav() {
  const router = useRouter()
  const { toast } = useToast()

  const logoutMutation = useMutation({
    fn: logoutFn,
    onSuccess: async ({ data: response }) => {
      if (!response.error) {
        toast({
          title: "Success",
          description: "Successfully logged out",
          variant: "default",
        })
        await router.invalidate()
        router.navigate({
          to: '/login',
          search: { redirect: undefined },
          replace: true // Replace the current entry in history to prevent back button issues
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to logout",
          variant: "destructive",
        })
      }
    }
  })

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                Dashboard
              </Link>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                activeProps={{
                  className: 'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-indigo-500 text-gray-900',
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/alerts"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                activeProps={{
                  className: 'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-indigo-500 text-gray-900',
                }}
              >
                Alerts
              </Link>
              <Link
                to="/settings"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                activeProps={{
                  className: 'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-indigo-500 text-gray-900',
                }}
              >
                Settings
              </Link>
              <Link
                to="/billing"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                activeProps={{
                  className: 'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-indigo-500 text-gray-900',
                }}
              >
                Billing
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <button
              onClick={() => logoutMutation.mutate({})}
              disabled={logoutMutation.status === 'pending'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
            >
              {logoutMutation.status === 'pending' ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}