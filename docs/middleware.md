# Essential Guide to TanStack Start Server Function Middleware

This guide provides a concise overview of using Middleware with `createServerFn` in TanStack Start, focusing on core concepts and essential examples.

## 1. What is Middleware & Why Use It?

Middleware intercepts server function requests, allowing you to run code *before* your main handler. It's ideal for:

*   **Reusability:** Write logic (auth, logging) once, apply it many times.
*   **Separation of Concerns:** Keep handlers focused on business logic.
*   **Composability:** Chain middleware for complex workflows.
*   **Type Safety:** Great TypeScript support for shared context.

## 2. Core Concepts

*   **`createMiddleware()`:** The starting point for defining any middleware.
*   **Middleware Chain:** Multiple middleware can be applied, executing sequentially.
*   **`next(options?)`:** The **crucial** function inside middleware logic.
    *   `await next()`: Executes the next middleware/handler. **Must be called and its result returned** to proceed.
    *   `throw Error` / No `next()` call: Stops the execution chain (e.g., for failed auth).
    *   `options.context`: Pass data downstream.
    *   `options.sendContext`: Send context between client/server (use specific keys).
    *   `options.headers`: Add headers from client middleware.
*   **`context`:** An object passed through the chain. Middleware can read from and add to it (via `next({ context: ... })`). Type-safe.
*   **`data`:** The input payload sent to the server function. Accessible in middleware.

## 3. Defining Middleware: Key Methods

Middleware is built using `createMiddleware().method(...)`.

### `.server(async ({ next, data, context }) => { ... })`

Defines **server-side** logic. Runs on the server before the handler.

```typescript
import { createMiddleware } from '@tanstack/react-start';

const serverLogger = createMiddleware().server(async ({ next, data }) => {
  console.log('Server MW: Request Data:', data);
  try {
    // *** MUST await and return next() to continue ***
    const result = await next({
      context: { serverTimestamp: Date.now() }, // Add to context
    });
    console.log('Server MW: Response Result:', result);
    return result;
  } catch (error) {
    console.error('Server MW: Error downstream:', error);
    throw error; // Propagate error
  }
});
```

### `.client(async ({ next, data, context }) => { ... })`

Defines **client-side** logic. Runs in the browser *before* the network request.

```typescript
import { createMiddleware } from '@tanstack/react-start';

const clientLogger = createMiddleware().client(async ({ next, data }) => {
  console.log('Client MW: Sending Data:', data);
  const result = await next({
     headers: { 'X-Client-Time': `${Date.now()}` }, // Add request header
     sendContext: { clientMessage: 'Hello from client' } // Send to server context
  });
  console.log('Client MW: Received Result:', result);
  // result.context might contain data sent back from server
  return result;
});
```

### `.validator(validatorFn)`

Validates the `data` payload before it hits `.server()` or nested middleware. Often used with Zod.

```typescript
import { createMiddleware } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const inputSchema = z.object({ name: z.string().min(1) });

const validationMw = createMiddleware({
  // validateClient: true // Optional: validate on client too
})
  .validator(zodValidator(inputSchema))
  .server(async ({ next, data }) => {
    // data is now validated and typed according to inputSchema
    console.log('Validated Name:', data.name);
    return next(); // Proceed if valid
  });
```

### `.middleware([dependencyMw1, ...])`

Specifies dependencies. Ensures `dependencyMw1` runs *before* the current middleware.

```typescript
import { createMiddleware } from '@tanstack/react-start';
import { authMiddleware } from './authMiddleware'; // Assume exists

const requiresAuthMw = createMiddleware()
  .middleware([authMiddleware]) // Ensures auth runs first
  .server(async ({ next, context }) => {
    // Can safely access context.user added by authMiddleware
    console.log('User:', context.user.id);
    return next();
  });
```

## 4. Essential Examples

### Authentication (Server-Side Session Check)

Check user session; stop if invalid, proceed if valid.

