## MODIFIED Requirements

### Requirement: Profile page renders personal information form

The system SHALL render a settings-style profile page at `/myaccount/profile` within the existing My Account layout.

#### Scenario: Authenticated user visits profile page

- **WHEN** an authenticated user navigates to `/myaccount/profile`
- **THEN** the page SHALL display the user's current name, email, and phone as read-only information in a styled card layout
- **AND** the page SHALL display a single "Editar preferencias" button
- **AND** all editable sections (personal info form, security, notification preferences, danger zone) SHALL be hidden until the user clicks "Editar preferencias"

#### Scenario: User opens the editable sections

- **WHEN** the user clicks "Editar preferencias"
- **THEN** the page SHALL reveal all editable sections at once: personal information form, security (for email users), notification preferences, and the danger zone
- **AND** the "Editar preferencias" button SHALL be replaced with a "Cerrar edición" action to exit edit mode

#### Scenario: User exits edit mode

- **WHEN** the user clicks "Cerrar edición"
- **THEN** the page SHALL hide all editable sections and return to the read-only display showing the current (possibly updated) information

### Requirement: Profile page allows editing personal information

The system SHALL allow authenticated users to update their name, email, and phone number.

#### Scenario: User updates profile information

- **WHEN** an authenticated user changes their name, email, or phone and clicks "Guardar cambios"
- **THEN** the system SHALL persist the updated values
- **AND** the user SHALL see a success confirmation
- **AND** the read-only display SHALL reflect the updated values after exiting edit mode

#### Scenario: User cancels profile editing

- **WHEN** the user clicks "Cancelar" on the personal information form
- **THEN** the page SHALL discard any unsaved changes to name, email, or phone, restoring the previously saved values

### Requirement: Profile page shows change-password section for email users

The system SHALL display a "Seguridad" section in edit mode on the profile page only when the current user authenticated via email/password.

#### Scenario: Email user enters edit mode

- **WHEN** an authenticated user with `authMethod` equal to `"email"` clicks "Editar preferencias"
- **THEN** the page SHALL render the "Seguridad" section with a password change form containing fields for old password, new password, and confirm new password
- **AND** "Guardar contraseña" and "Cancelar" buttons

#### Scenario: User cancels password change

- **WHEN** the user clicks "Cancelar" on the password form
- **THEN** the section SHALL clear all password fields and any validation errors

#### Scenario: Google user enters edit mode

- **WHEN** an authenticated user with `authMethod` equal to `"google"` clicks "Editar preferencias"
- **THEN** the page SHALL NOT render the "Seguridad" section

### Requirement: Password change validates input

The system SHALL validate the password change form before submission.

#### Scenario: User submits matching new passwords

- **WHEN** an email user fills in old password, new password, and confirm new password with matching new/confirm values
- **THEN** the system SHALL accept the submission, clear the fields, and show a success confirmation

#### Scenario: User submits mismatched new passwords

- **WHEN** an email user fills in new password and confirm new password with different values
- **THEN** the system SHALL prevent submission and display a validation error

## ADDED Requirements

### Requirement: Notification preferences management

The system SHALL allow authenticated users to manage their notification preferences, controlling whether they receive emails for purchases and order tracking, appointment-related activity, and news / recommendations.

#### Scenario: Email user views notification preferences in edit mode

- **WHEN** an authenticated user with `authMethod` equal to `"email"` clicks "Editar preferencias"
- **THEN** the page SHALL render a "Preferencias de notificaciones" section with toggles for: order & tracking updates, appointment reminders, and news & recommendations
- **AND** each toggle SHALL reflect the user's currently persisted preference

#### Scenario: User updates notification preferences

- **WHEN** the user changes any toggle and clicks "Guardar preferencias"
- **THEN** the system SHALL persist the updated preferences
- **AND** the user SHALL see a success confirmation

#### Scenario: User cancels notification preferences editing

- **WHEN** the user clicks "Cancelar" on the notification preferences form
- **THEN** the section SHALL restore the toggles to the previously persisted values

#### Scenario: Notification preferences persist across sessions

- **WHEN** the user updates a notification preference and later reloads the page
- **THEN** the toggles SHALL reflect the persisted values

### Requirement: Profile page shows account deletion section

The system SHALL provide an "Eliminar cuenta" option on the profile page, visible only in edit mode.

#### Scenario: User enters edit mode

- **WHEN** an authenticated user clicks "Editar preferencias"
- **THEN** the "Zona de peligro" section SHALL be revealed with an "Eliminar cuenta" button

#### Scenario: User initiates account deletion

- **WHEN** an authenticated user clicks "Eliminar cuenta" on `/myaccount/profile`
- **THEN** the system SHALL open a confirmation dialog

#### Scenario: Confirmation dialog displays grace period

- **WHEN** the confirmation dialog is open
- **THEN** the dialog SHALL display a message stating that the account will be deleted 15 days from the current date
- **AND** provide "Cancelar" and "Sí, eliminar" actions

#### Scenario: User confirms account deletion

- **WHEN** the user clicks "Sí, eliminar" in the confirmation dialog
- **THEN** the system SHALL clear the current session
- **AND** invalidate the `["me"]` query cache
- **AND** navigate to `/`

#### Scenario: User cancels account deletion

- **WHEN** the user clicks "Cancelar" in the confirmation dialog
- **THEN** the dialog SHALL close and the user SHALL remain on `/myaccount/profile`

### Requirement: Forgot-password placeholder page

The system SHALL provide a `/forgot-password` page where users can enter their email to request a password reset.

#### Scenario: User visits forgot-password page

- **WHEN** a user navigates to `/forgot-password`
- **THEN** the page SHALL display an email input and a "Enviar enlace" button
- **AND** a "Cancelar" button that navigates back to the previous page

#### Scenario: User submits forgot-password form

- **WHEN** a user enters an email and clicks "Enviar enlace"
- **THEN** the page SHALL display a message indicating that a reset link will be sent
- **AND** no backend request SHALL be made
