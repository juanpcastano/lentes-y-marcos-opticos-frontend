# Tasks: appointments-page

## 1. Data layer

- [x] 1.1 Create `src/components/appointments/types.ts` with the `AppointmentDay` type (`date: string` ISO `yyyy-MM-dd`, `slots: string[]`)
- [x] 1.2 Create `src/services/appointments.ts` with `fetchAppointmentAvailability()` returning hardcoded availability generated relative to today (spread over the next ~30 days with some unavailable gaps, empty days simply omitted)
- [x] 1.3 Create `src/query-options/appointments.ts` exporting a default `createAppointmentAvailabilityQueryOptions()` wrapper (follow `src/query-options/hero-slides.ts` pattern)

## 2. Feature components

- [x] 2.1 Create `src/components/appointments/appointment-calendar.tsx`: wraps the shadcn `Calendar` in `mode="single"`, Spanish locale from `react-day-picker/locale`, controlled `selected`/`onSelect` props, and a `disabled` matcher that disables past days and days not present in the availability data
- [x] 2.2 Create `src/components/appointments/time-slot-picker.tsx`: shows an empty state ("Selecciona una fecha") when no date is selected, otherwise renders the day's slots as a grid of toggle-style buttons with the selected slot highlighted

## 3. Route page

- [x] 3.1 Rename `src/routes/_main-layout/apointments.tsx` to `appointments.tsx` (update `createFileRoute("/_main-layout/appointments")`) and replace the placeholder with the appointments page: "Agenda tu cita" heading, responsive two-pane layout (calendar panel + "Horarios disponibles" slots panel), `useQuery` for availability, and local state for `selectedDate`/`selectedSlot`
- [x] 3.2 Reset `selectedSlot` when the selected date changes
- [x] 3.3 Add the selection summary bar: appears only when both date and slot are selected, shows calendar icon + "Cita seleccionada" + formatted date/time, contains white "Confirmar Reserva" button with dark text, `onClick` is a no-op
- [x] 3.4 Update the navbar link in `src/components/nav-menu.tsx` from `/apointments` to `/appointments`
- [x] 3.5 Update the exam-offer banner `ctaLink` in `src/components/exam-offer-banner/exam-offer-banner.tsx` from `/apointments` to `/appointments`
- [x] 3.6 Grep the codebase for `apointments` to confirm no stale references remain (excluding `openspec/` change docs)

## 4. Verification

- [x] 4.1 Run `pnpm check` and `pnpm lint` and fix any issues
- [x] 4.2 Run `pnpm build` to confirm the route tree regenerates and the build passes
- [x] 4.3 Run `pnpm dev` and verify at `/appointments`: unavailable/past days are disabled, selecting a day shows its slots, selecting a new day clears the slot, the summary bar with "Confirmar Reserva" button appears only with a full selection, and the navbar/banner links navigate to `/appointments`