```typescript
// src/middleware/authMiddleware.ts
import { createMiddleware } from '@tanstack/react-start';
import { createServerSupabaseClient } from '../lib/supabase/server'; // Your server client creator
import type { User } from '@supabase/supabase-js';

interface AuthContext { user: User }

export const authMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const supabase = createServerSupabaseClient(); // Needs request context access
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('Auth MW: Unauthorized');
      // *** STOP Execution: Throw error, DON'T call next() ***
      throw new Error('Unauthorized');
    }

    console.log('Auth MW: Authorized user:', user.id);
    // *** CONTINUE Execution: Call next() and pass user in context ***
    return next({
      context: { user } satisfies AuthContext,
    });
  });
```

### Validation (Using Zod)

(See `.validator()` example above)

### Passing Context

Add data for downstream use.

```typescript
// src/middleware/configMiddleware.ts
import { createMiddleware } from '@tanstack/react-start';

interface AppConfigContext { config: { featureX: boolean } }

export const configMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const config = { featureX: process.env.FEATURE_X === 'true' };
    return next({
      context: { config } satisfies AppConfigContext,
    });
  });

// Later middleware/handler can access context.config
```

### Adding Client Request Headers

Modify the outgoing request from the client.

```typescript
// src/middleware/apiTokenMiddleware.ts
import { createMiddleware } from '@tanstack/react-start';
import { getApiClientToken } from '../lib/apiClient'; // Client-side token getter

export const apiTokenMiddleware = createMiddleware()
  .client(async ({ next }) => {
    const token = await getApiClientToken();
    return next({
      headers: token ? { 'X-Api-Token': token } : undefined,
    });
  });
```

## 5. Using Middleware with `createServerFn`

Apply middleware using the `.middleware([...])` method on your server function definition.

```typescript
import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from './middleware/authMiddleware';
import { validationMw } from './middleware/validationMiddleware';
import { configMiddleware } from './middleware/configMiddleware';

export const myAction = createServerFn()
  .middleware([
      authMiddleware,   // Checks auth first
      validationMw,   // Then validates
      configMiddleware, // Then adds config context
  ])
  .handler(async ({ payload, context }) => {
    // Runs only if all middleware passed (called next())
    // Access payload (validated data) and context (user, config)
    console.log(`User ${context.user.id} using featureX=${context.config.featureX}`);
    // ... your logic ...
    return { success: true };
  });
```

## 6. Global Middleware

Apply middleware to *all* server functions.

### Registration

Create a file (e.g., `app/global-middleware.ts`) and use `registerGlobalMiddleware`.

```typescript
// app/global-middleware.ts
import { registerGlobalMiddleware } from '@tanstack/react-start';
import { authMiddleware } from './middleware/authMiddleware';
import { serverLogger } from './middleware/serverLogger';

registerGlobalMiddleware({
  // Order matters
  middleware: [serverLogger, authMiddleware],
});
```

### Type Safety Workaround

Global middleware context types aren't automatically inferred locally. **Solution:** Add the global middleware to the *local* `.middleware([...])` array of your server function *just for type inference*. It won't run twice.

```typescript
// src/routes/my-route.ts
import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from './middleware/authMiddleware'; // Import the global one

export const needsAuthTypes = createServerFn()
   // Add global middleware here for types
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    // context.user is now correctly typed!
    console.log(context.user.email);
  });
```

## 7. Execution Order Summary

1.  **Dependencies** (defined via `.middleware([...])` on another middleware)
2.  **Global Middleware** (in registration order)
3.  **Server Function Middleware** (in `.middleware([...])` array order on `createServerFn`)
4.  **Server Function Handler**

## 8. Tree Shaking

*   **Server:** All middleware code included.
*   **Client:**
    *   `.server()` code: **Removed**.
    *   `.validator()` code: Removed unless `validateClient: true`.
    *   `.client()` code: **Included**.