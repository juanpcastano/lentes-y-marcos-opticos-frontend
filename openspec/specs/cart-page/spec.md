# Cart Page

## Purpose

TBD

## Requirements

### Requirement: Cart data service

The system SHALL provide an in-memory cart service at `src/services/cart.ts` that persists cart state to `localStorage` under a `MOCK_CART_KEY` constant and exposes async functions `fetchCart`, `addToCart`, `updateQuantity`, `removeFromCart`, and `clearCart`. The cart SHALL start empty when no persisted cart exists (no seeded default).

#### Scenario: fetchCart returns an empty cart when nothing is persisted

- **WHEN** `fetchCart` is invoked and `localStorage` has no entry under `MOCK_CART_KEY`
- **THEN** it SHALL return a `Cart` with `id`, an empty `items` array, and `subtotal: 0`

#### Scenario: fetchCart persists and retrieves items

- **WHEN** `addToCart(productId, quantity)` is invoked and then `fetchCart` is invoked
- **THEN** `fetchCart` SHALL return a `Cart` whose `items` include an entry for `productId` with the added `quantity`

#### Scenario: addToCart merges duplicate products

- **WHEN** `addToCart(productId, qty)` is invoked for a `productId` already in the cart
- **THEN** the persisted quantity for that `productId` SHALL be the sum of the existing and new quantities (no duplicate line is created)

#### Scenario: updateQuantity sets an absolute quantity

- **WHEN** `updateQuantity(productId, quantity)` is invoked with `quantity` greater than or equal to `1`
- **THEN** the persisted quantity for that `productId` SHALL become exactly `quantity`

#### Scenario: updateQuantity rejects values below one

- **WHEN** `updateQuantity(productId, quantity)` is invoked with `quantity` less than `1`
- **THEN** the service SHALL remove the line for that `productId` from the persisted cart (equivalent to `removeFromCart`)

#### Scenario: removeFromCart drops a line

- **WHEN** `removeFromCart(productId)` is invoked
- **THEN** the persisted cart SHALL no longer contain an entry for `productId`

#### Scenario: clearCart empties the cart

- **WHEN** `clearCart` is invoked
- **THEN** the persisted cart SHALL have an empty `items` array and `fetchCart` SHALL subsequently return `subtotal: 0`

#### Scenario: Stale product references are dropped

- **WHEN** `fetchCart` is invoked and a persisted line's `productId` no longer exists in the catalog returned by `fetchProducts`
- **THEN** that line SHALL be omitted from the returned `Cart` and removed from the persisted cart

### Requirement: Cart line item model

The persisted cart SHALL store each line as `{ productId, quantity }` and nothing else. `fetchCart` SHALL return each line enriched with `name`, `imageUrl`, `unitPrice`, and `lineTotal`, resolved at fetch time by joining `productId` against `fetchProducts()`. The UI SHALL NOT read an embedded price or name snapshot from persisted state.

#### Scenario: Persisted shape is minimal

- **WHEN** the cart is persisted to `localStorage`
- **THEN** each line SHALL contain only `productId` and `quantity` fields

#### Scenario: Resolved fields are computed at fetch

- **WHEN** `fetchCart` returns a `CartLine`
- **THEN** the line SHALL include `name`, `imageUrl`, `unitPrice` sourced from the matching `fetchProducts` entry, and `lineTotal` equal to `unitPrice * quantity`

### Requirement: Cart query options

The system SHALL expose a TanStack Query `queryOptions` factory at `src/query-options/cart.ts` named `createCartQueryOptions` following the project canon. The query key SHALL be `["cart"]`.

#### Scenario: Query options created

- **WHEN** `createCartQueryOptions` is called
- **THEN** it SHALL return a `queryOptions` object with `queryKey: ["cart"]` and `queryFn: fetchCart`

### Requirement: Cart page route and layout

The system SHALL render a functional cart page at `/cart` inside the authenticated layout, replacing the current stub. The page SHALL be wrapped in a `w-full max-w-2xl` container (or a width consistent with the orders/account pages) with an `<h1>` "Carrito" heading.

