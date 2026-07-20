# Proposal: appointments-page

## Why

The site currently has an `/apointments` route that renders only a placeholder ("Hello"). The navbar ("Agendar Cita") and the exam-offer banner already link to it, but users landing there see nothing. We need a real appointment-booking page where users can see which days have availability and pick a time slot — even if the actual booking action is not wired to a backend yet.

## What Changes

- Rename the route to the correct spelling: `src/routes/_main-layout/apointments.tsx` → `appointments.tsx`, serving the page at `/appointments`.
- Update the navbar ("Agendar Cita") and exam-offer banner CTA links from `/apointments` to `/appointments`. This also fixes the hero-slide CTAs, which already point to `/appointments` (currently dead links).
- Add a date picker using the existing shadcn `Calendar` component (`src/components/ui/calendar.tsx`); days without available slots are shown as disabled/unavailable.
- Add a time-slot selector that lists the available schedules for the selected day.
- Add a selection summary bar that appears when both date and time are selected, showing "Cita seleccionada" with the chosen date/time and a white "Confirmar Reserva" button on a blue background (layout-only, no backend).
- Add hardcoded in-memory availability data following the established `src/services/` + `src/query-options/` pattern.
- Page copy in Spanish, consistent with the rest of the site.

## Capabilities

### New Capabilities

- `appointments-page`: Appointment scheduling page that lets users pick an available date from a calendar (days without availability disabled) and choose a time slot for the selected day, with a non-functional "Confirmar Reserva" button inside a selection summary bar.

### Modified Capabilities

<!-- None — no existing spec-level requirements change. -->

## Impact

- **Routes**: rename `src/routes/_main-layout/apointments.tsx` → `appointments.tsx` (replace placeholder). Links updated in `src/components/nav-menu.tsx` and `src/components/exam-offer-banner/exam-offer-banner.tsx`. `src/routeTree.gen.ts` regenerates automatically — not edited by hand.
- **New code**: appointment feature components (e.g., `src/components/appointments/`), `src/services/appointments.ts`, `src/query-options/appointments.ts`.
- **UI**: reuses existing shadcn `Calendar` (`react-day-picker`) and `Button` components; no new dependencies expected.
- **Data**: all availability data is hardcoded in-memory per project convention — no real backend.
- **Out of scope**: actually booking the appointment, authentication, persisting selections.
