# Authentication System Documentation

## Overview

The authentication system uses a combination of Supabase Auth (server-side only) and React Context for state management. This provides a secure, performant, and user-friendly authentication experience.

## Core Components

### 1. AuthContext (`src/auth/AuthContext.tsx`)

The central piece of our authentication system that provides:
- User state management
- Loading states
- Auto-refresh on tab focus
- Auto-refresh on network reconnection
- Centralized logout functionality

```typescript
const { user, loading, refreshAuth, logout } = useAuth()
```

### 2. Server Functions (`src/routes/_authed/-server.ts`)

All Supabase interactions happen server-side through these functions:
- `checkAuthFn`: Verifies authentication status
- `loginFn`: Handles user login
- `signupFn`: Handles user registration
- `logoutFn`: Handles user logout

### 3. Protected Routes (`src/routes/_authed/`)

Routes under `_authed` are protected by AuthContext:
- Automatic authentication checks
- Loading states during checks
- Redirects for unauthenticated users
- Preserved redirect paths

## Authentication Flow

1. Initial Load:
   - App starts → AuthContext checks auth state
   - Shows loading spinner during check
   - Redirects or renders based on auth state

2. Route Protection:
   - Protected routes check auth state
   - Loading states during checks
   - Automatic redirects if unauthenticated

3. Session Management:
   - Auth state refreshes on tab focus
   - Auth state refreshes on network reconnection
   - Centralized logout handling

4. Login/Register Flow:
   - Form submission → Server function call
   - Server handles Supabase auth
   - AuthContext updates on success
   - Redirect to intended destination

## Usage Examples

### Protected Component
```typescript
function ProtectedComponent() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return <div>Welcome {user?.email}</div>
}
```

### Login Form
```typescript
function LoginForm() {
  const { refreshAuth } = useAuth()
  
  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async () => {
      await refreshAuth()
      // Handle redirect
    }
  })
}
```

## Security Considerations

1. Server-Side Operations:
   - All Supabase interactions happen server-side
   - Tokens never exposed to client
   - Protected routes properly guarded

2. State Management:
   - Auth state cached in memory
   - Auto-refresh mechanisms
   - Clean logout handling

3. Route Protection:
   - Consistent auth checks
   - Loading states prevent flashes
   - Secure redirect handling

## Best Practices

1. Always use `useAuth` hook for auth state
2. Handle loading states appropriately
3. Use server functions for auth operations
4. Follow existing patterns for consistency
5. Never bypass the AuthContext system

## Integration with Other Systems

1. TanStack Query:
   - Used for data fetching
   - Integrates with auth state
   - Handles cache invalidation

2. TanStack Router:
   - Type-safe routing
   - Protected route handling
   - Clean redirect management

3. Supabase:
   - Used for auth only
   - All operations server-side
   - No direct database access

## Error Handling

1. Auth Errors:
   - User-friendly messages
   - Proper error states
   - Clean error recovery

2. Network Issues:
   - Auto-refresh on reconnect
   - Loading states during checks
   - Graceful degradation

## Future Considerations

1. Token Refresh:
   - Auto refresh before expiry
   - Background refresh
   - Session synchronization

2. Multi-Tab Support:
   - State synchronization
   - Logout coordination
   - Session management