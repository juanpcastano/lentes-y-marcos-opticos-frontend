## 1. Data Layer

- [x] 1.1 Create `src/services/orders.ts` with hardcoded `fetchOrders` function returning mock order array. Each order's `status` MUST be either `active` or `finished` (no other states).
- [x] 1.2 Create `src/query-options/orders.ts` exporting `createOrdersQueryOptions` factory with `queryKey: ["orders"]`

## 2. UI Primitives

- [x] 2.1 Add the shadcn/ui Tabs primitive to `src/components/ui/tabs.tsx` via the `shadcn` CLI (it is not currently installed).

## 3. Route Component

- [x] 3.1 Rewrite `src/routes/_main-layout/_authenticated/myaccount/orders.tsx` to use `useSuspenseQuery` with `createOrdersQueryOptions`
- [x] 3.2 Wrap the page in a `w-full max-w-2xl` container matching `profile.tsx`; render an `<h1 className="text-2xl font-bold mb-6">Pedidos</h1>` header block
- [x] 3.3 Add a shadcn/ui `<Tabs>` with two triggers: "Pedidos Activos" and "Pedidos Finalizados", placed directly below the title
- [x] 3.4 Implement `OrderCard` sub-component rendering id, date, items, and total (no status badge — the active tab conveys the state)
- [x] 3.5 Filter orders by `status === "active"` for the first tab and `status === "finished"` for the second; render the matching orders
- [x] 3.6 Add an empty state for each tab when no orders match the filter
- [x] 3.7 Ensure responsive layout and visual consistency with the profile page inside the account `<Outlet>` container

## 4. Verification

- [x] 4.1 Run `pnpm dev` and verify `/myaccount/orders` renders without errors and visually matches the profile page's spacing
- [x] 4.2 Confirm tab switching correctly filters active vs finished orders
- [x] 4.3 Run `pnpm check` and `pnpm lint` with zero errors
- [x] 4.4 Run `pnpm test` (or confirm no existing test failures)
