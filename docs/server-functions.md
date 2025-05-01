# Project Server Functions

This document details the server functions specific to this SaaS template, primarily located in `src/routes/_authed/-server.ts`. These functions handle backend logic, particularly authentication and core features, ensuring sensitive operations remain server-side.

## Authentication Functions

These functions interact with Supabase Auth on the server.

### `loginFn`

*   **Method:** `POST`
*   **Purpose:** Handles user login attempts.
*   **Input Validation:** Uses `zod` schema (`authInputSchema`) requiring `email` (string, valid email format) and `password` (string, min 6 characters).
*   **Process:**
    1.  Receives email and password.
    2.  Calls `supabase.auth.signInWithPassword`.
    3.  Handles potential Supabase errors (e.g., "Invalid login credentials", "Email not confirmed") by returning user-friendly messages.
    4.  Checks if the user's email is confirmed.
*   **Output:** Returns an `AuthResponse` object:
    *   On success (`error: false`): Contains serializable `user` and `session` data.
    *   On failure (`error: true`): Contains an error `message`.

### `signupFn`

*   **Method:** `POST`
*   **Purpose:** Handles new user registration.
*   **Input Validation:** Uses `zod` schema (`authInputSchema`) requiring `email` and `password`.
*   **Process:**
    1.  Receives email and password.
    2.  Calls `supabase.auth.signUp`.
    3.  Configures `emailRedirectTo` for email confirmation flow, pointing back to the application's login page.
*   **Output:** Returns an `AuthResponse` object similar to `loginFn`. A successful signup typically requires email confirmation before login is possible.

### `logoutFn`

*   **Method:** `POST`
*   **Purpose:** Handles user logout.
*   **Process:** Calls `supabase.auth.signOut`.
*   **Output:** Returns a `LogoutResponse` object (`{ error: boolean, message?: string }`).

### `checkAuthFn`

*   **Method:** `GET`
*   **Purpose:** Verifies the current user's authentication status based on server-side session/cookies. Used by `AuthContext` for session validation and refresh.
*   **Process:** Calls `supabase.auth.getUser`.
*   **Output:** Returns an `AuthCheckResponse` object:
    *   On success (`error: false`): Contains the authenticated `user` object.
    *   On failure (`error: true`): Indicates no authenticated user or a Supabase error, includes a `message`.

## Core Feature Functions

These functions require authentication and utilize the `authMiddleware`.

### `getCredits`

*   **Method:** `GET`
*   **Middleware:** `authMiddleware` (Ensures user is authenticated).
*   **Purpose:** Fetches the current credit balance for the authenticated user.
*   **Context:** Accesses `context.user` provided by `authMiddleware`.
*   **Process:** (Currently mocked) Simulates fetching credit data associated with the `user.id`.
*   **Output:** Returns a `GetCreditsResponse` object (`{ error: boolean, message?: string, credits?: number }`).

### `spendCreditsFn`

*   **Method:** `POST`
*   **Middleware:** `authMiddleware`.
*   **Purpose:** Allows authenticated users to spend credits by calling a backend endpoint.
*   **Input Validation:** Uses `zod` schema (`creditSpendSchema`) requiring `amount` (number, min 1) and `action` (string, defaults to 'test_action').
*   **Context:** Accesses `context.user` and `context.accessToken` provided by `authMiddleware`.
*   **Process:**
    1.  Receives `amount` and `action`.
    2.  Makes a `POST` request to the FastAPI backend (`http://localhost:8000/test/spend-credits`).
    3.  Includes the user's `accessToken` (JWT) in the `Authorization` header for the backend request.
    4.  Sends the validated `amount` and `action` in the request body.
*   **Output:** Returns a `CreditSpendResponse` object detailing the transaction result from the backend, including status, credits spent, remaining balance, etc., or an error message.

## Middleware

### `authMiddleware` (`src/middleware/authMiddleware.ts`)

*   **Purpose:** Protects server functions by verifying user authentication before the handler logic runs.
*   **Process:**
    1.  Uses `checkAuth` utility (which calls `supabase.auth.getUser` and `getSession` server-side).
    2.  If authentication fails (no user or session), it throws an 'Unauthorized' error, preventing the handler from executing.
    3.  If authentication succeeds, it passes the `user` object and `accessToken` (JWT) to the handler via the `context` object.
*   **Usage:** Applied to server functions like `getCredits` and `spendCreditsFn` that require user authentication.
