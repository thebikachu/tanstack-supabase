import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/settings/security')({
  component: SecuritySettings,
})

function SecuritySettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Security Settings</h2>
      <p className="text-muted-foreground">
        Manage your account security and authentication settings.
      </p>
      {/* Security settings form would go here */}
    </div>
  )
}