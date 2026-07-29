## Why

The `/appointments` page currently has a non-functional "Confirmar Reserva" button and no actual booking logic. The user's next appointments list is also pre-populated with fake pending appointments. We need to make the booking flow real, enforce a single-pending-appointment constraint, and allow users to manage their upcoming appointment directly from the public appointments page.

## What Changes

- Make the "Confirmar Reserva" button on `/appointments` actually create an appointment.
- Enforce a **single pending appointment** constraint: users can hold at most one pending appointment at a time.
- Replace the booking calendar on `/appointments` with an appointment detail view when the user already has a pending appointment.
- Add **reschedule** controls on `/appointments` so users can change the date and time of their pending appointment.
- Disable reschedule if the appointment is **24 hours or less away**, with a tooltip/hover message explaining the restriction.
- Add a **Cancelar Cita** button with a confirmation dialog that warns that repeatedly deleting appointments may result in account restrictions.
- Reset the hardcoded `fetchUserAppointments` data so the pending list starts empty.

## Capabilities

### New Capabilities

- `appointment-booking`: Covers the actual booking action and the single-pending-appointment constraint. Defines the in-memory service for creating an appointment and the rule that prevents a second pending appointment.

### Modified Capabilities

- `appointments-page`: Changes the page from a static scheduling view to a dual-mode page: booking mode (calendar + slots) when no pending appointment exists, and detail mode (appointment info + reschedule + cancel) when one exists. The booking button becomes functional.
- `myaccount-appointments`: Removes the hardcoded pending appointments from the in-memory service so the "Citas Pendientes" tab starts empty. The history tab remains unchanged.

## Impact

- `src/routes/_main-layout/appointments.tsx`: Switches between booking and detail modes.
- `src/services/appointments.ts` and `src/services/user-appointments.ts`: Adds booking/cancel/reschedule mutations and updates hardcoded data.
- `src/components/appointments/`: New or updated components for appointment detail view, reschedule flow, and cancellation dialog.
- `src/query-options/`: New mutation query option factories for booking, rescheduling, and cancellation.
