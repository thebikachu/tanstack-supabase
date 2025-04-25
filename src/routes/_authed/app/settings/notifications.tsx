import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/settings/notifications')({
  component: NotificationSettings,
})

function NotificationSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notification Settings</h2>
      <p className="text-muted-foreground">
        Manage your notification preferences and communication settings.
      </p>
      {/* Notification settings form would go here */}
    </div>
  )
}