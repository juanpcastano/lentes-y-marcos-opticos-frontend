# Appointment Booking

## Purpose

The appointment booking capability covers the creation, rescheduling, and cancellation of user appointments via in-memory services, enforcing a single-pending-appointment constraint.

## Requirements

### Requirement: Booking an appointment

The system SHALL provide an in-memory `bookAppointment` service that creates a new pending appointment for the authenticated user. The system SHALL reject the request if the user already has a pending appointment.

#### Scenario: Booking succeeds with no pending appointment

- **WHEN** `bookAppointment(date, time)` is called and `fetchUserAppointments` returns no pending appointments
- **THEN** the function resolves with a new `UserAppointment` object with a generated `id`, the provided `date` and `time`, and status `pending`
- **AND** the new appointment is stored in the in-memory list

#### Scenario: Booking fails when pending exists

- **WHEN** `bookAppointment(date, time)` is called and a pending appointment already exists
- **THEN** the function rejects with an error indicating that only one pending appointment is allowed

### Requirement: Rescheduling an appointment

The system SHALL provide an in-memory `rescheduleAppointment` service that updates the date and time of the user's pending appointment. The service SHALL return an error if no pending appointment exists.

#### Scenario: Reschedule updates pending appointment

- **WHEN** `rescheduleAppointment(newDate, newTime)` is called and a pending appointment exists
- **THEN** the pending appointment's `date` and `time` are updated to the new values
- **AND** the function resolves with the updated appointment

#### Scenario: Reschedule fails without pending appointment

- **WHEN** `rescheduleAppointment(newDate, newTime)` is called and no pending appointment exists
- **THEN** the function rejects with an error

### Requirement: Cancelling an appointment

The system SHALL provide an in-memory `cancelAppointment` service that removes the user's pending appointment from the store.

#### Scenario: Cancel removes pending appointment

- **WHEN** `cancelAppointment()` is called and a pending appointment exists
- **THEN** the pending appointment is removed from the in-memory store
- **AND** the function resolves successfully

#### Scenario: Cancel fails without pending appointment

- **WHEN** `cancelAppointment()` is called and no pending appointment exists
- **THEN** the function rejects with an error

### Requirement: 24-hour rescheduling restriction

The system SHALL allow rescheduling only when the pending appointment is more than 24 hours in the future. The UI SHALL disable the reschedule action and display an explanatory message when the appointment is 24 hours or less away.

#### Scenario: Reschedule allowed more than 24 hours away

- **WHEN** the pending appointment is more than 24 hours from now
- **THEN** the reschedule action is enabled

#### Scenario: Reschedule blocked within 24 hours

- **WHEN** the pending appointment is 24 hours or less from now
- **THEN** the reschedule action is disabled
- **AND** hovering the disabled control displays a tooltip or message stating "No puedes cambiar la cita si falta menos de 24 horas"

### Requirement: Unique pending appointment constraint

At all times, the in-memory store SHALL contain at most one `UserAppointment` with status `pending`. All mutation services SHALL maintain this invariant.

#### Scenario: Invariant maintained after booking

- **WHEN** a user successfully books an appointment
- **THEN** the store contains exactly one pending appointment

#### Scenario: Invariant maintained after rescheduling

- **WHEN** a user reschedules their pending appointment
- **THEN** the store continues to contain exactly one pending appointment with updated fields

#### Scenario: Invariant maintained after cancellation

- **WHEN** a user cancels their pending appointment
- **THEN** the store contains zero pending appointments
