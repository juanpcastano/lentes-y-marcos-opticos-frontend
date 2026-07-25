## Why

Authenticated customers currently have no way to review their upcoming appointments or look back at past ones. The `/myaccount/orders` page already proves the pattern (split active vs. finished orders in tabs), and the `/myaccount/appointments` route already exists as a placeholder. Customers who book eye exams through the scheduling page need a self-service view of "citas pendientes" and "historial", including the medical result issued after a completed visit.

## What Changes

- Replace the placeholder `/myaccount/appointments` route component with a full page modeled on `/myaccount/orders`.
- Add "Citas Pendientes" and "Historial" tabs, splitting appointments by status (`pending` vs. `completed`).
- Render pending appointments as cards showing date, time, and a no-op "Confirmar Reserva"/cancel affordance (display only this iteration).
- Render completed appointments as history cards that include the medical result from the past appointment (e.g., prescription, diagnosis, notes).
- Add empty states for each tab, mirroring the orders page.
- Introduce a new in-memory service `fetchUserAppointments` and matching `query-options` entry, returning hardcoded data (no backend yet), following the canonical hero-slides/orders pattern.

## Capabilities

### New Capabilities

- `myaccount-appointments`: Authenticated customer view of their appointments, with pending/history tabs and medical results shown for completed appointments.

### Modified Capabilities

<!-- No existing spec describes the myaccount appointments management page. The `appointments-page` spec covers the public scheduling page, which is unrelated behavior. -->

## Impact

- **Routes**: `src/routes/_main-layout/_authenticated/myaccount/appointments.tsx` (replace placeholder).
- **Services**: new `src/services/user-appointments.ts` exporting appointment types and `fetchUserAppointments`; `src/services/appointments.ts` is unchanged (still used by the scheduling page).
- **Query options**: new `src/query-options/user-appointments.ts` following the `orders.ts`/`hero-slides.ts` pattern.
- **UI**: reuses shadcn `Card`, `Tabs` components; no new shadcn components required.
- **Dependencies**: none new (`date-fns`, `lucide-react`, `@tanstack/react-query` already in use).
- **No backend changes** — data is hardcoded in-memory per AGENTS.md.