#### Scenario: Authenticated user visits an empty cart

- **WHEN** an authenticated user navigates to `/cart` and the cart has no items
- **THEN** the system SHALL render the empty-state UI in place of the line-item list

#### Scenario: Authenticated user visits a populated cart

- **WHEN** an authenticated user navigates to `/cart` and the cart has one or more items
- **THEN** the system SHALL render the cart line-item list followed by the subtotal and the "Ir a pagar" CTA

### Requirement: Cart line item display

Each cart line SHALL display the product image, product name, unit price (COP-formatted via `formatCop`), a quantity stepper, the line total (COP-formatted), and a remove control.

#### Scenario: Line item renders resolved fields

- **WHEN** a cart line with `unitPrice` 459900 and `quantity` 2 is rendered
- **THEN** the unit price SHALL display as COP-formatted `459.900` (per `formatCop`) and the line total SHALL display as COP-formatted `919.800`

#### Scenario: Quantity stepper increments

- **WHEN** the user activates the increment control on a line
- **THEN** the system SHALL call `updateQuantity(productId, currentQuantity + 1)` and the displayed quantity SHALL reflect the new value after the optimistic update settles

#### Scenario: Quantity stepper decrements with floor at one

- **WHEN** the user activates the decrement control on a line whose quantity is greater than one
- **THEN** the system SHALL call `updateQuantity(productId, currentQuantity - 1)`

#### Scenario: Quantity stepper at one does not decrement to zero via the stepper

- **WHEN** the user activates the decrement control on a line whose quantity is one
- **THEN** the system SHALL NOT call `updateQuantity` with a value below one; the quantity SHALL remain one (removal is performed via the remove control instead)

#### Scenario: Remove control drops a line

- **WHEN** the user activates the remove control on a line
- **THEN** the system SHALL call `removeFromCart(productId)` and the line SHALL no longer render

### Requirement: Subtotal computation and display

The cart page SHALL display a subtotal equal to `Σ lineTotal` across all cart lines, COP-formatted via `formatCop`. No shipping, tax, or grand-total field SHALL be displayed on the cart page.

#### Scenario: Subtotal reflects all lines

- **WHEN** the cart contains lines with line totals 459900 and 35000
- **THEN** the subtotal SHALL display as COP-formatted `494.900`

#### Scenario: Empty cart shows zero subtotal

- **WHEN** the cart is empty
- **THEN** no subtotal value SHALL be rendered (the empty state is shown instead)

### Requirement: Empty cart state

The system SHALL render an empty-state view when the cart has no items, with messaging guiding the user to the catalog and a navigation affordance to `/catalog`.

#### Scenario: Empty state renders

- **WHEN** the cart is empty and the user is on `/cart`
- **THEN** the system SHALL render messaging indicating the cart is empty and a control linking to `/catalog`

### Requirement: Ir a pagar CTA

The cart page SHALL render an "Ir a pagar" CTA that navigates to `/checkout`. The CTA SHALL be rendered only when the cart has one or more items.

#### Scenario: CTA navigates to checkout

- **WHEN** the cart has items and the user activates the "Ir a pagar" CTA
- **THEN** the system SHALL navigate to `/checkout`

#### Scenario: CTA is hidden on empty cart

- **WHEN** the cart is empty
- **THEN** the "Ir a pagar" CTA SHALL NOT be rendered

### Requirement: Cart persistence across refresh

Cart state SHALL persist across page refreshes via `localStorage` under `MOCK_CART_KEY`. Reloading `/cart` SHALL display the same items and quantities as before the reload.

#### Scenario: Persistence across reload

- **WHEN** the user adds items to the cart and then reloads `/cart`
- **THEN** the rendered cart SHALL match the cart before reload, including quantities and line totals

### Requirement: Future backend swap surface

