# TanStack Server Function Middleware Guide

This guide explains how middleware works in our application, with a focus on authentication and server function protection.

## Core Concepts

Middleware intercepts server function requests, allowing you to:
- Verify authentication
- Add context data
- Validate inputs
- Handle errors consistently

### Key Benefits

- **Reusability:** Write auth logic once, apply everywhere
- **Type Safety:** Full TypeScript support for context
- **Separation:** Keep business logic clean
- **Security:** Consistent auth checks

## Authentication Middleware

Our auth middleware provides server-side session verification:

```typescript
// src/middleware/authMiddleware.ts
import { createMiddleware } from '@tanstack/react-start';
import { checkAuth } from '../utils/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  accessToken: string;
}

export const authMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const auth = await checkAuth();

    if (!auth.user) {
      throw new Error('Unauthorized');
    }

    return next({
      context: {
        user: auth.user,
        accessToken: auth.accessToken
      } satisfies AuthContext,
    });
  });
```

### Using Auth Middleware

Apply to server functions that need protection:

```typescript
// Example protected server function
export const getCredits = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({context}): Promise<GetCreditsResponse> => {
    const user = context.user;
    // Access user data safely
    return {
      error: false,
      credits: await fetchUserCredits(user.id)
    };
  });
```

## Input Validation

We use Zod for input validation:

```typescript
const authInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return authInputSchema.parse(data)
  })
  .handler(async ({ data }) => {
    // Data is now validated
    const { email, password } = data;
    // Process login...
  });
```

## Error Handling

Middleware can catch and transform errors:

```typescript
const errorHandlerMiddleware = createMiddleware()
  .server(async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          error: true,
          message: 'Authentication failed'
        };
      }
      throw error; // Let other errors propagate
    }
  });
```

## Context Passing

Share data between middleware and handlers:

```typescript
interface UserContext {
  userId: string;
  permissions: string[];
}

const userContextMiddleware = createMiddleware()
  .server(async ({ next, context }) => {
    const user = context.user; // From auth middleware
    const permissions = await fetchUserPermissions(user.id);
    
    return next({
      context: {
        userId: user.id,
        permissions
      } satisfies UserContext
    });
  });
```

## Best Practices

1. **Authentication First:**
   - Always apply authMiddleware before other middleware
   - Check context.user early in handlers

2. **Type Safety:**
   ```typescript
   interface MyContext {
     user: User;
     permissions: string[];
   }
   
   const handler = async ({ context }: { context: MyContext }) => {
     // TypeScript ensures context properties exist
   };
   ```

3. **Error Handling:**
   - Use specific error types
   - Transform errors into user-friendly responses
   - Log errors appropriately

4. **Validation:**
   - Always validate inputs with Zod
   - Keep validation schemas near related functions
   - Use descriptive error messages

## Common Patterns

### Protected Route Pattern
```typescript
export const protectedAction = createServerFn()
  .middleware([
    authMiddleware,
    userContextMiddleware
  ])
  .handler(async ({ context }) => {
    // Access both auth and user context
    const { user, permissions } = context;
    // ... handler logic
  });
```

### Validation Pattern
```typescript
const inputSchema = z.object({
  // ... schema definition
});

export const validatedAction = createServerFn()
  .validator((data: unknown) => {
    return inputSchema.parse(data);
  })
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // data is typed according to schema
    // context includes auth data
  });
```

## Middleware Order

1. Input Validation
2. Authentication
3. Error Handling
4. Custom Context
5. Handler Logic
