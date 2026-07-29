## ADDED Requirements

### Requirement: Single pending appointment constraint

The system SHALL enforce that a user can hold at most one appointment with status `pending` at any time. If the user attempts to book a new appointment while one is already pending, the system SHALL reject the request.

#### Scenario: Booking succeeds when no pending appointment exists

- **WHEN** the user clicks "Confirmar Reserva" and has no pending appointments
- **THEN** the appointment is created with status `pending`
- **AND** the system transitions to the appointment detail view

#### Scenario: Booking fails when a pending appointment already exists

- **WHEN** the user clicks "Confirmar Reserva" and already has a pending appointment
- **THEN** the system does not create a second appointment
- **AND** the UI prevents the action (the booking button is not available in detail mode)

### Requirement: Appointment rescheduling

The system SHALL allow users to change the date and time of their pending appointment from the `/appointments` page detail view. Rescheduling SHALL be available only when the appointment is more than 24 hours away.

#### Scenario: Reschedule enabled for future appointment

- **WHEN** the user views their pending appointment and it is more than 24 hours away
- **THEN** the "Cambiar fecha/hora" button is enabled
- **AND** clicking it reveals the calendar and time-slot picker

#### Scenario: Reschedule disabled within 24 hours

- **WHEN** the user views their pending appointment and it is 24 hours or less away
- **THEN** the "Cambiar fecha/hora" button is visually disabled
- **AND** hovering over the button displays a message such as "No puedes cambiar la cita si falta menos de 24 horas"

#### Scenario: Reschedule saves new selection

- **WHEN** the user selects a new date and time and confirms the change
- **THEN** the pending appointment updates to the new date and time
- **AND** the detail view reflects the updated appointment

### Requirement: Appointment cancellation with warning dialog

The system SHALL provide a "Cancelar Cita" button on the appointment detail view. Clicking it SHALL open a confirmation dialog warning the user that repeatedly deleting appointments may result in account restrictions.

#### Scenario: Cancel button opens confirmation dialog

- **WHEN** the user clicks "Cancelar Cita"
- **THEN** a confirmation dialog appears with a warning message such as "Cancelar citas repetidamente puede resultar en restricciones en tu cuenta. ¿Estás seguro?"

#### Scenario: Confirming cancellation removes the appointment

- **WHEN** the user confirms the cancellation dialog
- **THEN** the pending appointment is removed
- **AND** the `/appointments` page returns to booking mode

#### Scenario: Dismissing cancellation keeps the appointment

- **WHEN** the user dismisses the cancellation dialog
- **THEN** the pending appointment remains unchanged
- **AND** the detail view stays visible

### Requirement: In-memory appointment mutations

The system SHALL expose in-memory service functions for booking, rescheduling, and cancelling appointments. These functions SHALL operate on a mutable in-memory store alongside the existing hardcoded data.

#### Scenario: Booking mutation updates the store

- **WHEN** `bookAppointment(date, time)` is called and no pending appointment exists
- **THEN** the function resolves with the new appointment object
- **AND** subsequent calls to `fetchUserAppointments` include the new pending appointment

#### Scenario: Reschedule mutation updates the store

- **WHEN** `rescheduleAppointment(newDate, newTime)` is called for the pending appointment
- **THEN** the function resolves with the updated appointment
- **AND** the pending appointment's date and time are updated in the store

#### Scenario: Cancel mutation removes from the store

- **WHEN** `cancelAppointment()` is called for the pending appointment
- **THEN** the function resolves successfully
- **AND** subsequent calls to `fetchUserAppointments` return no pending appointments

## MODIFIED Requirements

### Requirement: Confirm reservation button

The system SHALL display a "Confirmar Reserva" button inside the selection summary bar when both a date and a time slot are selected. The button SHALL create a new pending appointment via the in-memory booking service. If the user is not authenticated, the button SHALL redirect to `/login` with a redirect back to `/appointments`. After a successful booking, the page SHALL switch to detail mode showing the newly created appointment.

#### Scenario: Authenticated user books an appointment

- **WHEN** an authenticated user selects a date and time and clicks "Confirmar Reserva"
- **THEN** the in-memory service creates a pending appointment
- **AND** the page switches to the appointment detail view

#### Scenario: Unauthenticated user clicks book

- **WHEN** an unauthenticated user clicks "Confirmar Reserva"
- **THEN** the user is redirected to `/login?redirect=/appointments`

### Requirement: User appointments data source

The system SHALL expose the list of the authenticated user's appointments through an in-memory service `fetchUserAppointments` that returns hardcoded data, following the project's data-fetching pattern. The returned data SHALL contain zero pending appointments by default and multiple completed appointments. The `queryOptions` factory SHALL be consumed by the page via `useSuspenseQuery`. No real backend SHALL be required.

#### Scenario: Page loads appointments via query options

- **WHEN** the appointments page mounts
- **THEN** it reads appointments from `useSuspenseQuery` using the user-appointments query options factory

#### Scenario: Appointment records include required fields

- **WHEN** `fetchUserAppointments` is called
- **THEN** it returns a promise resolving to an array of appointments, each with an `id`, `date` (ISO `yyyy-MM-dd`), `time` (`HH:mm`), `status` (`"pending" | "completed"`), and an optional `medicalResult` object containing optional `prescription` and `notes` string fields

#### Scenario: Pending list starts empty

- **WHEN** `fetchUserAppointments` is called on a fresh session
- **THEN** the returned array contains no appointments with status `pending`
