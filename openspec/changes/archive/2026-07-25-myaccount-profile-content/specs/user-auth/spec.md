## ADDED Requirements

### Requirement: Profile page renders personal information form

The system SHALL render a settings-style profile page at `/myaccount/profile` within the existing My Account layout.

#### Scenario: Authenticated user visits profile page

- **WHEN** an authenticated user navigates to `/myaccount/profile`
- **THEN** the page SHALL display the user's current name, email, and phone in editable input fields
- **AND** the page SHALL display a "Guardar cambios" button

### Requirement: Profile page allows editing personal information

The system SHALL allow authenticated users to update their name, email, and phone number.

#### Scenario: User updates profile information

- **WHEN** an authenticated user changes their name, email, or phone and clicks "Guardar cambios"
- **THEN** the system SHALL persist the updated values
- **AND** the user SHALL see a success confirmation

#### Scenario: User leaves fields unchanged

- **WHEN** an authenticated user visits `/myaccount/profile` and does not modify any field
- **THEN** the "Guardar cambios" button MAY remain enabled or disabled, but clicking it SHALL not produce an error

### Requirement: Profile page shows change-password section for email users

The system SHALL display a "Cambiar contraseña" section on the profile page only when the current user authenticated via email/password.

#### Scenario: Email user views profile

- **WHEN** an authenticated user with `authMethod` equal to `"email"` visits `/myaccount/profile`
- **THEN** the page SHALL render the "Cambiar contraseña" section with fields for old password, new password, and confirm new password
- **AND** a "Guardar contraseña" button

#### Scenario: Google user views profile

- **WHEN** an authenticated user with `authMethod` equal to `"google"` visits `/myaccount/profile`
- **THEN** the page SHALL NOT render the "Cambiar contraseña" section

### Requirement: Password change validates input

The system SHALL validate the password change form before submission.

#### Scenario: User submits matching new passwords

- **WHEN** an email user fills in old password, new password, and confirm new password with matching new/confirm values
- **THEN** the system SHALL accept the submission and show a success confirmation

#### Scenario: User submits mismatched new passwords

- **WHEN** an email user fills in new password and confirm new password with different values
- **THEN** the system SHALL prevent submission and display a validation error

### Requirement: Profile page shows account deletion section

The system SHALL provide an "Eliminar cuenta" option on the profile page.

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

## MODIFIED Requirements

### Requirement: User authentication state

The system SHALL maintain a global authentication state representing the currently logged-in user or an anonymous session.

#### Scenario: Authenticated user on page load

- **WHEN** the application initializes and a valid session exists
- **THEN** the system SHALL expose a user object containing `id`, `name`, `email`, `phone`, and `authMethod`

#### Scenario: Anonymous user

- **WHEN** no valid session exists
- **THEN** the system SHALL expose `null` as the current user

### Requirement: Mock auth service

The system SHALL provide hardcoded auth endpoints for local development and testing.

#### Scenario: Mock login

- **WHEN** the `login` service is called with any email and password
- **THEN** it SHALL return a mock user object, set a mock session flag in `localStorage`, and set `mock_auth_method` to `"email"`

#### Scenario: Mock signup

- **WHEN** the `signup` service is called with name, email, password, and optional phone
- **THEN** it SHALL return a mock user object including the provided phone, set a mock session flag in `localStorage`, and set `mock_auth_method` to `"email"`

#### Scenario: Mock get current user

- **WHEN** the `fetchMe` service is called and the mock session flag is present in `localStorage`
- **THEN** it SHALL return the persisted mock user object (including any profile edits)
- **AND** include `authMethod` read from `mock_auth_method`

#### Scenario: Mock logout

- **WHEN** the `logout` service is called
- **THEN** it SHALL clear the mock session flag and `mock_auth_method` from `localStorage`
- **AND** invalidate the `["me"]` query

#### Scenario: Mock Google login

- **WHEN** the `loginWithGoogleMock` service is called
- **THEN** it SHALL set the mock session flag in `localStorage` and set `mock_auth_method` to `"google"`
