## Why

The `/myaccount/orders` route already exists as a scaffolded placeholder, but it only renders a static greeting. Users need a functional orders page to view their active orders and browse their finished purchase history. This is a core expectation of any e-commerce account section and completes the "Mi Cuenta" user journey.

## What Changes

- Replace the placeholder `/myaccount/orders` route with a full orders page component.
- Add an `orders` service module that returns hardcoded in-memory order data (active and finished) for the mock user.
- Add a `orders` query-options module to expose the data via TanStack Query.
- Render orders grouped into two tabs: **Pedidos Activos** and **Pedidos Finalizados**. Ongoing orders are not subdivided into different states — an order is simply either active or finished.
- Each order card displays order ID, date, items summary, and total.
- Match the profile page aesthetic and spacing (e.g. `w-full max-w-2xl` container, `text-2xl font-bold` heading, `mb-6` header spacing) and use a shadcn/ui Tabs component to switch between the two views.
- Use existing shadcn/ui components (Card, Badge, Tabs) and Tailwind CSS v4 styling.
- No breaking changes to existing routes, auth, or navbar.

## Capabilities

### New Capabilities

- `myaccount-orders`: Order listing and history display under the authenticated account section. Covers in-memory data fetching, UI layout, active/finished grouping via a Tabs component, and profile-page-matching spacing.

### Modified Capabilities

- _(none — this change introduces only UI and data wiring; no existing spec-level behavior is altered)_

## Impact

- **Routes**: `src/routes/_main-layout/_authenticated/myaccount/orders.tsx` — full rewrite from placeholder.
- **Services**: New `src/services/orders.ts` with hardcoded mock data.
- **Query options**: New `src/query-options/orders.ts`.
- **Dependencies**: Relies on existing `user-auth` for authenticated route access; no auth spec changes required.
