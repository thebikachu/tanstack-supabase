# Data Fetching Strategies in TanStack Start

This document explores three different methods for fetching data within a TanStack Start application, using a simple blog post example with a "Related Posts" section. Understanding these methods helps you choose the best approach based on user experience (UX), search engine optimization (SEO), and component structure needs.

**Example Context:**

We have a blog post page (`/about` in the example). On this page, besides the main content, there's a sidebar component (`RelatedPosts`) that needs to fetch and display a list of related blog posts.

## Method 1: Route Loader (`loader`)

This is the most basic TanStack Start approach for fetching data *before* a route component renders.

**Concept:**

*   You define a `loader` function within your route definition (`createFileRoute`).
*   This function typically fetches data (often using `createServerFn` for type-safe server communication).
*   The `loader` function *must* resolve (finish fetching) before the route's component (`RouteComponent`) is rendered.
*   The fetched data is then made available to the component tree via the `Route.useLoaderData()` hook.

**Pros:**

*   **Good for SEO:** Ensures data is present in the initial HTML render, which is beneficial for web crawlers.
*   **Type Safety:** Using `createServerFn` provides end-to-end type safety between your server logic and client component.
*   **Initial Data Guarantee:** The component always receives the data it needs on the initial render (no loading state *within* the component needed for this specific data).

**Cons:**

*   **Blocks Rendering:** The entire route navigation is blocked until the `loader` function completes. If the data fetch is slow, the user sees a blank screen or the previous page for longer, potentially leading to a poor UX.
*   **Less Granular Loading:** You can't easily show loading states for *parts* of the page fetched via the loader; the whole page waits.

**Implementation:**

1.  **Define Server Function (`createServerFn`):** Create a function to fetch data on the server. This abstracts the API endpoint creation.

    ```typescript
    // src/routes/about.tsx (or a separate utility file)
    import { createServerFn } from "@tanstack/react-start";

    // Example Server Function to fetch related posts
    const loaderFn = createServerFn("GET", async () => {
      console.log("Fetching related posts on the server...");
      // Simulate a database call
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay

      // Return the data structure
      return {
        relatedPosts: [
          { title: "Related Post 1", description: "Description 1" },
          { title: "Related Post 2", description: "Description 2" },
          { title: "Related Post 3", description: "Description 3" },
        ],
      };
    });
    ```

2.  **Define Route with Loader:** In your route file, use the `loader` property.

    ```typescript
    // src/routes/about.tsx
    import { createFileRoute } from "@tanstack/react-router";
    import { useLoaderData } from "@tanstack/react-router"; // Import useLoaderData

    export const Route = createFileRoute("/about")({
      component: RouteComponent,
      // Loader function: Calls our server function
      loader: async () => {
        console.log("Route loader executing...");
        const data = await loaderFn(); // Call the server function
        return data; // Return the fetched data
      },
    });

    // Component to display related posts
    function RelatedPosts() {
      // Access data fetched by the route's loader
      const data = Route.useLoaderData(); // Use the specific Route's hook

      return (
        <aside className="w-80 shrink-0 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
          <div className="space-y-4">
            {data.relatedPosts.map((post) => (
              <div
                key={post.title}
                className="border-b border-gray-700 last:border-0 pb-4 last:pb-0"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm">{post.description}</p>
              </div>
            ))}
          </div>
        </aside>
      );
    }

    // Main route component
    function RouteComponent() {
      return (
        <div className="flex gap-8">
          <article className="flex-1">
            <h1 className="text-4xl font-bold mb-4">
              The Future of Web Development
            </h1>
            {/* ... other blog content ... */}
          </article>
          {/* Render the RelatedPosts component */}
          <RelatedPosts />
        </div>
      );
    }
    ```

**Result:** When navigating to `/about`, the page will pause for 2 seconds (due to our simulated delay) before rendering the entire content, including the related posts.

---

## Method 2: Suspense (`useSuspenseQuery`)

