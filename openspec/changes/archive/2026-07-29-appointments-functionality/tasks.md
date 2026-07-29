## 1. Service Layer — Mutations and State

- [x] 1.1 Refactor `src/services/user-appointments.ts`: replace hardcoded pending appointments with a mutable `let pendingAppointment: UserAppointment | null = null`, keeping the completed array intact.
- [x] 1.2 Update `fetchUserAppointments` to return `[...(pendingAppointment ? [pendingAppointment] : []), ...completedAppointments]`.
- [x] 1.3 Add `bookAppointment(date: string, time: string): Promise<UserAppointment>` that creates a pending appointment (generated id, status `pending`) and stores it in `pendingAppointment`; rejects if one already exists.
- [x] 1.4 Add `rescheduleAppointment(date: string, time: string): Promise<UserAppointment>` that updates `pendingAppointment` date/time; rejects if none exists.
- [x] 1.5 Add `cancelAppointment(): Promise<void>` that sets `pendingAppointment` to `null`; rejects if none exists.

## 2. Query Options — Mutations

- [x] 2.1 Create `src/query-options/book-appointment.ts` with a `useMutation` query options factory that calls `bookAppointment` and invalidates the `user-appointments` query key on success.
- [x] 2.2 Create `src/query-options/reschedule-appointment.ts` with a `useMutation` query options factory that calls `rescheduleAppointment` and invalidates the `user-appointments` query key on success.
- [x] 2.3 Create `src/query-options/cancel-appointment.ts` with a `useMutation` query options factory that calls `cancelAppointment` and invalidates the `user-appointments` query key on success.

## 3. Public Appointments Page — Dual Mode

- [x] 3.1 Update `src/routes/_main-layout/appointments.tsx` to query `user-appointments` (or accept the pending appointment as a prop/context). Determine mode: `booking` when no pending, `detail` when pending exists.
- [x] 3.2 In `booking` mode, keep existing calendar + slot picker + summary bar layout. Wire the "Confirmar Reserva" button to the booking mutation. On success, switch to `detail` mode.
- [x] 3.3 In `detail` mode, render an appointment detail card showing the pending appointment date/time (formatted with `date-fns` Spanish locale) and appointment id.
- [x] 3.4 Add a "Cambiar fecha/hora" button in `detail` mode. Compute `differenceInHours` between appointment datetime and `now`; disable the button if `<= 24`. Wrap the disabled button in a `Tooltip` from shadcn/ui showing "No puedes cambiar la cita si falta menos de 24 horas".
- [x] 3.5 Implement reschedule flow: clicking "Cambiar fecha/hora" switches the page section into a sub-mode showing `AppointmentCalendar` + `TimeSlotPicker` pre-selected with the current appointment date/time, plus a "Guardar cambios" and "Cancelar" button pair. On save, call the reschedule mutation and return to `detail` mode.
- [x] 3.6 Add a "Cancelar Cita" button in `detail` mode that opens a confirmation dialog. On confirm, call the cancel mutation and return to `booking` mode.

## 4. Cancellation Dialog Component

- [x] 4.1 Ensure `AlertDialog` primitive is available in `src/components/ui/`. If missing, add it via `shadcn alert-dialog`.
- [x] 4.2 Create `src/components/appointments/cancel-appointment-dialog.tsx`: an `AlertDialog` with title "Cancelar cita", description warning "Cancelar citas repetidamente puede resultar en restricciones en tu cuenta. ¿Estás seguro?", and Confirm / Cancel actions. Accepts `open`, `onOpenChange`, and `onConfirm` props.

## 5. MyAccount Appointments Page

- [x] 5.1 Remove tabs from `src/routes/_main-layout/_authenticated/myaccount/appointments.tsx`. Replace with a single layout.
- [x] 5.2 Add a "Próxima cita" section at the top that renders the pending appointment card (if any) with date/time/id and a "Ver detalles" button linking to `/appointments`.
- [x] 5.3 Render the "Historial de citas" section below with only completed appointments (same card style as before, with medical results).

## 6. Verification

- [x] 6.1 Run `pnpm check` to ensure TypeScript compiles, formatting passes, and no unused locals/parameters.
- [x] 6.2 Run `pnpm dev` and manually test the `/appointments` flow: book an appointment, verify detail mode appears, attempt reschedule, verify 24-hour tooltip, cancel and verify return to booking mode.
- [x] 6.3 Navigate to `/myaccount/appointments` and confirm the pending tab is empty and the history tab still shows completed appointments.
