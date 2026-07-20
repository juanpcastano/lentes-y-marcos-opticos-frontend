# Design: appointments-page

## Context

The `/apointments` route exists as a placeholder (`src/routes/_main-layout/apointments.tsx` renders "Hello"). The navbar ("Agendar Cita") and exam-offer banner already link to it. The project conventions that constrain this design:

- Data is hardcoded in-memory: `src/services/` holds fetch functions, `src/query-options/` wraps them in `queryOptions`, consumed with `useQuery`.
- shadcn `Calendar` (react-day-picker v10) already exists at `src/components/ui/calendar.tsx`; `date-fns` v4 is installed, so the Spanish locale is available via `react-day-picker/locale` — no new dependencies.
- UI copy is in Spanish; routes live under the `_main-layout` layout route.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder with a two-pane booking UI: calendar on one side, time slots for the selected day on the other, plus a selection summary bar with a confirm button.
- Days without availability (and past days) are disabled in the calendar.
- Availability comes from a hardcoded service via TanStack Query, matching the existing data pattern.
- Confirm button is layout-only (no action).

**Non-Goals:**

- Actually creating/persisting an appointment, or any backend integration.
- URL query-param synchronization of the selected date/slot.
- Multi-step booking forms (personal data, confirmation, etc.).

## Decisions

### 1. Fix the route typo: serve the page at `/appointments`

Rename `src/routes/_main-layout/apointments.tsx` to `appointments.tsx` and update the two links that point to `/apointments`: `src/components/nav-menu.tsx` ("Agendar Cita") and `src/components/exam-offer-banner/exam-offer-banner.tsx` (`ctaLink`). The hero slides already link to `/appointments` (currently dead links), so the rename repairs them for free. The route tree regenerates automatically on dev/build.

- **Alternative considered**: keep the `/apointments` path to avoid touching links. Rejected — the typo would ship to users, and `/appointments` links already exist in the hero slides.

### 2. Availability data model

`src/services/appointments.ts` exposes `fetchAppointmentAvailability(): Promise<AppointmentDay[]>` where:

```ts
type AppointmentDay = {
  date: string // ISO "yyyy-MM-dd"
  slots: string[] // e.g. ["09:00", "09:30", ...]
}
```

A day is **available iff it appears in the array with a non-empty `slots` list**; every other day is unavailable. This keeps the calendar-disabling logic trivial and mirrors how a real backend would answer. Dates are generated relative to "today" (e.g., spread over the next ~30 days with some gaps) so the demo never goes stale.

- **Alternative considered**: a single list of slots with a global "open weekdays" rule. Rejected — explicit per-day data better matches a future API and makes "days without availability" easy to demonstrate.

### 3. Disabling days with react-day-picker

Pass a `disabled` matcher to `Calendar`: a day is disabled when it is before today OR not present in the availability data. Use `mode="single"` with `selected`/`onSelect` controlled from route state. Locale: `es` from `react-day-picker/locale` so month/day names render in Spanish.

### 4. State management

Local component state only (`useState` for `selectedDate: Date | undefined` and `selectedSlot: string | undefined`). Selecting a new date resets `selectedSlot`. A selection summary bar is rendered conditionally when both are set, containing a "Confirmar Reserva" button whose `onClick` is a no-op.

- **Alternative considered**: URL search params like the catalog page. Rejected for now — no shareability requirement was stated, and it keeps the change minimal.

### 5. Component structure

- Route `src/routes/_main-layout/appointments.tsx` — page layout (heading, two-pane responsive grid: calendar + slots panel), wires query + state.
- `src/components/appointments/appointment-calendar.tsx` — wraps shadcn `Calendar` with the disabled matcher and `es` locale.
- `src/components/appointments/time-slot-picker.tsx` — renders the selected day's slots as a grid of toggle-style buttons, plus empty state ("Selecciona una fecha" / "No hay horarios disponibles"), and the selection summary bar with confirm button.
- `src/components/appointments/types.ts` — `AppointmentDay` type.
- `src/services/appointments.ts` + `src/query-options/appointments.ts` — canonical data pattern (default export `createAppointmentAvailabilityQueryOptions`, matching `hero-slides` example).

Page copy (Spanish): heading "Agenda tu cita", calendar panel "Selecciona una fecha", slots panel "Horarios disponibles", summary bar label "Cita seleccionada", confirm button "Confirmar Reserva".

## Risks / Trade-offs

- [Hardcoded availability drifts into the past as real time passes] → Generate dates relative to `new Date()` at fetch time so the demo always has upcoming available days.
- [The confirm button doing nothing may confuse users] → Accepted per request; the button only appears inside the summary bar when a date and slot are chosen, and this change is explicitly layout-only.
- [A stale `/apointments` link is missed during the rename] → After renaming, grep the codebase for `apointments` to confirm only the correct spelling remains.
