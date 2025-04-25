import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Overview</h2>
      <p className="text-muted-foreground">
        Recent activity and important updates will be shown here.
      </p>
      <div className="border rounded-lg p-4 text-sm text-muted-foreground">
        No recent activity to display.
      </div>
    </div>
  )
}