import { Outlet, createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '~/components/ui/card'

export const Route = createFileRoute('/_authed/app/settings')({
  component: SettingsLayout,
})

function SettingsLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <Card className="p-4 md:w-64 shrink-0">
          <nav className="space-y-2">
            <Link
              to="/app/settings/profile"
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
              activeProps={{ className: 'bg-accent' }}
            >
              Profile
            </Link>
            <Link
              to="/app/settings/security"
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
              activeProps={{ className: 'bg-accent' }}
            >
              Security
            </Link>
            <Link
              to="/app/settings/notifications"
              className="block px-3 py-2 text-sm rounded-md hover:bg-accent"
              activeProps={{ className: 'bg-accent' }}
            >
              Notifications
            </Link>
          </nav>
        </Card>

        <Card className="p-6 flex-1">
          <Outlet />
        </Card>
      </div>
    </div>
  )
}
