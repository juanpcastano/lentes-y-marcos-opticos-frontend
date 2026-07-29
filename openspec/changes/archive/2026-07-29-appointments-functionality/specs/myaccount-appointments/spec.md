## MODIFIED Requirements

### Requirement: User appointments data source

The system SHALL expose the list of the authenticated user's appointments through an in-memory service `fetchUserAppointments` that returns hardcoded data, following the project's data-fetching pattern (service in `src/services` wrapped by a `queryOptions` factory in `src/query-options`). The `queryOptions` factory SHALL be consumed by the page via `useSuspenseQuery`. No real backend SHALL be required. The hardcoded data SHALL contain zero pending appointments by default.

#### Scenario: Page loads appointments via query options

- **WHEN** the appointments page mounts
- **THEN** it reads appointments from `useSuspenseQuery` using the user-appointments query options factory

#### Scenario: Appointment records include required fields

- **WHEN** `fetchUserAppointments` is called
- **THEN** it returns a promise resolving to an array of appointments, each with an `id`, `date` (ISO `yyyy-MM-dd`), `time` (`HH:mm`), `status` (`"pending" | "completed"`), and an optional `medicalResult` object containing optional `prescription` and `notes` string fields

#### Scenario: Pending list starts empty

- **WHEN** `fetchUserAppointments` is called on a fresh session
- **THEN** the returned array contains no appointments with status `pending`

### Requirement: MyAccount appointments page layout

The system SHALL render the MyAccount appointments page at `/myaccount/appointments` without tabs. The page SHALL display the user's completed appointment history. When the user has a pending appointment, the system SHALL render it at the top of the page as a highlighted card with a "Ver detalles" button that navigates to `/appointments`.

#### Scenario: Page shows only history with no pending appointment

- **WHEN** the user has no pending appointments
- **THEN** the page displays the "Historial de citas" section with all completed appointments
- **AND** no pending appointment card is shown

#### Scenario: Page shows upcoming appointment and history

- **WHEN** the user has a pending appointment
- **THEN** the page renders a "Próxima cita" section at the top showing the pending appointment date, time, and id
- **AND** the card includes a "Ver detalles" button that navigates to `/appointments`
- **AND** below it, the "Historial de citas" section lists completed appointments

#### Scenario: Empty history

- **WHEN** the user has no completed appointments
- **THEN** the history section shows an empty state prompting the user with a message such as "No tienes historial de citas."

### Requirement: Pending and history display

The system SHALL render completed appointments in the history section. The pending appointment SHALL NOT be included in the history list. The history section SHALL show each completed appointment as a card that includes the medical result from that past appointment. The medical result SHALL include a prescription (when present) and free-text notes (when present), and SHALL be hidden when the appointment has no associated medical result.

#### Scenario: Completed appointment with prescription and notes

- **WHEN** a completed appointment has a medical result with a prescription and notes
- **THEN** the card displays the appointment date and time, the prescription, and the notes

#### Scenario: Completed appointment with prescription only

- **WHEN** a completed appointment has a medical result with a prescription and no notes
- **THEN** the card displays the appointment date and time and the prescription, and the notes section is omitted

#### Scenario: Completed appointment with notes only

- **WHEN** a completed appointment has a medical result with notes and no prescription
- **THEN** the card displays the appointment date and time and the notes, and the prescription section is omitted

#### Scenario: Completed appointment without medical result

- **WHEN** a completed appointment has no associated medical result
- **THEN** the card displays only the appointment date and time with no medical result section
