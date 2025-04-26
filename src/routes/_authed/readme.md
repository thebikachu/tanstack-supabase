# Protected Routes Documentation

This directory contains all protected routes that require authentication. The authentication is handled through our AuthContext pattern.

## Authentication Flow

1. All routes under this directory are protected by the AuthContext in `_authed.tsx`
2. When accessing these routes:
   - AuthContext checks if user is authenticated
   - Shows loading spinner during check
   - Redirects to login if unauthenticated
   - Renders route content if authenticated

## Server Functions

All authentication-related server functions are in `-server.ts`:
- `checkAuthFn`: Verifies authentication status
- `loginFn`: Handles user login
- `signupFn`: Handles user registration
- `logoutFn`: Handles user logout
- `getCredits`: Example of a protected server function

## Usage

Protected routes automatically have access to the auth state through the `useAuth` hook:

```typescript
function ProtectedComponent() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      Welcome {user?.email}
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Important Notes

1. All Supabase operations happen server-side
2. Use the `useAuth` hook for auth state
3. Protected routes show loading states during auth checks
4. Auth state refreshes automatically on:
   - Tab focus
   - Network reconnection