This approach leverages React's built-in `<Suspense>` component and TanStack Query's `useSuspenseQuery` hook for a better loading UX.

**Concept:**

*   The main page component (`RouteComponent`) renders *immediately*.
*   The component responsible for fetching data (`RelatedPosts`) is wrapped in a `<Suspense>` boundary.
*   The `<Suspense>` boundary shows a `fallback` UI (e.g., a spinner or skeleton) while the data is loading.
*   Inside `RelatedPosts`, `useSuspenseQuery` is used. This hook integrates with Suspense: it *suspends* rendering of the component until data is ready, triggering the nearest `<Suspense>` fallback.
*   Data fetching happens on the client-side (or potentially streamed from the server depending on TanStack Start/Query setup).

**Pros:**

*   **Better UX:** The main page content loads instantly. Users see immediate feedback (the page structure and a loading indicator for the pending section).
*   **Granular Loading States:** Only the part of the UI waiting for data shows a loader.
*   **Streaming Potential:** Works well with SSR streaming capabilities.

**Cons:**

*   **Client-Side Fetching (typically):** Data might not be present in the *initial* HTML source sent from the server (unless specific pre-fetching strategies are used), which *could* be less ideal for critical SEO content compared to the `loader` method.
*   Requires structuring components with Suspense boundaries.

**Implementation:**

1.  **Remove/Comment Loader from Route:** The route itself no longer needs to block on this data.

    ```typescript
    // src/routes/about.tsx
    import { createFileRoute } from "@tanstack/react-router";
    import React, { Suspense } from "react"; // Import Suspense
    import { useSuspenseQuery } from "@tanstack/react-query"; // Import useSuspenseQuery

    // Define the server function (loaderFn) as in Method 1...

    // Route definition WITHOUT the loader for relatedPosts
    export const Route = createFileRoute("/about")({
      component: RouteComponent,
      // loader: async () => { /* ... potentially load OTHER essential data ... */ }
    });

    // Component to display related posts (modified)
    function RelatedPosts() {
      // Use useSuspenseQuery
      const { data } = useSuspenseQuery({
        queryKey: ["relatedPosts"], // Unique key for this query
        queryFn: () => loaderFn(), // Call the server function to fetch data
      });

      // Data is guaranteed to be available here because Suspense handles loading
      return (
        <div className="space-y-4">
          {data.relatedPosts.map((post) => (
             <div
                key={post.title}
                className="border-b border-gray-700 last:border-0 pb-4 last:pb-0"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm">{post.description}</p>
              </div>
          ))}
        </div>
      );
    }

    // Main route component (modified)
    function RouteComponent() {
      return (
        <div className="flex gap-8">
          <article className="flex-1">
             <h1 className="text-4xl font-bold mb-4">
              The Future of Web Development
            </h1>
            {/* ... other blog content ... */}
          </article>

          {/* Wrap RelatedPosts in Suspense */}
          <aside className="w-80 shrink-0 bg-gray-800 p-6 rounded-lg">
             <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
             <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
               <RelatedPosts />
             </Suspense>
          </aside>
        </div>
      );
    }
    ```

**Result:** When navigating to `/about`, the main blog content and the "Related Posts" title appear instantly. A "Loading..." message shows in the related posts section for 2 seconds, then it's replaced by the actual post list.

---

## Method 3: Standard Query (`useQuery`)

This is the traditional TanStack Query (React Query) approach, primarily for client-side data fetching and manual loading state management.

**Concept:**

*   Similar to Suspense, the main page renders immediately.
*   Inside the `RelatedPosts` component, the standard `useQuery` hook is used.
*   `useQuery` provides explicit loading (`isLoading`, `isFetching`) and error states (`isError`, `error`) that you must handle manually in your component's rendering logic.
*   Data fetching happens on the client-side after the component mounts.

**Pros:**

