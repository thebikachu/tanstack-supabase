# Architecture Overview & Core Concepts

This document provides a high-level overview of the core architectural concepts used in this TanStack Start SaaS template. For in-depth details, please refer to the specific documentation files linked below.

## Key Technologies

*   **Framework:** React with Vite
*   **Routing:** TanStack Router (File-based, Type-safe)
*   **Server Functions:** TanStack Start (`createServerFn`) for RPC-like calls.
*   **Data Fetching/State:** TanStack Query (`useQuery`, `useSuspenseQuery`, `useMutation`)
*   **Authentication:** Supabase Auth (Server-Side only) + React Context (`AuthContext`)
*   **Styling:** Tailwind CSS + shadcn/ui components
*   **Backend (Example):** FastAPI (Python) - Assumed for features like credit spending.

## Core Architectural Patterns

1.  **File-Based Routing:** TanStack Router uses the `src/routes` directory structure to define application routes. Special file/folder naming conventions (`__root.tsx`, `_layout.tsx`, `$param.tsx`, `index.tsx`) control layout nesting and path parameters.

2.  **Server-Centric Operations:** Sensitive logic, especially authentication and direct database/external API interactions, is handled exclusively within **Server Functions** (`-server.ts` files or functions marked with `'use server'`). This keeps credentials and sensitive operations off the client.
    *   See: [Project Server Functions](./server-functions.md)

3.  **Middleware:** Server functions can be enhanced or protected using middleware. This template uses middleware for:
    *   **Authentication (`authMiddleware`):** Verifies user sessions before allowing protected server functions to execute and injects user context.
    *   **Logging (`logMiddleware`):** Globally applied to provide basic timing information for debugging.
    *   See: [Server Function Middleware Guide](./middleware.md)

4.  **Authentication (`AuthContext`)**: A React Context (`src/auth/AuthContext.tsx`) manages the client-side authentication state (user object, loading status). It interacts with server functions (`checkAuthFn`, `loginFn`, `logoutFn`) and handles session refresh logic. Protected routes use this context to gate access.
    *   See: [Authentication System Documentation](./auth-system.md)

5.  **Data Fetching Strategies:** The template utilizes different TanStack Query/Router patterns for data loading based on requirements:
    *   **Route Loaders (`loader`):** Fetch critical data *before* route rendering (good for SEO).
    *   **Suspense (`useSuspenseQuery`):** Fetch data *after* initial render, showing fallbacks (good for UX on non-critical data).
    *   **Standard Query (`useQuery`):** Client-side fetching with manual loading/error state handling.
    *   See: [Data Fetching Strategies](./tanstack-data-fetching.md)

6.  **Layouts:** Nested layouts are defined using `_layout.tsx` files or the root layout `__root.tsx`. The `_authed.tsx` layout specifically handles the authentication check for protected sections.

7.  **UI Components:** Leverages `shadcn/ui` for pre-built, accessible, and customizable components based on Radix UI and Tailwind CSS.

## Project Structure Highlights

```
src/
├── auth/                 # Authentication Context (`AuthContext.tsx`)
├── components/           # Reusable UI components (incl. shadcn/ui)
├── hooks/                # Custom React hooks (e.g., `useMutation`, `useToast`)
├── lib/                  # Utility functions (e.g., `cn` for Tailwind)
├── middleware/           # Server function middleware (`authMiddleware.ts`)
├── routes/               # Application routes (File-based routing)
│   ├── __root.tsx       # Root layout (QueryClient, AuthProvider)
│   ├── _authed/         # Directory for all authenticated routes
│   │   ├── -server.ts   # Server functions requiring auth (or related)
│   │   └── app/         # Main application sections (dashboard, settings, etc.)
│   ├── _authed.tsx      # Layout component for authenticated routes (auth check)
│   ├── index.tsx        # Public landing page
│   ├── login.tsx        # Login page
│   └── register.tsx     # Registration page
├── styles/               # Global CSS (`app.css`)
└── utils/                # Shared utilities (e.g., Supabase client setup, logging)
```

This structure promotes separation of concerns, type safety, and leverages the capabilities of the TanStack ecosystem for building robust web applications.