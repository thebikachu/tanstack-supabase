# Authentication System Documentation

## Overview

This project employs a robust authentication system leveraging Supabase for backend authentication operations (handled exclusively server-side) and React Context (`AuthContext`) for managing the user's authentication state within the frontend application. This ensures security by keeping credentials and tokens off the client while providing a reactive state management solution.

## Core Components

### 1. AuthContext (`src/auth/AuthContext.tsx`)

This is the central hub for authentication state in the React application.

*   **Provides:**
    *   `user`: The currently authenticated user object (`{ id, email, created_at }`) or `null`.
    *   `loading`: Boolean indicating if the initial auth check or a refresh is in progress.
    *   `loggingOut`: Boolean indicating if a logout operation is in progress.
    *   `refreshAuth`: Function to manually trigger a re-check of the authentication status with the server.
    *   `logout`: Function to initiate the user logout process.
*   **Features:**
    *   **Initial Auth Check:** On application load, it calls `checkAuthFn` to determine the initial auth state.
    *   **Automatic Session Refresh:** Implements logic (`scheduleRefresh`, `clearTimer`) to proactively refresh the Supabase session *before* it expires based on the `expires_at` timestamp received from the server, ensuring a seamless user experience. It attempts refreshes slightly before expiry or at a minimum interval (e.g., 30 seconds).
    *   **State Management:** Holds the user state and loading indicators, making them available throughout the protected parts of the application via the `useAuth` hook.
    *   **Error Handling:** Uses `react-toast` to display messages for session expiry or logout failures.
    *   **Routing:** Interacts with `@tanstack/react-router` to redirect users upon logout or session expiry.

*   **Usage:** Wrap the application's root (or relevant part) with `<AuthProvider>`. Access context values using the `useAuth()` hook:
    ```typescript
    import { useAuth } from '~/auth/AuthContext';

    function MyComponent() {
      const { user, loading, logout } = useAuth();
      // ... use auth state
    }
    ```

### 2. Server Functions (`src/routes/_authed/-server.ts`)

All direct interactions with Supabase Auth occur within these server-only functions, ensuring API keys and sensitive operations are never exposed to the client.

*   `checkAuthFn`: Verifies the current session status using `supabase.auth.getUser()`. Returns the user object if authenticated, or an error/null otherwise. Used by `AuthContext` for initial load and refresh.
*   `loginFn`: Handles email/password login via `supabase.auth.signInWithPassword`. Includes input validation (Zod schema) and maps Supabase errors to user-friendly messages. Returns user and session data on success.
*   `signupFn`: Handles new user registration via `supabase.auth.signUp`. Includes input validation and configures the email confirmation redirect URL. Returns user/session data (user typically requires email confirmation).
*   `logoutFn`: Handles user logout via `supabase.auth.signOut`.

### 3. Protected Route Layout (`src/routes/_authed.tsx`)

This layout component acts as a gatekeeper for all routes nested within the `/_authed` path segment.

*   **Mechanism:** Uses the `useAuth` hook.
*   **Logic:**
    1.  Checks the `loading` and `user` state from `AuthContext`.
    2.  If `loading` is true, it displays a loading indicator (e.g., spinner).
    3.  If `loading` is false and `user` is `null` (unauthenticated), it performs a client-side redirect to `/login`, preserving the originally intended path in the `redirect` search parameter.
    4.  If `loading` is false and `user` exists, it renders the nested route content via `<Outlet />`.
*   **Includes:** Renders the `ProtectedNav` component for authenticated users.

## Authentication Flow

1.  **Initial Load:**
    *   App loads, `AuthProvider` mounts.
    *   `AuthProvider` calls `checkAuthFn` (server function).
    *   `loading` state is true. Root layout might show minimal UI or a global loader.
    *   `checkAuthFn` returns user status. `AuthProvider` updates `user` and sets `loading` to false. If a session exists and is valid, `scheduleRefresh` is called.
2.  **Accessing Protected Route:**
    *   User navigates to a route under `/_authed`.
    *   `AuthedLayout` component mounts.
    *   It checks `loading` and `user` from `useAuth`.
    *   If `loading`, shows spinner.
    *   If not `loading` and no `user`, redirects to `/login?redirect=...`.
    *   If not `loading` and `user` exists, renders the requested route component via `<Outlet />`.
3.  **Login:**
    *   User submits login form (`/login`).
    *   `loginFn` (server function) is called via `useMutation`.
    *   `loginFn` interacts with Supabase server-side.
    *   On success:
        *   `AuthContext.refreshAuth()` is called to update the context state.
        *   User is redirected to the intended page (original `redirect` path or `/app`).
    *   On failure: A toast notification shows the error.
4.  **Signup:**
    *   User submits registration form (`/register`).
    *   `signupFn` (server function) is called.
    *   `signupFn` interacts with Supabase server-side.
    *   On success: A toast indicates success, user is redirected to `/login` (needs email confirmation).
    *   On failure: A toast shows the error.
5.  **Logout:**
    *   User clicks logout button (e.g., in `ProtectedNav`).
    *   `AuthContext.logout()` is called.
    *   `logoutFn` (server function) is called.
    *   `logoutFn` interacts with Supabase server-side.
    *   On success: `AuthContext` clears user state, clears refresh timer, router cache is invalidated, user is redirected to `/login`.
    *   On failure: A toast shows the error.
6.  **Session Refresh:**
    *   The timer set by `scheduleRefresh` fires before token expiry.
    *   `AuthContext.refreshAuth()` is called, which in turn calls `checkAuthFn`.
    *   Supabase client handles the token refresh internally using the refresh token (managed via secure cookies).
    *   `checkAuthFn` returns the updated user/session state.
    *   `AuthContext` updates its state and schedules the next refresh. If refresh fails (e.g., refresh token expired), the user is logged out.

## Security Considerations

*   **Server-Side Only:** All Supabase client interactions involving credentials or session management happen in server functions (`-server.ts` files). Client-side code only calls these functions.
*   **HTTP-Only Cookies:** Supabase SSR client uses secure, HTTP-Only cookies (configured in `supabaseConfig.ts`) to store session information, mitigating XSS risks.
*   **JWT Handling:** The JWT (`accessToken`) obtained server-side is passed via middleware context (`authMiddleware`) to other server functions needing to authenticate with backend services (like the FastAPI backend). It is *not* stored or directly handled by the client-side React code.
*   **Input Validation:** Zod schemas (`authInputSchema`, `creditSpendSchema`) are used in server functions to validate data received from the client before processing.

## Best Practices within this Template

*   Always use the `useAuth()` hook to access authentication state in components.
*   Place protected routes under the `/_authed` directory structure.
*   Use server functions (`createServerFn`) for any operation involving authentication tokens or sensitive user data.
*   Apply `authMiddleware` to server functions that require an authenticated user.
*   Handle `loading` states provided by `useAuth` and TanStack Query hooks (`useQuery`, `useSuspenseQuery`, `useMutation`) to provide appropriate UI feedback.