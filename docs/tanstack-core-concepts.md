# TanStack Core Concepts

This guide covers the core concepts of our TanStack-based architecture, focusing on routing, data loading, layouts, and authentication.

## 1. Project Structure

```
src/
├── auth/                 # Authentication system
│   └── AuthContext.tsx   # Central auth management
├── routes/
│   ├── _authed/         # Protected routes container
│   │   ├── -server.ts   # Auth server functions
│   │   └── app/         # Protected application routes
│   ├── __root.tsx       # Root layout with AuthProvider
│   ├── _authed.tsx      # Auth layout with protection
│   └── index.tsx        # Public home
├── components/
│   ├── ui/             # Shared UI components
│   └── [feature]/      # Feature-specific components
└── hooks/              # Custom hooks
```

## 2. Authentication System

Our authentication system uses a combination of:
- React Context for state management (AuthContext)
- Server-side Supabase operations
- TanStack Router for protection

### AuthContext Usage

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

### Protected Routes

All routes under `_authed/` are automatically protected:

```typescript
// src/routes/_authed.tsx
export const Route = createFileRoute('/_authed')({
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.navigate({
        to: '/login',
        search: {
          redirect: router.state.location.pathname,
        },
        replace: true
      })
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return <Outlet />
}
```

## 3. Server Functions

Server functions handle all sensitive operations:

```typescript
// src/routes/_authed/-server.ts
export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return authInputSchema.parse(data)
  })
  .handler(async ({ data }) => {
    const supabase = getServerSupabase()
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    // Handle response...
  })
```

## 4. Data Loading

Use TanStack Query for data fetching:

```typescript
function UserProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile(),
  })

  if (isLoading) return <LoadingSpinner />

  return <div>{user.name}</div>
}
```

## 5. Layouts

### Root Layout with Auth

```typescript
// src/routes/__root.tsx
export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  )
}
```

### Feature Layouts

```typescript
// src/routes/_authed/app/route.tsx
export const Route = createFileRoute('/app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}
```

## 6. Navigation

Use type-safe routing with Link component:

```typescript
import { Link } from '@tanstack/react-router'

function Navigation() {
  return (
    <nav>
      <Link to="/app/dashboard">Dashboard</Link>
      <Link to="/app/settings">Settings</Link>
    </nav>
  )
}
```

## 7. Error Handling

Consistent error handling through toast notifications:

```typescript
const { toast } = useToast()

const mutation = useMutation({
  mutationFn: updateProfile,
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
  }
})
```

## Best Practices

1. Always use `useAuth` for authentication state
2. Handle loading states appropriately
3. Keep sensitive operations server-side
4. Use type-safe routing
5. Follow the established folder structure
6. Document new patterns and features

For more detailed documentation on specific topics, see:
- [Auth System Documentation](./auth-system.md)
- [Middleware Documentation](./middleware.md)