# Myaccount Layout

## Purpose

TBD

## Requirements

### Requirement: My Account layout route

The system SHALL provide a parent layout route for all `/myaccount/*` pages that renders a left sidebar navigation panel and an `<Outlet>` for page-specific content.

#### Scenario: User navigates to any myaccount page

- **WHEN** the user visits `/myaccount/profile`, `/myaccount/orders`, or `/myaccount/appointments`
- **THEN** the layout SHALL render a sidebar on the left and the corresponding child page content on the right
- **AND** the sidebar SHALL remain visible while the child page changes

### Requirement: Sidebar navigation links

The sidebar SHALL contain navigation links for **Mi Perfil**, **Historial de Compras**, and **Citas Agendadas** that route to `/myaccount/profile`, `/myaccount/orders`, and `/myaccount/appointments` respectively.

#### Scenario: User clicks a sidebar navigation item

- **WHEN** the user clicks any sidebar navigation link
- **THEN** the router SHALL navigate to the corresponding route
- **AND** the sidebar SHALL remain rendered

### Requirement: Active sidebar item highlighting

The system SHALL visually distinguish the sidebar item that corresponds to the current route.

#### Scenario: Active route matches a sidebar item

- **WHEN** the current route is `/myaccount/profile`
- **THEN** the "Mi Perfil" sidebar item SHALL receive an active styling (dark background with white text)
- **AND** all other sidebar items SHALL use inactive styling

#### Scenario: Active route matches orders page

- **WHEN** the current route is `/myaccount/orders`
- **THEN** the "Historial de Compras" sidebar item SHALL receive active styling

#### Scenario: Active route matches appointments page

- **WHEN** the current route is `/myaccount/appointments`
- **THEN** the "Citas Agendadas" sidebar item SHALL receive active styling

### Requirement: Logout action in sidebar

The sidebar SHALL include a **Cerrar Sesión** button that logs the user out and redirects to the home page.

#### Scenario: User clicks logout

- **WHEN** the user clicks "Cerrar Sesión" in the sidebar
- **THEN** the system SHALL clear the current session
- **AND** invalidate the `["me"]` query cache
- **AND** navigate to `/`

### Requirement: Sidebar visual design

The sidebar SHALL be styled as a card with rounded corners, a subtle border, and distinct icon + label rows.

#### Scenario: Sidebar renders

- **WHEN** the sidebar is rendered
- **THEN** it SHALL display inside a white card with rounded corners and a border
- **AND** each item SHALL display an icon followed by its label
- **AND** the logout item SHALL be visually separated from the navigation items and styled in red