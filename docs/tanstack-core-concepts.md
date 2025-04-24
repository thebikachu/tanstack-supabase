Okay, here's a guide breaking down the core concepts of TanStack Start based on the video transcript, with code examples.

---

## Getting Started with TanStack Start: A Practical Guide

This guide walks through the fundamentals of TanStack Start, a full-stack framework for React (and Solid) powered by TanStack Router and Vite. We'll cover project setup, routing, data loading, layouts, and API routes based on the examples shown in the video.

**1. Introduction**

TanStack Start aims to provide a type-safe, client-first, full-stack experience. It leverages:

*   **TanStack Router:** For type-safe file-based routing, layouts, data loading, and more.
*   **Vite:** For fast development and optimized builds.
*   **Key Features:** SSR, Streaming, Server Functions (RPCs), API Routes, bundling.

The presenter has used it to build real applications like a course platform and a site analysis tool (Site Sensei).

**2. Project Setup**

TanStack Start offers various starter templates. We'll use the basic one.

*   **Scaffold a new project:**
    ```bash
    # Replace 'tanstack-todo' with your desired project name
    npx gitpick TanStack/router/tree/main/examples/react/start-basic tanstack-todo
    cd tanstack-todo
    ```
*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
    Your app should now be running, typically at `http://localhost:3000`.

**3. Core Concept: Routing**

TanStack Start uses a **file-based routing** system located in the `src/routes/` directory. The file and folder structure directly maps to the URL paths.

*   **Root Route (`src/routes/__root.tsx`):**
    *   This is the top-level layout for your entire application.
    *   It defines global metadata (head tags), error/not found components, and the main component structure.
    *   The `<Outlet />` component is crucial – it's where child routes will be rendered.

    ```typescript
    // src/routes/__root.tsx (Simplified Structure)
    import { Outlet, createRootRoute } from '@tanstack/react-router';
    import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'; // Optional Devtools

    // Define metadata, links, error components etc.
    export const Route = createRootRoute({
      component: RootComponent,
      notFoundComponent: () => <div>Not Found!</div>,
      // ... other options like errorComponent, meta, links
    });

    function RootComponent() {
      // You might fetch global data or setup context here
      return (
        <>
          {/* Example: Global Header/Footer can go here */}
          <header>My App Header</header>
          <main>
            {/* Child routes render here */}
            <Outlet />
          </main>
          <footer>My App Footer</footer>
          {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </>
      );
    }

    // Often includes the main HTML structure component too
    export function RootDocument({ children }: { children: React.ReactNode }) {
        return (
          <html lang="en">
            <head>
              <meta charSet="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>My TanStack Start App</title>
              {/* Links/Meta defined in createRootRoute are injected */}
            </head>
            <body>
              {children}
              {/* Scripts are injected */}
            </body>
          </html>
        );
    }
    ```

*   **Index Route (`src/routes/index.tsx`):**
    *   Maps to the root URL (`/`).
    *   Defines its component using `createFileRoute`.

    ```typescript
    // src/routes/index.tsx
    import { createFileRoute, Link } from '@tanstack/react-router';

    export const Route = createFileRoute('/')({
      component: HomeComponent,
    });

    function HomeComponent() {
      return (
        <div>
          <h1>Welcome Home!</h1>
          <Link to="/users/$userId" params={{ userId: 'cody' }}>
             Go to Cody's User Page
          </Link>
           <br />
           <Link to="/another">Go to Another Page</Link>
        </div>
      );
    }
    ```

*   **Creating New Routes (`src/routes/another.tsx`):**
    *   Simply create a new `.tsx` file in the `routes` directory.
    *   The filename becomes the path segment.

    ```typescript
    // src/routes/another.tsx
    import { createFileRoute } from '@tanstack/react-router';

    export const Route = createFileRoute('/another')({
      component: AnotherComponent,
    });

    function AnotherComponent() {
      return <div>Hello from /another!</div>;
    }
    ```

*   **Linking Between Routes:**
    *   Use the `<Link />` component imported from `@tanstack/react-router`.
    *   The `to` prop is **type-safe**! It provides autocompletion for valid routes defined in your `src/routes` directory.
    *   For dynamic routes, pass parameters using the `params` prop.

    ```typescript
    // Inside a component (e.g., src/routes/index.tsx)
    import { Link } from '@tanstack/react-router';

    // Link to a static route
    <Link to="/another">Go to Another Page</Link>

    // Link to a dynamic route
    <Link to="/users/$userId" params={{ userId: 'cody' }}>
        Go to Cody's User Page
    </Link>
    ```

