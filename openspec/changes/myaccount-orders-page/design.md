## Context

The `/myaccount/orders` route already exists as a TanStack Router file-based route but renders only a placeholder div. The surrounding account shell (`/myaccount`) provides a sidebar with navigation, so the orders page only needs to populate the `<Outlet>` area. The project already uses TanStack Query for data fetching, hardcoded in-memory services for mock data, and shadcn/ui components styled with Tailwind CSS v4.

## Goals / Non-Goals

**Goals:**

- Display authenticated user's orders grouped into exactly two states: active and finished. There are no intermediate states for active orders (e.g. no pending/processing/shipped distinction) — an order is simply active or finished.
- Provide reusable service and query-options modules for order data.
- Follow existing project conventions (hardcoded data, `src/services/` + `src/query-options/` pattern, `#/` path alias).
- Mirror the profile page's spacing and aesthetic (same `w-full max-w-2xl` container width, `text-2xl font-bold` heading, `mb-6` header block) so the account section feels consistent.
- Use a shadcn/ui Tabs component to switch between the two order groups, rather than separate stacked sections.

**Non-Goals:**

- Real backend integration or pagination (data is in-memory mock).
- Order detail drill-down page or cancellation actions (clicking an order does nothing beyond potential future routing).
- Email notifications or payment status integration.

## Decisions

- **Data source**: Hardcoded in-memory mock array in `src/services/orders.ts`, consistent with every other service in the codebase. Each order object contains `id`, `createdAt`, `status` (just `active` or `finished`), `items` (name, quantity, price), and `total`.
- **Query options**: Dedicated `src/query-options/orders.ts` exporting a `createOrdersQueryOptions` factory function, following the `hero-slides.ts` canonical example and `appointments.ts` pattern.
- **UI grouping**: Use shadcn/ui `<Tabs>` with two tabs — "Pedidos Activos" and "Pedidos Finalizados" — filtering the same fetched array by `status`.
- **Status model**: Only two states: `active` and `finished`. There are no intermediate states for active orders; an order is either active or finished.
- **Tabs component**: Add a shadcn/ui `Tabs` primitive to `src/components/ui/tabs.tsx` via the `shadcn` CLI before use. The existing UI library does not yet include a Tabs component.
- **Layout / aesthetic**: Wrap content in `w-full max-w-2xl`, render the page title as `<h1 className="text-2xl font-bold">` followed by a `mb-6` spacing block, matching `src/routes/_main-layout/_authenticated/myaccount/profile.tsx` exactly. The Tabs list sits directly below the title block.
- **Component split**: A single route component in `orders.tsx` plus a small presentational `OrderCard` sub-component in the same file to avoid over-fragmentation for a single page.
- **Styling**: Tailwind utility classes and existing theme tokens (`bg-card`, `text-muted-foreground`, etc.). No new design tokens. No status badge since there are only two states and the active tab already conveys that.
- **Empty states**: Render a friendly message + icon when a tab has zero orders.

## Risks / Trade-offs

- **[Risk] Mock data staleness** → Mitigation: clearly label data as hardcoded; when backend arrives, only `src/services/orders.ts` needs replacement.
- **[Risk] Tab filter performance on large histories** → Mitigation: currently negligible with mock data; if scale grows later, move filtering server-side or add virtualized lists.
- **[Trade-off] Single-file component** → Keeps change minimal but may require extraction if order interactions expand.
- **[Trade-off] Flat two-state status model** → Drops pending/processing/shipped/delivered/cancelled granularity in favor of a simple active/finished split. This matches the requested UX but loses status detail that a backend may later provide; the `status` field can be extended without breaking the Tabs filter as long as each new state is mapped to one of the two buckets.

## Migration Plan

- Not applicable — this is a new feature filling an existing placeholder route. No rollback needed beyond reverting the route file.

## Open Questions

- None.
