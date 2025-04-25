# SaaS Template with TanStack Router

A modern SaaS template built with React, TypeScript, and TanStack Router, featuring authentication, protected routes, and a clean architecture.

## Features

- 🔐 Authentication with Supabase (auth only)
- 🛡️ Protected routes under /app
- 🎨 Styled with Tailwind CSS and Framer Motion
- 📡 Type-safe routing with TanStack Router
- 🔄 Server state management with TanStack Query
- 🏗️ Clean architecture with feature-based organization

## Tech Stack

- Frontend: React + TypeScript + Vite
- Routing: TanStack Router
- State Management: TanStack Query
- Styling: Tailwind CSS + Framer Motion
- Authentication: Supabase (auth only)
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
├── routes/
│   ├── _authed/           # Protected routes container
│   │   ├── -server.ts     # Auth server functions
│   │   └── app/          # Protected application routes
│   │       ├── alerts/
│   │       ├── billing/
│   │       ├── dashboard/
│   │       └── settings/
│   ├── __root.tsx         # Root layout
│   ├── _authed.tsx        # Auth layout
│   └── index.tsx          # Public home
├── components/
│   ├── ui/               # Shared UI components
│   └── [feature]/        # Feature-specific components
└── hooks/                # Custom hooks
```

## Documentation

For detailed documentation, see:
- docs/tanstack-core-concepts.md (Architecture)
- docs/middleware.md (Server functions)
- docs/auth-system.md (Authentication)

## Important Notes

- Supabase is used for authentication ONLY, not for database access
- All sensitive operations happen server-side
- Protected routes are under the /app path
- Follow the existing patterns for consistency
