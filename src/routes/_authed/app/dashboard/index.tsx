import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getDashboardStats } from './-server'
import type { DashboardStats } from './-server'

export const Route = createFileRoute('/_authed/app/dashboard/')({
  component: DashboardIndex,
})

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded"></div>
      <div className="h-4 w-96 bg-gray-200 rounded"></div>
      <div className="border rounded-lg p-4">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

function DashboardContent() {
  const { data } = useSuspenseQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(),
  })

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Overview</h2>
      <p className="text-muted-foreground">
        Recent activity and important updates shown below.
      </p>
      <div className="border rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Total Users Growth:</span> +{data.monthlyGrowth.users}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Active Users Growth:</span> +{data.monthlyGrowth.active}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Revenue Growth:</span> +{data.monthlyGrowth.revenue}%
          </p>
          <p className="text-sm">
            <span className="font-medium">Projects Growth:</span> +{data.monthlyGrowth.projects}
          </p>
        </div>
      </div>
    </div>
  )
}

function DashboardIndex() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}