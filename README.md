# SaaS Template with TanStack Router

A modern SaaS template built with React, TypeScript, and TanStack Router, featuring a robust authentication system, protected routes, and a clean architecture.

## Features

- 🔐 Advanced Authentication System
  - React Context for state management
  - Auto-refresh on tab focus and network reconnection
  - Server-side Supabase operations
  - Clean loading states and error handling
- 🛡️ Protected Routes with AuthContext
  - Automatic auth checks
  - Loading states during verification
  - Secure redirect handling
- 🎨 Styled with Tailwind CSS and Framer Motion
- 📡 Type-safe routing with TanStack Router
- 🔄 Server state management with TanStack Query
- 🏗️ Clean architecture with feature-based organization

## Tech Stack

- Frontend: React + TypeScript + Vite
- Routing: TanStack Router
- State Management: TanStack Query
- Styling: Tailwind CSS + Framer Motion
- Authentication: Supabase (auth only) + React Context
- Backend: FastAPI (Python)

## Development

From your terminal:

```sh
pnpm install
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Project Structure

```
src/
├── auth/                 # Authentication system
│   └── AuthContext.tsx   # Central auth management
├── routes/
│   ├── _authed/         # Protected routes container
│   │   ├── -server.ts   # Auth server functions
│   │   └── app/         # Protected application routes
│   │       ├── alerts/
│   │       ├── billing/
│   │       ├── dashboard/
│   │       └── settings/
│   ├── __root.tsx       # Root layout
│   ├── _authed.tsx      # Auth layout
│   └── index.tsx        # Public home
├── components/
│   ├── ui/             # Shared UI components
│   └── [feature]/      # Feature-specific components
└── hooks/              # Custom hooks
```

## Authentication System

Our authentication system provides:
- Centralized auth state management through React Context
- Automatic session refresh on tab focus and network reconnection
- Server-side Supabase operations for security
- Clean loading states and error handling
- Protected route management
- Type-safe auth operations

For detailed documentation on the auth system, see:
- [Auth System Documentation](docs/auth-system.md)
- [Protected Routes Documentation](src/routes/_authed/readme.md)

## Documentation

For detailed documentation, see:
- [TanStack Core Concepts](docs/tanstack-core-concepts.md) (Architecture)
- [Middleware Documentation](docs/middleware.md) (Server functions)
- [Auth System Documentation](docs/auth-system.md) (Authentication)

## Important Notes

- Supabase is used for authentication ONLY, not for database access
- All sensitive operations happen server-side
- Protected routes are under the /app path
- Follow the existing patterns for consistency
- Use the `useAuth` hook for authentication state
- Always handle loading states appropriately

## Contributing

1. Follow the existing code structure
2. Maintain type safety
3. Handle loading and error states
4. Update documentation as needed
5. Test thoroughly before submitting PRs
