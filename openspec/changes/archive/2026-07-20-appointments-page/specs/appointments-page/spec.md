## ADDED Requirements

### Requirement: Appointments page route

The system SHALL serve the appointment scheduling page at the `/appointments` path (correct spelling), and all site navigation links to the booking page SHALL point to `/appointments`.

#### Scenario: Page served at corrected path

- **WHEN** the user navigates to `/appointments`
- **THEN** the appointment scheduling page renders

#### Scenario: Navigation links use the corrected path

- **WHEN** the user clicks "Agendar Cita" in the navbar or the exam-offer banner call-to-action
- **THEN** the browser navigates to `/appointments` and the appointment scheduling page renders

### Requirement: Appointment date calendar

The system SHALL display a calendar on the `/appointments` route that lets the user select a date for an appointment, using the shadcn calendar component with Spanish locale.

#### Scenario: Calendar renders on the appointments page

- **WHEN** the user navigates to `/appointments`
- **THEN** the page displays a calendar for date selection with month and day names in Spanish

#### Scenario: Days without availability are unavailable

- **WHEN** the calendar is displayed
- **THEN** every day that has no available time slots is disabled and cannot be selected

#### Scenario: Past days are unavailable

- **WHEN** the calendar is displayed
- **THEN** every day before the current date is disabled and cannot be selected

#### Scenario: User selects an available day

- **WHEN** the user clicks a day that has available time slots
- **THEN** the day becomes visually selected
- **AND** the time-slot panel updates to show that day's available slots

### Requirement: Time slot selection

The system SHALL display the available time slots for the selected day and let the user select one.

#### Scenario: No date selected

- **WHEN** the user has not selected a date
- **THEN** the time-slot panel shows an empty state prompting the user to select a date

#### Scenario: Slots shown for selected date

- **WHEN** the user selects a date with availability
- **THEN** the time-slot panel lists all available time slots for that date

#### Scenario: User selects a time slot

- **WHEN** the user clicks a time slot
- **THEN** that slot becomes visually selected and any previously selected slot is deselected

#### Scenario: Changing the date resets the slot

- **WHEN** the user selects a different date after having selected a time slot
- **THEN** the previously selected time slot is cleared

### Requirement: Selection summary bar

The system SHALL display a summary bar at the bottom of the appointment panel when both a date and a time slot are selected. The bar shows the selected appointment details and contains the action button.

#### Scenario: Summary bar hidden without full selection

- **WHEN** no date or no time slot is selected
- **THEN** the summary bar is not visible

#### Scenario: Summary bar shown with full selection

- **WHEN** both a date and a time slot are selected
- **THEN** a blue summary bar appears at the bottom of the panel
- **AND** the bar displays a calendar icon on the left
- **AND** the bar shows the text "Cita seleccionada"
- **AND** the bar shows the selected date and time formatted as "{day} de {month} a las {time}" (e.g., "10 de Noviembre a las 10:00 AM")

### Requirement: Confirm reservation button

The system SHALL display a "Confirmar Reserva" button inside the selection summary bar. The button is white with dark text on the blue bar, and performs no action in this iteration.

#### Scenario: Button rendered inside summary bar

- **WHEN** the summary bar is visible
- **THEN** a white button with the text "Confirmar Reserva" in dark blue is displayed on the right side of the bar

#### Scenario: Button click is a no-op

- **WHEN** the user clicks the "Confirmar Reserva" button
- **THEN** no appointment is created and no navigation occurs
