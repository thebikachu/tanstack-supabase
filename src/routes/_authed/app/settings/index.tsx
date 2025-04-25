import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/settings/')({
  component: SettingsIndex,
})

function SettingsIndex() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Settings Overview</h2>
      <p className="text-muted-foreground">
        Select a category from the sidebar to manage your settings.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Profile</h3>
          <p className="text-sm text-muted-foreground">
            Update your personal information and preferences
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Security</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account security and authentication
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Configure your notification preferences
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">Connected Accounts</h3>
          <p className="text-sm text-muted-foreground">
            Manage your connected services and integrations
          </p>
        </div>
      </div>
    </div>
  )
}