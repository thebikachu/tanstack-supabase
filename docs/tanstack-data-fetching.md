# Data Fetching Strategies in This Template

This document outlines the primary methods for fetching data within this TanStack Start application template, illustrating how TanStack Router and TanStack Query are used together. Understanding these helps in choosing the best approach based on user experience (UX), search engine optimization (SEO), and component structure.

## Method 1: Route Loader (`loader`)

This is the standard TanStack Router approach for fetching data *before* a route component renders, ensuring data is available immediately for SEO and initial paint.

**Concept:**

*   Define a `loader` function within your route definition (`createFileRoute`).
*   This function fetches data, often using `createServerFn` for type-safe server communication (e.g., `fetchPost` in `src/utils/posts.tsx`).
*   The `loader` *must* complete before the route component renders. Navigation is blocked until data is ready.
*   Data is accessed in the component via `Route.useLoaderData()`.

**Use Case in Template:**

*   Fetching individual blog posts (`src/routes/posts.$postId.tsx`). The post content is critical for the initial render and SEO.

**Pros:**

*   **SEO Friendly:** Data is included in the initial server-rendered HTML.
*   **Type Safety:** `createServerFn` ensures type consistency.
*   **Data Guarantee:** Component receives data on initial render, simplifying state management within the component itself for this data.

**Cons:**

*   **Blocks Rendering:** Slow fetches delay page rendering, potentially impacting UX.
*   **Less Granular Loading:** The entire route transition waits; difficult to show partial loading states for loader-fetched data.

**Implementation Example (Simplified from `posts.$postId.tsx`):**

```typescript
// src/routes/posts.$postId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchPost } from '../utils/posts' // Server function

export const Route = createFileRoute('/posts/$postId')({
  // Loader fetches data before component renders
  loader: ({ params: { postId } }) => fetchPost({ data: postId }),
  component: PostComponent,
})

function PostComponent() {
  // Access data fetched by the loader
  const post = Route.useLoaderData()

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  )
}

// src/utils/posts.tsx
import { createServerFn } from '@tanstack/react-start'

export const fetchPost = createServerFn({ method: 'GET' })
  .validator((d: string) => d) // Validate input is a string (postId)
  .handler(async ({ data: postId }) => {
    // ... fetch logic using postId ...
    const post = await fetchFromApi(`/posts/${postId}`);
    if (!post) throw notFound(); // Example error handling
    return post;
  })
```

---

## Method 2: Suspense (`useSuspenseQuery`)

This approach uses React's `<Suspense>` and TanStack Query's `useSuspenseQuery` for a non-blocking UX, showing fallbacks while data loads.

**Concept:**

*   The main route component renders immediately.
*   Components needing data are wrapped in `<Suspense fallback={...}>`.
*   Inside the component, `useSuspenseQuery` initiates the fetch. It *suspends* rendering, triggering the nearest `<Suspense>` fallback.
*   Fetching typically occurs client-side after the initial render, or can be integrated with SSR streaming.

**Use Case in Template:**

*   Fetching dashboard statistics (`src/routes/_authed/app/dashboard/route.tsx` and `index.tsx`). The main dashboard layout renders instantly, while stats load in designated areas.
*   Fetching billing information (`src/routes/_authed/app/billing/index.tsx`).

**Pros:**

*   **Improved UX:** Faster initial page load. Users see content structure and loading indicators quickly.
*   **Granular Loading:** Only sections waiting for data show fallbacks (spinners, skeletons).
*   **React Concurrent Features:** Integrates smoothly with modern React patterns.

**Cons:**

*   **SEO Considerations:** Data fetched this way might not be in the *initial* HTML source (unless prefetching/SSR streaming is carefully configured), potentially impacting SEO for that specific data compared to `loader`.
*   **Requires Suspense Boundaries:** Need to structure components appropriately.

**Implementation Example (Simplified from `dashboard/index.tsx`):**

```typescript
// src/routes/_authed/app/dashboard/index.tsx
import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getDashboardStats } from './-server' // Server function
import { DashboardSkeleton } from './DashboardSkeleton' // Fallback component

export const Route = createFileRoute('/_authed/app/dashboard/')({
  component: DashboardIndex,
  // No loader needed for stats here
})

function DashboardContent() {
  // useSuspenseQuery triggers Suspense
  const { data } = useSuspenseQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  // Data is guaranteed here due to Suspense
  return (
    <div>
      <h2>Activity Overview</h2>
      {/* ... render stats using data ... */}
    </div>
  )
}

function DashboardIndex() {
  return (
    // Wrap the data-dependent component in Suspense
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
```

---

## Method 3: Standard Query (`useQuery`)

The traditional TanStack Query approach, offering manual control over loading and error states, primarily for client-side fetching.

**Concept:**

*   The route component renders immediately.
*   Inside the component, `useQuery` is used.
*   `useQuery` provides explicit boolean states (`isLoading`, `isError`) and data/error objects that you must handle conditionally in your JSX.
*   Fetching starts after the component mounts.

**Use Case in Template:**

*   Fetching user credits in the protected navigation (`src/components/ProtectedNav.tsx`). The navigation renders, and the credit display updates once fetched, potentially showing a loading state initially.

**Pros:**

*   **Maximum Flexibility:** Fine-grained control over rendering different UI for loading, error, success, and idle states.
*   **Familiar Pattern:** Well-understood for client-side state management.
*   **Good for Background/Non-Critical Data:** Suitable when data can load after the main UI is visible and explicit loading states are desired without using Suspense.

**Cons:**

*   **Manual State Handling:** Requires `if (isLoading)...` / `if (isError)...` checks in JSX, adding boilerplate.
*   **Client-Side Fetching:** Same potential SEO drawback as Suspense if data isn't pre-fetched.
*   **Layout Shifts:** Requires careful handling of loading/error states (e.g., using skeletons) to prevent UI jumps.

**Implementation Example (Simplified from `ProtectedNav.tsx`):**

```typescript
// src/components/ProtectedNav.tsx
import { useQuery } from '@tanstack/react-query';
import { getCredits } from '~/routes/_authed/-server'; // Server function

export function ProtectedNav() {
  // useQuery provides loading and error states
  const { data, isLoading, isError } = useQuery({
    queryKey: ['credits'],
    queryFn: getCredits,
  });

  return (
    <nav>
      {/* ... other nav items ... */}
      <div>
        {isLoading ? (
          <span>Loading credits...</span>
        ) : isError ? (
          <span className="text-red-500">Error</span>
        ) : (
          <span>Credits: {data?.credits ?? 0}</span>
        )}
      </div>
      {/* ... logout button ... */}
    </nav>
  );
}
```

---

## Summary & Choosing an Approach

*   **Use `loader`:** For critical data needed for the initial render (SEO, core content). Accepts slower initial load. (e.g., Blog post content).
*   **Use `useSuspenseQuery` + `<Suspense>`:** For non-critical sections where a fast initial paint and graceful loading fallbacks improve UX. Preferred for secondary content or data loaded after interaction. (e.g., Dashboard stats, Billing info).
*   **Use `useQuery`:** For client-side fetching with manual control over states, often for background data or UI elements that can update after the main content is visible. (e.g., User credits in nav).

This template utilizes all three methods strategically. Choose the appropriate method based on the data's importance for the initial render versus the desired loading experience.