*   **Dynamic Routes / Path Parameters (`src/routes/users.$userId.tsx`):**
    *   Use a dollar sign (`$`) prefix in the filename to denote a dynamic segment (parameter).
    *   Access the parameter value within the component using `Route.useParams()`.

    ```typescript
    // src/routes/users.$userId.tsx
    import { createFileRoute } from '@tanstack/react-router';

    export const Route = createFileRoute('/users/$userId')({
      component: UserComponent,
      // loader: async ({ params }) => { /* ... fetch user data */ } // See Data Loading
    });

    function UserComponent() {
      const { userId } = Route.useParams(); // Get the userId from the URL
      // const userData = Route.useLoaderData(); // Get data from loader

      return (
        <div>
          <h1>User Profile</h1>
          <p>Displaying profile for User ID: {userId}</p>
          {/* Display userData here */}
        </div>
      );
    }
    ```

**4. Core Concept: Data Loading**

TanStack Router integrates data loading directly into routes.

*   **Route Loaders (`loader` function):**
    *   Defined within `createFileRoute` or `createRoute`.
    *   An `async` function that fetches data needed for the route *before* it renders.
    *   **Isomorphic:** Runs on the server during SSR and on the client during client-side navigation.
    *   **Warning:** Because it runs on the client too, **do not put server-only secrets or direct database calls here.** Use it primarily for calling public APIs or Server Functions.
    *   Access loaded data in the component with `Route.useLoaderData()`.

    ```typescript
    // src/routes/users.$userId.tsx (with loader calling Server Function)
    import { createFileRoute } from '@tanstack/react-router';
    import { getUserData } from './-server'; // Assume server function is defined

    export const Route = createFileRoute('/users/$userId')({
      component: UserComponent,
      loader: async ({ params }) => {
        console.log('Loader running for userId:', params.userId);
        // Call a Server Function (or public API)
        const user = await getUserData({ userId: params.userId });
        return { user }; // Data returned here is available via useLoaderData
      },
    });

    function UserComponent() {
      const { userId } = Route.useParams();
      const { user } = Route.useLoaderData(); // Access data fetched by loader

      return (
        <div>
          <h1>User Profile: {userId}</h1>
          {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>Loading user...</p>}
        </div>
      );
    }
    ```

*   **Server Functions (`createServerFn`):**
    *   The **recommended** way to handle server-only logic (database access, using secrets).
    *   Define these functions, often in separate files (e.g., `src/routes/-server.ts` or colocated).
    *   They generate type-safe RPC calls.
    *   Can include a Zod `validator` for input validation.
    *   Call these functions from your `loader` or directly from components using TanStack Query.

    ```typescript
    // src/routes/-server.ts (Example Server Function file)
    import { createServerFn } from '@tanstack/react-start/server';
    import { z } from 'vinxi/zod'; // TanStack Start re-exports Zod via vinxi
    // Assume db is your database client (Prisma, Drizzle, etc.)
    // import { db } from '~/server/db';

    export const getUserData = createServerFn('GET', async (payload: { userId: string }) => {
      console.log('[Server Function] Fetching user:', payload.userId);
      // --- SERVER-ONLY CODE ---
      // Example: await new Promise(res => setTimeout(res, 1000)); // Simulate delay
      // Example: const user = await db.user.findUnique({ where: { id: payload.userId } });
      // --- END SERVER-ONLY CODE ---
      // Dummy data for example
      const user = { id: payload.userId, name: `User ${payload.userId}`, email: `${payload.userId}@example.com` };
      if (!user) {
         throw new Error('User not found');
      }
      return user; // Return data (must be serializable)
    }, {
        // Optional input validation using Zod
        validator: z.object({
            userId: z.string(),
        })
    });

    export const updateUserName = createServerFn('POST', async (payload: { userId: string, newName: string }) => {
         console.log(`[Server Function] Updating user ${payload.userId} name to ${payload.newName}`);
        // --- SERVER-ONLY CODE ---
        // Example: await db.user.update({ where: { id: payload.userId }, data: { name: payload.newName } });
        // --- END SERVER-ONLY CODE ---
        return { success: true, newName: payload.newName };
    }, {
        validator: z.object({
            userId: z.string(),
            newName: z.string().min(3),
        })
    })

    ```

