# User Auth

## Purpose

TBD

## Requirements

### Requirement: User authentication state

The system SHALL maintain a global authentication state representing the currently logged-in user or an anonymous session.

#### Scenario: Authenticated user on page load

- **WHEN** the application initializes and a valid session exists
- **THEN** the system SHALL expose a user object containing `id`, `name`, `email`, `phone`, and `authMethod`

#### Scenario: Anonymous user

- **WHEN** no valid session exists
- **THEN** the system SHALL expose `null` as the current user

### Requirement: Route-level access control

The system SHALL enforce authentication before rendering any route nested under the `_authenticated` layout.

#### Scenario: Logged-out user navigates to a protected route

- **WHEN** a logged-out user attempts to access a route under `_authenticated`
- **THEN** the router SHALL redirect to `/login` with a `redirect` search parameter set to the attempted URL

#### Scenario: Logged-in user navigates to a protected route

- **WHEN** a logged-in user attempts to access a route under `_authenticated`
- **THEN** the router SHALL render the route without interruption

### Requirement: Action-level access control on public pages

The system SHALL intercept protected actions on public pages and redirect anonymous users to login.

#### Scenario: Anonymous user clicks "Añadir al carrito"

- **WHEN** an anonymous user clicks the "Añadir al carrito" button on a product detail page
- **THEN** the system SHALL navigate to `/login?redirect=/product/<id>`

#### Scenario: Anonymous user clicks "Confirmar Reserva"

- **WHEN** an anonymous user clicks the "Confirmar Reserva" button on the appointments page
- **THEN** the system SHALL navigate to `/login?redirect=/appointments`

#### Scenario: Authenticated user clicks "Añadir al carrito"

- **WHEN** an authenticated user clicks the "Añadir al carrito" button
- **THEN** the system SHALL proceed with the cart action without redirecting

#### Scenario: Authenticated user clicks "Confirmar Reserva"

- **WHEN** an authenticated user clicks the "Confirmar Reserva" button
- **THEN** the system SHALL proceed with the appointment action without redirecting

### Requirement: Navbar button access control

The system SHALL intercept navigation from navbar buttons to protected pages when the user is anonymous. The redirect parameter SHALL be the page the user was on when they clicked the button, not the protected destination.

#### Scenario: Anonymous user clicks "My Account" navbar button

- **WHEN** an anonymous user clicks the "My Account" (User icon) navbar button
- **THEN** the system SHALL open a dropdown menu with "Iniciar Sesión" (login) and "Registrarse" (signup) links

#### Scenario: Anonymous user clicks "Iniciar Sesión" in the dropdown

- **WHEN** an anonymous user on `/catalog` clicks "Iniciar Sesión" in the My Account dropdown
- **THEN** the system SHALL navigate to `/login?redirect=/catalog`

#### Scenario: Anonymous user clicks "Registrarse" in the dropdown

- **WHEN** an anonymous user on `/catalog` clicks "Registrarse" in the My Account dropdown
- **THEN** the system SHALL navigate to `/signup?redirect=/catalog`

#### Scenario: Anonymous user clicks "Cart" navbar button

- **WHEN** an anonymous user on `/product/123` clicks the "Cart" (ShoppingCart icon) navbar button
- **THEN** the system SHALL navigate to `/login?redirect=/product/123`

#### Scenario: Authenticated user clicks "My Account" navbar button

- **WHEN** an authenticated user clicks the "My Account" navbar button
- **THEN** the system SHALL open a dropdown menu with links to `/myaccount/profile`, `/myaccount/orders`, `/myaccount/appointments`, and a "Cerrar Sesión" (logout) button

#### Scenario: Authenticated user clicks "Cerrar Sesión" in the dropdown

- **WHEN** an authenticated user clicks "Cerrar Sesión" in the My Account dropdown
- **THEN** the system SHALL clear the session, invalidate the `["me"]` query, and navigate to `/`

#### Scenario: Authenticated user clicks "Cart" navbar button

- **WHEN** an authenticated user clicks the "Cart" navbar button
- **THEN** the system SHALL navigate to `/orders` without redirecting

### Requirement: Login page accepts redirect parameter

The system SHALL support a `redirect` search parameter on the `/login` route that defines the destination after successful authentication.

#### Scenario: User logs in with a redirect parameter

- **WHEN** a user successfully authenticates on `/login?redirect=/orders`
- **THEN** the system SHALL navigate to `/orders`

#### Scenario: User cancels login with a redirect parameter

- **WHEN** a user clicks the back or cancel action on `/login?redirect=/orders`
- **THEN** the system SHALL navigate back in browser history to the page the user was on before reaching the login page

#### Scenario: User logs in without a redirect parameter

- **WHEN** a user successfully authenticates on `/login` with no redirect parameter
- **THEN** the system SHALL navigate to `/`

### Requirement: Google OAuth redirect recovery

The system SHALL preserve the intended redirect URL when a user chooses Google OAuth from the login page.

#### Scenario: User initiates Google login with a pending redirect

- **WHEN** a user on `/login?redirect=/product/123` clicks "Login with Google"
- **THEN** the system SHALL store `/product/123` in `sessionStorage` under the key `auth_redirect`
- **AND** navigate to the backend Google OAuth endpoint

#### Scenario: Application recovers after Google OAuth callback

- **WHEN** the application initializes and `sessionStorage` contains `auth_redirect`
- **THEN** the system SHALL read the stored URL, remove it from `sessionStorage`, and navigate to that URL
- **AND** invalidate the `["me"]` query to fetch the updated user state

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
