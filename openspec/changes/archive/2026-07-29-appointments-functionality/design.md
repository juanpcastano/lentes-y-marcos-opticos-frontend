## Context

The `/appointments` page (`src/routes/_main-layout/appointments.tsx`) currently presents a calendar and time-slot picker, but the "Confirmar Reserva" button is a no-op. The user appointments service (`src/services/user-appointments.ts`) returns hardcoded data including two fake pending appointments. The MyAccount appointments page (`src/routes/_main-layout/_authenticated/myaccount/appointments.tsx`) renders pending and history tabs but offers no management actions.

We need to:

1. Make booking functional via in-memory mutation services.
2. Enforce a single-pending-appointment rule.
3. Switch the public appointments page into a "detail mode" when the user already has a pending appointment.
4. Allow rescheduling (with a 24-hour lockout) and cancellation (with a warning dialog).
5. Clear the fake pending data so the initial state is empty.

## Goals / Non-Goals

**Goals:**

- Add in-memory mutation services for creating, rescheduling, and cancelling appointments.
- Enforce that a user can have at most one pending appointment at any time.
- Render the public `/appointments` page in two modes: booking mode (no pending) and detail mode (has pending).
- Provide reschedule controls in detail mode, disabled when the appointment is 24 hours or less away, with a hover tooltip stating the restriction.
- Provide a cancel button that opens a confirmation dialog warning about potential account restrictions for repeated cancellations.
- Update the MyAccount appointments page to remove tabs. Show only history, with the pending appointment (if any) displayed at the top as a card with a "Ver detalles" button linking to `/appointments`.

**Non-Goals:**

- No real backend or persistence; all data remains in-memory.
- No payment integration.
- No email or push notifications.
- No admin-facing appointment management.

## Decisions

### In-memory state with module-level variable

**Decision:** Store pending appointment state in a module-level `let` inside `src/services/user-appointments.ts`, alongside the existing hardcoded completed appointments array.
**Rationale:** The project explicitly requires hardcoded in-memory data. A module-level variable is the simplest mutable store that persists across renders without introducing a new global state library. The existing `fetchUserAppointments` reads from this variable.
**Alternative considered:** React Context or Zustand store — rejected because the project data-fetching pattern uses service + queryOptions, and a separate store would introduce an unnecessary abstraction for a single piece of state.

### Single appointment enforcement at the service layer

**Decision:** `bookAppointment` returns an error (rejected promise) if `fetchUserAppointments` already returns a pending appointment.
**Rationale:** Centralizing the constraint in the service makes it impossible for different UI surfaces to accidentally bypass the rule.

### Public `/appointments` page owns the appointment detail view

**Decision:** When the user has a pending appointment, the public `/appointments` route displays the appointment card with reschedule/cancel actions, rather than redirecting to `/myaccount/appointments`.
**Rationale:** The user explicitly requested the `/appointments` page show the future appointment information. This keeps the primary entry point functional after booking.

### Reschedule uses the same calendar/slot UI as booking

**Decision:** In detail mode, tapping "Cambiar fecha/hora" swaps the detail card back into the booking calendar (reusing `AppointmentCalendar` and `TimeSlotPicker`), pre-selecting the current appointment date.
**Rationale:** Reuses existing, styled components and keeps the UX consistent. A separate inline date picker would require redundant styling.

### 24-hour check uses `date-fns` `differenceInHours`

**Decision:** Compute `differenceInHours(appointmentDateTime, now) <= 24` to disable the reschedule button.
**Rationale:** `date-fns` is already a project dependency and provides a clear, locale-agnostic API for this.

### Cancellation dialog is a standard shadcn AlertDialog

**Decision:** Use the existing `AlertDialog` primitive from `src/components/ui/alert-dialog.tsx` (or add it via `shadcn` CLI if missing) for the cancel confirmation.
**Rationale:** Stays consistent with the existing shadcn/ui component library and accessibility patterns.

## Risks / Trade-offs

- **[Risk]** Module-level service state does not survive a full page reload.
  → **Mitigation:** Acceptable for the current in-memory-only requirement. Documented as a known limitation.
- **[Risk]** Reschedule UI reusing the booking calendar could confuse users if they expect an inline mini-calendar.
  → **Mitigation:** Clearly label the action as "Cambiar fecha/hora" and show a back/cancel button to return to the detail view without saving changes.
- **[Risk]** Booking from the public page while authenticated but on a different tab could create a race condition in a real app.
  → **Mitigation:** Not applicable in the current in-memory, single-user scope.

## Migration Plan

Not applicable — all changes are additive or in-memory. No database migration, API versioning, or rollback strategy required.

## Open Questions

None at this time.
