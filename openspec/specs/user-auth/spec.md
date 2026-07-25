# User Auth

## Purpose

TBD

## Requirements

### Requirement: User authentication state

The system SHALL maintain a global authentication state representing the currently logged-in user or an anonymous session.

#### Scenario: Authenticated user on page load

- **WHEN** the application initializes and a valid session exists
- **THEN** the system SHALL expose a user object containing `id`, `name`, and `email`

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
- **THEN** it SHALL return a mock user object and set a mock session flag in `localStorage`

#### Scenario: Mock get current user

- **WHEN** the `fetchMe` service is called and the mock session flag is present in `localStorage`
- **THEN** it SHALL return the mock user object

#### Scenario: Mock logout

- **WHEN** the `logout` service is called
- **THEN** it SHALL clear the mock session flag from `localStorage`
- **AND** invalidate the `["me"]` query