The cart service functions SHALL be async and return typed data, so replacing the localStorage-backed bodies with `fetch` calls to a future `/api/cart` endpoint requires no changes to the UI or query layer. The `["cart"]` queryKey SHALL be the single invalidation seam.

#### Scenario: Service contract is swap-ready

- **WHEN** the cart service is inspected
- **THEN** every exported function SHALL return a `Promise` and the UI SHALL consume the cart exclusively through TanStack Query using the `["cart"]` queryKey

### Requirement: Add-to-cart feedback

The system SHALL provide visible feedback when a product is successfully added to the cart, at three scopes: a toast confirmation, a live navbar cart count badge, and an inline button state change on the product detail page.

#### Scenario: Toast confirmation on successful add

- **WHEN** an authenticated user successfully adds a product to the cart via the "Añadir al carrito" button
- **THEN** a success toast SHALL appear showing "Producto añadido al carrito" together with a "Ver carrito" action that navigates to `/cart`

#### Scenario: Toast on add failure

- **WHEN** the `addToCart` mutation fails
- **THEN** an error toast SHALL appear and no optimistic cart update SHALL remain

#### Scenario: Navbar cart count badge

- **WHEN** an authenticated user has one or more items in the cart
- **THEN** the navbar shopping-cart icon SHALL display a badge with the total item count (`Σ quantity` across lines)
- **AND** the badge SHALL NOT render when the cart is empty or the user is unauthenticated

#### Scenario: Button pending state

- **WHEN** the "Añadir al carrito" mutation is pending
- **THEN** the button SHALL render a spinner, become disabled, and not accept additional clicks

#### Scenario: Button becomes "Ver carrito" link after add

- **WHEN** an authenticated user has successfully added the product to the cart (or the cart already contains this product's `productId`)
- **THEN** the product detail page SHALL render a text line "El ítem ya ha sido añadido a tu carrito." immediately above the cart action
- **AND** the "Añadir al carrito" button SHALL be replaced by a "Ver carrito" link that navigates to `/cart`
- **AND** no "Añadir al carrito" control SHALL be present on the product detail page while the product remains in the cart

#### Scenario: Button returns to "Añadir al carrito" after removal

- **WHEN** the product is no longer in the cart (the user removed it on the cart page)
- **THEN** the product detail page SHALL render the "Añadir al carrito" button again, allowing a new add

#### Scenario: No feedback for unauthenticated click

- **WHEN** an unauthenticated user clicks "Añadir al carrito"
- **THEN** the system SHALL redirect to `/login` without rendering any cart feedback (no toast, no badge, no "Ver carrito" link)

### Requirement: Duplicate-submission guard on cart mutations

Every cart-affecting mutation trigger (the PDP "Añadir al carrito" button, the cart page quantity stepper controls, and the cart page remove control) SHALL prevent re-entry while a mutation for that action is in flight, so rapid repeated clicks cannot queue duplicate mutations, duplicate cart lines, or duplicate toasts.

#### Scenario: Rapid double-click on add-to-cart does not duplicate

- **WHEN** an authenticated user clicks the "Añadir al carrito" button twice in quick succession before the first mutation settles
- **THEN** only one `addToCart` mutation SHALL execute, only one toast SHALL appear, and the cart SHALL contain the product added exactly once (quantity increased by one, not two)

#### Scenario: Rapid double-click on quantity stepper does not duplicate

- **WHEN** the user clicks the increment or decrement control twice in quick succession before the first `updateQuantity` mutation settles
- **THEN** only one `updateQuantity` mutation SHALL execute and the displayed quantity SHALL change by one, not two

#### Scenario: Rapid double-click on remove does not error

- **WHEN** the user clicks the remove control twice in quick succession before the first `removeFromCart` mutation settles
- **THEN** only one `removeFromCart` mutation SHALL execute and the system SHALL not error on the redundant click

#### Scenario: Trigger disabled during pending mutation

- **WHEN** a cart mutation is pending
- **THEN** its trigger SHALL be disabled and SHALL not accept additional clicks
