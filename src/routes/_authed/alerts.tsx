import { createFileRoute } from '@tanstack/react-router'
import { Card } from '~/components/ui/card'

export const Route = createFileRoute('/_authed/alerts')({
  component: AlertsPage,
})

function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and view alerts.
        </p>
      </div>

      <Card className="p-6">
        <div className="text-sm text-muted-foreground">
          No alerts at this time.
        </div>
      </Card>
    </div>
  )
}
