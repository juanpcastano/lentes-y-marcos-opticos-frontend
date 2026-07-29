## MODIFIED Requirements

### Requirement: Sidebar navigation links

The sidebar SHALL contain navigation links for **Mi Perfil**, **Historial de Compras**, **Citas Agendadas**, and **Direcciones** that route to `/myaccount/profile`, `/myaccount/orders`, `/myaccount/appointments`, and `/myaccount/addresses` respectively.

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

#### Scenario: Active route matches addresses page

- **WHEN** the current route is `/myaccount/addresses`
- **THEN** the "Direcciones" sidebar item SHALL receive active styling
