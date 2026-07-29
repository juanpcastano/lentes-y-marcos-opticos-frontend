## ADDED Requirements

### Requirement: Address list page

The system SHALL render an addresses management page at `/myaccount/addresses` within the existing My Account layout, displaying the user's saved addresses or an empty state.

#### Scenario: Authenticated user with saved addresses visits the page

- **WHEN** an authenticated user navigates to `/myaccount/addresses` and has one or more saved addresses
- **THEN** the page SHALL display each address as a card containing: label, street, details, and a default-address indicator
- **AND** each card SHALL provide "Editar" and "Eliminar" actions

#### Scenario: Authenticated user with no saved addresses visits the page

- **WHEN** an authenticated user navigates to `/myaccount/addresses` and has no saved addresses
- **THEN** the page SHALL display an empty state with messaging indicating there are no addresses and a "Agregar dirección" button

#### Scenario: Unauthenticated user visits the page

- **WHEN** an unauthenticated user navigates to `/myaccount/addresses`
- **THEN** the router SHALL redirect to `/login?redirect=/myaccount/addresses`

### Requirement: Add new address

The system SHALL provide a form for adding a new address, accessible from `/myaccount/addresses`.

#### Scenario: User opens the add-address form

- **WHEN** the user clicks "Agregar dirección"
- **THEN** the system SHALL open a dialog containing fields for: label, a composite street address (type select, three number inputs separated by # and -), and details
- **AND** a checkbox to mark the address as the default
- **AND** "Guardar" and "Cancelar" buttons

#### Scenario: User submits a valid new address

- **WHEN** the user fills in all required fields and clicks "Guardar"
- **THEN** the system SHALL persist the new address
- **AND** close the dialog
- **AND** display the new address in the list
- **AND** show a success confirmation

#### Scenario: User submits an invalid address form

- **WHEN** the user clicks "Guardar" with empty required fields
- **THEN** the system SHALL prevent submission and display validation errors on the offending fields

#### Scenario: User cancels adding an address

- **WHEN** the user clicks "Cancelar"
- **THEN** the dialog SHALL close without persisting any data
- **AND** any partially filled fields SHALL be discarded

### Requirement: Edit existing address

The system SHALL allow users to edit any saved address.

#### Scenario: User opens the edit-address form

- **WHEN** the user clicks "Editar" on an address card
- **THEN** the system SHALL open a dialog pre-filled with the existing address values
- **AND** the same fields and actions as the add-address form SHALL be available

#### Scenario: User submits a valid edit

- **WHEN** the user changes fields and clicks "Guardar"
- **THEN** the system SHALL persist the updated values
- **AND** close the dialog
- **AND** update the corresponding card in the list
- **AND** show a success confirmation

#### Scenario: User cancels editing

- **WHEN** the user clicks "Cancelar"
- **THEN** the dialog SHALL close and the address list SHALL remain unchanged

### Requirement: Delete address

The system SHALL allow users to delete a saved address with confirmation.

#### Scenario: User initiates deletion

- **WHEN** the user clicks "Eliminar" on an address card
- **THEN** the system SHALL open a confirmation dialog with "Cancelar" and "Sí, eliminar" actions

#### Scenario: User confirms deletion

- **WHEN** the user clicks "Sí, eliminar"
- **THEN** the system SHALL remove the address from persistence
- **AND** close the confirmation dialog
- **AND** remove the address card from the list
- **AND** show a success confirmation

#### Scenario: User cancels deletion

- **WHEN** the user clicks "Cancelar"
- **THEN** the confirmation dialog SHALL close and the address SHALL remain in the list

### Requirement: Default address management

The system SHALL allow exactly one address to be marked as the default at any time. The default address SHALL be visually distinguished in the list.

#### Scenario: User marks an address as default during add or edit

- **WHEN** the user checks the "Dirección por defecto" checkbox and saves the form
- **THEN** the system SHALL set `isDefault: true` on that address
- **AND** set `isDefault: false` on all other addresses belonging to the user

#### Scenario: Default address is visually indicated

- **WHEN** the address list renders and an address has `isDefault: true`
- **THEN** that address card SHALL display a "Por defecto" badge

### Requirement: Address data service

The system SHALL provide an in-memory address service at `src/services/addresses.ts` that persists address state to `localStorage` under a `MOCK_ADDRESSES_KEY` constant and exposes async functions `fetchAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, and `setDefaultAddress`.

#### Scenario: fetchAddresses returns hardcoded default addresses

- **WHEN** `fetchAddresses` is invoked and `localStorage` has no entry under `MOCK_ADDRESSES_KEY`
- **THEN** it SHALL return a seeded list of one or more default mock addresses associated with the current mock user

#### Scenario: addAddress creates a new address

- **WHEN** `addAddress` is invoked with address data
- **THEN** a new address SHALL be persisted with a generated `id`
- **AND** `fetchAddresses` SHALL subsequently include the new address

#### Scenario: updateAddress modifies an existing address

- **WHEN** `updateAddress` is invoked with an existing `id` and updated fields
- **THEN** the persisted address with that `id` SHALL reflect the updated fields

#### Scenario: deleteAddress removes an address

- **WHEN** `deleteAddress` is invoked with an existing `id`
- **THEN** the persisted address with that `id` SHALL be removed
- **AND** `fetchAddresses` SHALL no longer include it

#### Scenario: setDefaultAddress updates the default flag

- **WHEN** `setDefaultAddress` is invoked with an `id`
- **THEN** the address with that `id` SHALL have `isDefault: true`
- **AND** all other addresses SHALL have `isDefault: false`

### Requirement: Address query options

The system SHALL expose a TanStack Query `queryOptions` factory at `src/query-options/addresses.ts` named `createAddressesQueryOptions` following the project canon. The query key SHALL be `["addresses"]`.

#### Scenario: Query options created

- **WHEN** `createAddressesQueryOptions` is called
- **THEN** it SHALL return a `queryOptions` object with `queryKey: ["addresses"]` and `queryFn: fetchAddresses`

## MODIFIED Requirements

### Requirement: Sidebar navigation links

The sidebar SHALL contain navigation links for **Mi Perfil**, **Historial de Compras**, **Citas Agendadas**, and **Direcciones** that route to `/myaccount/profile`, `/myaccount/orders`, `/myaccount/appointments`, and `/myaccount/addresses` respectively.

#### Scenario: User clicks a sidebar navigation item

- **WHEN** the user clicks any sidebar navigation link
- **THEN** the router SHALL navigate to the corresponding route
- **AND** the sidebar SHALL remain rendered

### Requirement: Active sidebar item highlighting

The system SHALL visually distinguish the sidebar item that corresponds to the current route.

#### Scenario: Active route matches addresses page

- **WHEN** the current route is `/myaccount/addresses`
- **THEN** the "Direcciones" sidebar item SHALL receive active styling (dark background with white text)
- **AND** all other sidebar items SHALL use inactive styling
