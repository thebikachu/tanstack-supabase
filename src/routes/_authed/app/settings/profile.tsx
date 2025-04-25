import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/app/settings/profile')({
  component: ProfileSettings,
})

function ProfileSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Profile Settings</h2>
      <p className="text-muted-foreground">
        Update your profile information and preferences.
      </p>
      {/* Profile settings form would go here */}
    </div>
  )
}