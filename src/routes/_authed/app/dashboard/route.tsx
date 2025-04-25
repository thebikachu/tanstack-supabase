import { Suspense } from 'react'
import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Card } from '~/components/ui/card'
import { getDashboardStats } from './-server'
import type { DashboardStats } from './-server'

export const Route = createFileRoute('/_authed/app/dashboard')({
  component: DashboardLayout,
})

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function StatsContent() {
  const { data } = useSuspenseQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(),
  })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium">Total Users</h3>
        <p className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">+{data.monthlyGrowth.users}% from last month</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium">Active Users</h3>
        <p className="text-2xl font-bold">{data.activeUsers.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">+{data.monthlyGrowth.active}% from last month</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium">Revenue</h3>
        <p className="text-2xl font-bold">${data.revenue.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">+{data.monthlyGrowth.revenue}% from last month</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-sm font-medium">Active Projects</h3>
        <p className="text-2xl font-bold">{data.activeProjects}</p>
        <p className="text-xs text-muted-foreground">+{data.monthlyGrowth.projects} from last month</p>
      </Card>
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          View your analytics and key metrics.
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>

      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  )
}