import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Card } from '~/components/ui/card'

export const Route = createFileRoute('/_authed/app/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          View your analytics and key metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium">Active Users</h3>
          <p className="text-2xl font-bold">891</p>
          <p className="text-xs text-muted-foreground">+5% from last month</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium">Revenue</h3>
          <p className="text-2xl font-bold">$12,345</p>
          <p className="text-xs text-muted-foreground">+8% from last month</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-medium">Active Projects</h3>
          <p className="text-2xl font-bold">23</p>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </Card>
      </div>

      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  )
}