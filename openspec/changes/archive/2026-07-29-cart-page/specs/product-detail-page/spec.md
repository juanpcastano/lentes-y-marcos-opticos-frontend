## MODIFIED Requirements

### Requirement: Add to cart button layout

The system SHALL provide an "Añadir al carrito" button on the product detail page. When the authenticated user clicks the button, the system SHALL call the cart service's `addToCart(productId, quantity)` via a TanStack Query mutation with an optimistic cart update and invalidation of the `["cart"]` queryKey. The existing auth-guard behavior (redirect to `/login` with a `redirect` search param when there is no user) SHALL be preserved unchanged.

#### Scenario: Button is visible

- **WHEN** the product detail page renders
- **THEN** an "Añadir al carrito" button is visible below the price and stock information

#### Scenario: Unauthenticated click redirects to login

- **WHEN** a user with no session clicks the "Añadir al carrito" button
- **THEN** the system SHALL navigate to `/login` with a `redirect` search param pointing back to the current product detail page and SHALL NOT call the cart service

#### Scenario: Authenticated click adds to cart optimistically

- **WHEN** an authenticated user clicks the "Añadir al carrito" button
- **THEN** the system SHALL call `addToCart(productId, 1)` via a TanStack Query mutation
- **AND** the `["cart"]` query SHALL be invalidated so the cart reflects the added item
- **AND** the cart in `localStorage` SHALL contain the product with the merged quantity
