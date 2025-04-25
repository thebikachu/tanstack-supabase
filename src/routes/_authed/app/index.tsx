import { createFileRoute, Link } from '@tanstack/react-router'
import { Card } from '~/components/ui/card'

export const Route = createFileRoute('/_authed/app/')({
  component: AppIndex,
})

function AppIndex() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground">
          Quick access to all your important features and information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 hover:bg-accent/50 transition-colors">
          <h2 className="text-lg font-semibold mb-2">Dashboard</h2>
          <p className="text-muted-foreground text-sm mb-4">
            View your analytics and key metrics
          </p>
          <Link to="/app/dashboard" className="text-sm text-primary hover:underline">
            View Dashboard →
          </Link>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors">
          <h2 className="text-lg font-semibold mb-2">Settings</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Manage your account settings and preferences
          </p>
          <Link to="/app/settings" className="text-sm text-primary hover:underline">
            View Settings →
          </Link>
        </Card>

        <Card className="p-6 hover:bg-accent/50 transition-colors">
          <h2 className="text-lg font-semibold mb-2">Billing</h2>
          <p className="text-muted-foreground text-sm mb-4">
            View your subscription and billing history
          </p>
          <Link to="/app/billing" className="text-sm text-primary hover:underline">
            View Billing →
          </Link>
        </Card>
      </div>
    </div>
  )
}
