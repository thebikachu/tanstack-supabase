# Authentication System Documentation

## Overview

The authentication system is built using Supabase Auth for user management, with all Supabase interactions happening server-side through TanStack Router's server functions. This ensures sensitive operations and tokens are handled securely on the server.

## Integration with TanStack Server Functions

The authentication system leverages TanStack's server functions to handle all Supabase authentication operations server-side. This ensures sensitive operations like token management never reach the client.

### Server Function Structure

Each authentication function follows a consistent pattern:
1. Input validation using Zod schemas
2. Server-side Supabase operation
3. Error handling and user-friendly messages
4. Type-safe response formatting

For example:
```typescript
export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return authInputSchema.parse(data)
  })
  .handler(async ({ data }) => {
    // Server-side Supabase operation
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    // Error handling and response formatting
    // ...
  })
```

## Components

### Server Functions (`src/routes/_authed/-server.ts`)

The authentication system provides four main server functions:

1. `loginFn`: Handles user login
   - Validates email/password using Zod schema
   - Performs server-side login via Supabase
   - Returns user and session data or error messages
   - Includes user-friendly error message mapping

2. `signupFn`: Handles user registration
   - Validates email/password using Zod schema
   - Creates user account via Supabase
   - Configures email confirmation redirect
   - Returns registration status or error messages

3. `logoutFn`: Handles user logout
   - Performs server-side logout via Supabase
   - Returns success/error status

4. `checkAuthFn`: Verifies authentication status
   - Checks current user session server-side
   - Returns user data if authenticated
   - Used for protecting routes

### Route Protection

Protected routes are organized under the `_authed` layout (`src/routes/_authed.tsx`), which:

1. Checks authentication on every route load using `checkAuthFn`
2. Redirects unauthenticated users to login with the original destination saved
3. Provides the authenticated user context to child routes

```typescript
// Example from _authed.tsx
beforeLoad: async ({ location }) => {
  const response = await checkAuthFn()
  if (!response?.data || response.data.error || !response.data.user) {
    throw redirect({
      to: '/login',
      search: {
        redirect: location.pathname.replace('/', '/_authed/'),
      },
    })
  }
  return { user: response.data.user }
}
```

### Navigation Components

The app uses two navigation components based on authentication state:

1. `PublicNav`: Shown to unauthenticated users
   - Displays login/register links
   - Visible on public routes

2. `ProtectedNav`: Shown to authenticated users
   - Displays protected route links
   - Includes logout functionality
   - Uses server-side logout with proper redirect handling

### Redirect Handling

The system implements a robust redirect mechanism:

1. When accessing protected routes while unauthenticated:
   - Current path is saved in login page's search params
   - User is redirected to login page

2. When accessing login/register pages while authenticated:
   - User is automatically redirected to '/app'
   - Uses `checkAuthFn` to verify authentication status
   - Prevents authenticated users from accessing auth pages unnecessarily

3. After successful login:
   - Checks for redirect URL in search params
   - Navigates to saved destination or defaults to dashboard
   - Uses `replace: true` to prevent back-button issues

4. After logout:
   - Redirects to login page
   - Clears any saved redirects
   - Uses `replace: true` to prevent navigation back to protected routes

Example of auth check in login/register routes:
```typescript
export const Route = createFileRoute('/login')({
  loader: async () => {
    const response = await checkAuthFn()
    if (response?.user && !response.error) {
      throw redirect({
        to: '/app',
      })
    }
    return null
  },
  component: LoginPage,
})
```

## Response Types

The server functions use consistent response types for error handling:

```typescript
type AuthResponse = {
  error: boolean
  message?: string
  data?: {
    user: {
      id: string
      email: string
      created_at: string
    } | null
    session: {
      access_token: string
      expires_at: number
      refresh_token: string
    } | null
  }
}
```

## Usage Example

```typescript
// Login with redirect handling
const loginMutation = useMutation({
  fn: loginFn,
  onSuccess: async ({ data: response }) => {
    if (!response.error) {
      await router.invalidate()
      const { redirect } = router.state.location.search
      router.navigate({ 
        to: redirect || '/_authed',
        replace: true
      })
    }
  }
})

// Protected route access
const ProtectedComponent = () => {
  const { user } = Route.useLoaderData() // User data from _authed layout
  return <div>Welcome {user.email}</div>
}
```

## Security Considerations

1. All Supabase interactions happen server-side
2. Sensitive data like tokens never reach the client
3. Protected routes are wrapped in authentication checks
4. Redirects preserve intended destination securely
5. Session management handled by Supabase
6. Input validation using Zod schemas

## Middleware Integration

The authentication system can be extended using TanStack's middleware system for additional functionality:

### Example: Auth Check Middleware

```typescript
import { createMiddleware } from '@tanstack/react-start'
import { getServerSupabase } from '~/utils/supabase'

export const authMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const supabase = getServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error('Unauthorized')
    }

    return next({
      context: { user }
    })
  })
```

### Using with Protected Routes

Apply the middleware to protect specific server functions:

```typescript
export const protectedAction = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // Access authenticated user from context
    const userId = context.user.id
    // ... protected operation logic
  })
```

For more details on middleware usage, see [Middleware Documentation](./middleware.md).