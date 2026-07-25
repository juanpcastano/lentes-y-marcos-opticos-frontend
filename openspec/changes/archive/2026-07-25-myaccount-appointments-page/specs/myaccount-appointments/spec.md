## ADDED Requirements

### Requirement: MyAccount appointments page route

The system SHALL serve an authenticated appointments management page at `/myaccount/appointments`, mounted under the `_authenticated` layout, reusing the existing route file. The page SHALL follow the layout and styling of `/myaccount/orders` (max-w-2xl container, page title, shadcn `Tabs`).

#### Scenario: Authenticated user opens the page

- **WHEN** an authenticated user navigates to `/myaccount/appointments`
- **THEN** the page renders with a "Citas" title and two tabs: "Citas Pendientes" and "Historial"

#### Scenario: Unauthenticated user is redirected

- **WHEN** an unauthenticated user navigates to `/myaccount/appointments`
- **THEN** the `_authenticated` layout enforces its existing redirect behavior

### Requirement: Pending and history tabs split appointments by status

The system SHALL split the user's appointments into two tabs based on status: appointments with status `pending` appear under "Citas Pendientes"; appointments with status `completed` appear under "Historial". The "Citas Pendientes" tab SHALL be selected by default.

#### Scenario: Pending tab selected by default

- **WHEN** the page renders
- **THEN** the "Citas Pendientes" tab is active and lists only appointments with status `pending`

#### Scenario: User switches to history tab

- **WHEN** the user clicks the "Historial" tab
- **THEN** the tab content switches to list only appointments with status `completed`

#### Scenario: Empty pending tab

- **WHEN** the "Citas Pendientes" tab is displayed and the user has no pending appointments
- **THEN** the tab shows an empty state prompting the user with a message such as "No tienes citas pendientes."

#### Scenario: Empty history tab

- **WHEN** the "Historial" tab is displayed and the user has no completed appointments
- **THEN** the tab shows an empty state prompting the user with a message such as "No tienes historial de citas."

### Requirement: Pending appointment card display

The system SHALL render each pending appointment as a card showing the appointment date and time formatted in Spanish (e.g., "10 de Noviembre a las 10:00 AM"), plus any relevant appointment summary text. The date/time format SHALL be produced with `date-fns` using the `es` locale.

#### Scenario: Pending appointment card renders date and time

- **WHEN** a pending appointment is rendered in the "Citas Pendientes" tab
- **THEN** the card displays the appointment date and time formatted as "{day} de {month} a las {time}" in Spanish

### Requirement: Completed appointment cards show medical result

The system SHALL render each completed appointment in the "Historial" tab as a card that includes the medical result from that past appointment. The medical result SHALL include a prescription (when present) and free-text notes (when present), and SHALL be hidden when the appointment has no associated medical result.

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

### Requirement: User appointments data source

The system SHALL expose the list of the authenticated user's appointments through an in-memory service `fetchUserAppointments` that returns hardcoded data, following the project's data-fetching pattern (service in `src/services` wrapped by a `queryOptions` factory in `src/query-options`). The `queryOptions` factory SHALL be consumed by the page via `useSuspenseQuery`. No real backend SHALL be required.

#### Scenario: Page loads appointments via query options

- **WHEN** the appointments page mounts
- **THEN** it reads appointments from `useSuspenseQuery` using the user-appointments query options factory

#### Scenario: Appointment records include required fields

- **WHEN** `fetchUserAppointments` is called
- **THEN** it returns a promise resolving to an array of appointments, each with an `id`, `date` (ISO `yyyy-MM-dd`), `time` (`HH:mm`), `status` (`"pending" | "completed"`), and an optional `medicalResult` object containing optional `prescription` and `notes` string fields
