# Server Function Middleware Guide

This guide details the middleware used within this SaaS template, focusing on authentication and global logging. Middleware intercepts server function requests, enabling shared logic like authentication checks or context enrichment.

## Core Concepts

*   **Interception:** Middleware runs before your server function's main handler.
*   **Context:** Middleware can read and add data to the `context` object, which is then passed to subsequent middleware or the final handler.
*   **Control Flow:** Middleware calls `next()` to proceed to the next step (either another middleware or the handler). It can also throw errors or return responses directly to halt execution.
*   **Type Safety:** Context added by middleware is strongly typed.

## Authentication Middleware (`authMiddleware`)

*   **Location:** `src/middleware/authMiddleware.ts`
*   **Purpose:** Ensures that a server function is only executed by an authenticated user. It also provides the user's identity and JWT access token to the handler function's context.
*   **Mechanism:**
    1.  Uses the `checkAuth` utility (`src/utils/supabase.ts`) which leverages the Supabase server client to verify the user's session using secure cookies.
    2.  If `checkAuth` fails (no valid session), the middleware throws an "Unauthorized" error, preventing the server function handler from running.
    3.  If `checkAuth` succeeds, it retrieves the `user` object and the `accessToken` (JWT) from the session.
    4.  It calls `next({ context: { user, accessToken } })`, making the authenticated user's details and their access token available to the server function handler via the `context` parameter.

*   **Context Provided:**
    ```typescript
    export interface AuthContext {
      user: User; // Supabase User object
      accessToken: string; // JWT access token
    }
    ```

*   **Usage:** Applied to server functions requiring authentication using the `.middleware()` chain method.
    ```typescript
    // src/routes/_authed/-server.ts
    import { authMiddleware } from '~/middleware/authMiddleware';

    export const getCredits = createServerFn({ method: 'GET' })
      .middleware([authMiddleware]) // Apply the middleware
      .handler(async ({ context }) => { // Context now includes user and accessToken
        const userId = context.user.id;
        const token = context.accessToken;
        // ... fetch credits using userId, potentially using token for backend calls
        return { credits: 100 };
      });

    export const spendCreditsFn = createServerFn({ method: 'POST' })
      .middleware([authMiddleware]) // Apply the middleware
      .validator(...) // Input validation
      .handler(async ({ data, context }) => {
        // Use context.accessToken to authorize request to FastAPI backend
        const response = await fetch('http://localhost:8000/test/spend-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${context.accessToken}` // Pass JWT
          },
          body: JSON.stringify(data)
        });
        // ... handle response
      });
    ```

## Global Logging Middleware (`logMiddleware`)

*   **Location:** `src/utils/loggingMiddleware.tsx`
*   **Registration:** Applied globally to *all* server functions via `registerGlobalMiddleware` in `src/global-middleware.ts`.
*   **Purpose:** Provides basic request/response timing information for debugging server function performance.
*   **Mechanism:**
    1.  Uses a preliminary `preLogMiddleware` to capture client-side start time (`clientTime`) and send it to the server.
    2.  On the server, `preLogMiddleware` captures server-side arrival time (`serverTime`) and calculates `durationToServer`. It sends both back to the client.
    3.  The main `logMiddleware` (client-side) receives the context from the server, calculates total round-trip time, and logs the durations.

*   **Output:** Logs timing details to the browser console for each server function call.

## Input Validation (`validator`)

While not technically middleware in the same chainable sense, the `.validator()` method on `createServerFn` serves a similar purpose for input validation *before* the middleware or handler runs.

*   **Mechanism:** Accepts the raw input data passed to the server function. It should parse/validate this data (commonly using a library like Zod).
*   **Type Safety:** The *return type* of the validator function becomes the inferred type of the `data` parameter in the handler.
*   **Error Handling:** If validation fails (e.g., `zod.parse` throws), the server function automatically returns an error response, and the middleware/handler chain is not executed.

```typescript
// src/routes/_authed/-server.ts
import { z } from 'zod';

const authInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => { // Receives raw input
    return authInputSchema.parse(data); // Validate using Zod
  })
  // .middleware(...) // Middleware runs *after* successful validation
  .handler(async ({ data }) => { // 'data' is now typed as { email: string, password: string }
    const { email, password } = data;
    // ... process validated login data
  });
```

## Execution Order

For a server function with validation and middleware:

1.  **Client:** Server function called.
2.  **Client:** Global `logMiddleware` (client part of `preLogMiddleware`) runs, records `clientTime`.
3.  **Network:** Request sent to server.
4.  **Server:** Global `logMiddleware` (server part of `preLogMiddleware`) runs, records `serverTime`, calculates `durationToServer`.
5.  **Server:** `.validator()` runs. If it throws, an error response is sent back immediately.
6.  **Server:** `authMiddleware` runs. If it throws (unauthorized), an error response is sent back. Adds `user` and `accessToken` to context.
7.  **Server:** Server function `.handler()` runs with validated `data` and enriched `context`.
8.  **Network:** Response sent back to client.
9.  **Client:** Global `logMiddleware` (main client part) runs, calculates final durations, logs results.
10. **Client:** Original server function call resolves/rejects.