*   **TanStack Query Integration:**
    *   Provides caching, background refetching, loading/error states, optimistic updates, etc. Highly recommended.
    *   Install: `npm install @tanstack/react-query`
    *   Setup Provider (`src/routes/__root.tsx`): Wrap the `<Outlet>` (or relevant part of your app) with `QueryClientProvider`.

        ```typescript
        // src/routes/__root.tsx (Query Setup part)
        import { Outlet, createRootRoute } from '@tanstack/react-router';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import React from 'react';

        const queryClient = new QueryClient(); // Create a client

        export const Route = createRootRoute({
          component: RootComponent,
          // ... other options
        });

        function RootComponent() {
          return (
            // Provide the client to your App
            <QueryClientProvider client={queryClient}>
                 {/* Rest of your root layout */}
                 <Outlet />
                 {/* You might want ReactQueryDevtools here too */}
            </QueryClientProvider>
          );
        }
        ```
    *   Fetching Data (`useQuery` / `useSuspenseQuery`): Call Server Functions within the `queryFn`.

        ```typescript
        // src/routes/users.$userId.tsx (using useQuery)
        import { createFileRoute, Link } from '@tanstack/react-router';
        import { useQuery } from '@tanstack/react-query';
        import { getUserData } from './-server'; // Import server function

        export const Route = createFileRoute('/users/$userId')({
          component: UserComponent,
        });

        function UserComponent() {
          const { userId } = Route.useParams();

          const { data: user, isLoading, isError, error } = useQuery({
            queryKey: ['user', userId], // Unique key for caching
            queryFn: () => getUserData({ userId }), // Call the server function
          });

          if (isLoading) return <div>Loading user data...</div>;
          if (isError) return <div>Error loading user: {error.message}</div>;

          return (
            <div>
              <h1>User Profile: {userId}</h1>
              {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>User not found.</p>}
               <Link to="/">Go Home</Link>
            </div>
          );
        }

        // --- OR using useSuspenseQuery (Requires <React.Suspense> boundary higher up) ---
        /*
        import { useSuspenseQuery } from '@tanstack/react-query';

        function UserComponent() {
          const { userId } = Route.useParams();
          // This will suspend rendering until data is ready or throw an error
          const { data: user } = useSuspenseQuery({
            queryKey: ['user', userId],
            queryFn: () => getUserData({ userId }),
          });

          return ( ... render user data ... );
        }
        */
        ```

**5. Core Concept: Layouts**

Layouts allow sharing UI structure across multiple routes.

*   **Route Layouts (`src/routes/dashboard/route.tsx`):**
    *   Create a folder (e.g., `dashboard`).
    *   Add a `route.tsx` file inside that folder.
    *   This file defines the layout component for all routes *within* the `dashboard` folder. It must include an `<Outlet />` to render the child routes (like `dashboard/index.tsx`).

    ```typescript
    // src/routes/dashboard/route.tsx
    import { Outlet, createFileRoute } from '@tanstack/react-router';

    export const Route = createFileRoute('/dashboard')({
      component: DashboardLayout,
    });

    function DashboardLayout() {
      return (
        <div className="flex">
          <aside className="w-64 bg-gray-100 p-4">
            <h2>Sidebar</h2>
            {/* Navigation links for dashboard */}
          </aside>
          <main className="flex-1 p-4">
             {/* Renders dashboard/index.tsx, dashboard/settings.tsx etc. */}
            <Outlet />
          </main>
        </div>
      );
    }
    ```

*   **Pathless Layouts (`src/routes/dashboard/_other.tsx`):**
    *   Use an underscore (`_`) prefix for the filename (e.g., `_other.tsx`, `_layout.tsx`).
    *   These act as layout components **without** adding a segment to the URL path. They group routes logically under a shared layout.
    *   Routes inside the same folder (or prefixed files like `_other.test.tsx`) will inherit this layout.

*   **Conditional Layouts (`src/routes/__root.tsx`):**
    *   Use the `useRouterState` hook to access the current route's location and conditionally render parts of a layout (like headers/footers).

    ```typescript
    // src/routes/__root.tsx (Conditional Footer Example)
    import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
    // ... other imports

    function RootComponent() {
      const routerState = useRouterState();
      const hideFooter = routerState.location.pathname.includes('/users/'); // Example condition

      return (
        <>
          <header>My App Header</header>
          <main>
            <Outlet />
          </main>
          {!hideFooter && <footer>My App Footer</footer>}
        </>
      );
    }
    ```

**6. Core Concept: API Routes**

Easily create backend API endpoints.

*   Create files inside the `src/routes/api/` directory.
*   Use `createAPIRoute` and export named functions for HTTP methods (GET, POST, PUT, DELETE, etc.).

```typescript
// src/routes/api/test.ts
import { json, createAPIRoute } from '@tanstack/react-start/api';

// Maps to GET /api/test
export const GET = createAPIRoute(async (requestEvent) => {
    console.log('API Route /api/test hit');
    // const { request, params } = requestEvent; // Access request details if needed
    return json({ message: `Hello from /api/test!` });
});

// Maps to POST /api/test
// export const POST = createAPIRoute(async (requestEvent) => {
//     const body = await requestEvent.request.json(); // Read request body
//     console.log('Received POST data:', body);
//     return json({ received: body });
// });
```

**7. Bonus: Routing Structures**

TanStack Router offers flexibility:

*   **Nested Folders (Preferred):** `dashboard/settings/profile.tsx` maps to `/dashboard/settings/profile`. Use `index.tsx` for the folder's root (e.g., `dashboard/index.tsx` for `/dashboard`). `route.tsx` creates layouts for the folder.
*   **Flat Routes:** `dashboard.settings.profile.tsx` also maps to `/dashboard/settings/profile`. Uses `.` as a separator. Less common for complex layouts.
*   **Component Colocation:** You can create folders like `dashboard/-components` (with a hyphen prefix) to store components specific to the dashboard routes without them becoming routes themselves.

---

This covers the main concepts demonstrated. TanStack Start and Router have many more features (search params, redirects, pending states, error boundaries, etc.), so exploring the official documentation is highly recommended!