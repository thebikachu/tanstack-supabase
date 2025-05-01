# SaaS Template Architecture Guidelines

You are an expert in TypeScript, Node.js, React, Vite, TanStack Query, TanStack Router, and Tailwind.

## Core Architecture Principles

1. **Server-First Approach**
   - All sensitive operations happen server-side
   - Use TanStack server functions for API communication
   - Keep client code focused on UI/UX

2. **Authentication System**
   - Supabase for AUTH ONLY - no database access
   - AuthContext pattern for state management
   - Auto-refresh on tab focus and network reconnection
   - Protected routes under _authed/app layout
   - Server-side auth checks using middleware

3. **Tech Stack**
   - Frontend: React + TypeScript + Vite
   - Routing: TanStack Router for type-safe routing
   - State: TanStack Query + React Context
   - Styling: Tailwind CSS + Framer Motion
   - Backend: FastAPI (Python) for business logic
   - Auth: Supabase (auth only) + AuthContext

4. **Code Organization**
   ```
   src/
   ├── auth/                # Authentication system
   │   └── AuthContext.tsx  # Central auth management
   ├── routes/
   │   ├── _authed/        # Protected routes
   │   │   ├── -server.ts  # Auth server functions
   │   │   └── app/        # App routes
   │   ├── __root.tsx      # Root with AuthProvider
   │   └── _authed.tsx     # Auth protection
   ├── components/
   │   ├── ui/            # Shared UI components
   │   └── [feature]/     # Feature components
   └── middleware/        # Server middleware
   ```

5. **Best Practices**
   - Use AuthContext for auth state
   - Handle loading states appropriately
   - Keep sensitive operations server-side
   - Type everything with TypeScript
   - Document significant changes

## Critical Rules

1. NEVER USE SUPABASE FOR DATABASE ACCESS
   - Supabase is for authentication ONLY
   - All database operations through FastAPI

2. Authentication Rules
   - Always use useAuth() hook for auth state
   - Keep auth logic server-side
   - Handle loading states properly
   - Auto-refresh sessions appropriately

3. Code Organization
   - Follow feature-based structure
   - Keep components focused
   - Use proper file naming
   - Maintain clear separation of concerns

4. Documentation
   - Check docs before starting tasks
   - Update docs after changes
   - Keep documentation in sync
   - Use appropriate doc levels:
     * High-level: README.md, .clinerules-code
     * Technical: docs/*.md
     * Implementation: component/feature docs

## Documentation Reference

1. System Architecture:
   - docs/tanstack-core-concepts.md
   - docs/auth-system.md
   - docs/middleware.md

2. Implementation Details:
   - src/routes/_authed/readme.md
   - Component documentation
   - Feature documentation

## Route Structure

1. Public Routes (/)
   - Home, landing pages
   - Login/Register
   - Public information

2. Protected Routes (/app/*)
   - Require authentication
   - Under _authed layout
   - Use AuthContext protection

3. API Routes
   - Server functions
   - Protected with middleware
   - Type-safe operations