*   **Maximum Flexibility:** Full control over loading, error, and idle states within the component.
*   **Familiar Pattern:** Well-understood by developers already using React Query/TanStack Query in SPAs.
*   **Good for Non-Critical/Background Data:** Excellent for data that can load after the main content is visible without needing Suspense features.

**Cons:**

*   **Manual State Handling:** Requires explicit checks (`if (isLoading)`, `if (isError)`) in the JSX, which can add boilerplate.
*   **Client-Side Fetching:** Same potential SEO drawback as the Suspense method if data isn't pre-fetched.
*   Can lead to layout shifts if loading/error states aren't handled carefully (e.g., using skeleton loaders).

**Implementation:**

1.  **Route Definition (No Loader):** Same as Method 2, the route doesn't need the loader for this data.
2.  **Modify Component for `useQuery`:**

    ```typescript
    // src/routes/about.tsx
    import { createFileRoute } from "@tanstack/react-router";
    import React from "react";
    import { useQuery } from "@tanstack/react-query"; // Import useQuery

    // Define the server function (loaderFn) as in Method 1...

    export const Route = createFileRoute("/about")({
      component: RouteComponent,
    });

    // Component to display related posts (modified for useQuery)
    function RelatedPosts() {
      // Use useQuery
      const { data, isLoading, isError, error } = useQuery({
        queryKey: ["relatedPosts"], // Unique key
        queryFn: () => loaderFn(),   // Fetch function
      });

      // Manual Loading State Handling
      if (isLoading) {
        // Example Skeleton Loader
        return (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-700 last:border-0 pb-4 last:pb-0">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div> {/* Title Skel */}
                <div className="h-4 bg-gray-700 rounded w-full"></div>   {/* Desc Skel */}
              </div>
            ))}
          </div>
        );
      }

      // Manual Error State Handling
      if (isError) {
        return <div className="text-red-500">Error loading posts: {error.message}</div>;
      }

      // Render Data (add optional chaining ?. just in case data is undefined briefly)
      return (
        <div className="space-y-4">
          {data?.relatedPosts.map((post) => (
             <div
                key={post.title}
                className="border-b border-gray-700 last:border-0 pb-4 last:pb-0"
              >
                <h3 className="text-lg font-medium text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm">{post.description}</p>
              </div>
          ))}
        </div>
      );
    }

    // Main route component (No Suspense needed unless used elsewhere)
    function RouteComponent() {
       return (
        <div className="flex gap-8">
          <article className="flex-1">
             <h1 className="text-4xl font-bold mb-4">
              The Future of Web Development
            </h1>
            {/* ... other blog content ... */}
          </article>
          <aside className="w-80 shrink-0 bg-gray-800 p-6 rounded-lg">
             <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
             {/* Render RelatedPosts directly */}
             <RelatedPosts />
          </aside>
        </div>
      );
    }
    ```

**Result:** Similar to Suspense, the main content loads instantly. The related posts section shows a skeleton loader for 2 seconds, then displays the fetched posts.

---

## Summary & Choosing an Approach

*   **Use `loader`:** When data *must* be available for the initial render (critical for content, SEO), and a slightly longer initial load time is acceptable. Good for primary page content.
*   **Use `useSuspenseQuery` + `<Suspense>`:** When you want a better loading UX for non-critical sections of the page. The page loads instantly, and loading fallbacks are shown for parts fetching data. Integrates well with React's concurrent features. Often the preferred method for secondary content or data loaded after initial interaction.
*   **Use `useQuery`:** When you need fine-grained control over loading/error states or are integrating with existing client-side fetching patterns. Suitable for background fetches or when Suspense isn't desired/needed for a specific component.

Knowing all three allows you to mix and match strategies within your TanStack Start application for the best performance and user experience.

---

**Further Learning:**

*   Check out the official [TanStack Router Docs](https://tanstack.com/router/latest/docs/overview)
*   Explore the [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
*   Join the community Discord (link mentioned in the video, usually found on TanStack websites).

Happy Coding!