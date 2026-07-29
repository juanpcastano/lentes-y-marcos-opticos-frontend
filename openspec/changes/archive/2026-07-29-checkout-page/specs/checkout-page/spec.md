## ADDED Requirements

### Requirement: Checkout page route

The system SHALL render a functional checkout page at `/checkout` inside the authenticated layout. The page SHALL be wrapped in a `w-full max-w-2xl` container with an `<h1>` "Finalizar Compra" heading.

#### Scenario: Unauthenticated user redirected

- **WHEN** an unauthenticated user navigates to `/checkout`
- **THEN** the system SHALL redirect to `/login`

#### Scenario: Authenticated user with empty cart redirected

- **WHEN** an authenticated user navigates to `/checkout` and the cart has no items
- **THEN** the system SHALL redirect to `/cart`

#### Scenario: Authenticated user with cart items sees checkout

- **WHEN** an authenticated user navigates to `/checkout` and the cart has one or more items
- **THEN** the system SHALL render the checkout page with the address section, shipping date section, order summary, and "Pagar" CTA

### Requirement: Saved address selection

The checkout page SHALL display a list of the user's saved addresses (fetched from `fetchAddresses`) as radio options. Each option SHALL show the address label, street, and details. The default address SHALL be pre-selected. The list SHALL be rendered as a group of selectable cards or radio buttons.

#### Scenario: Addresses loaded and default pre-selected

- **WHEN** the checkout page loads and the user has saved addresses
- **THEN** the system SHALL render a list of address options with the default address pre-selected

#### Scenario: User selects a different saved address

- **WHEN** the user clicks on a non-default saved address option
- **THEN** the selected address SHALL change to the clicked option and the previously selected option SHALL be deselected

#### Scenario: No saved addresses

- **WHEN** the checkout page loads and the user has zero saved addresses
- **THEN** the system SHALL hide the address list and show only the "Agregar nueva dirección" inline form

### Requirement: Add new address inline

The checkout page SHALL display an "Agregar nueva dirección" button below the address list. When activated, the system SHALL reveal an inline form with fields: label (e.g. "Casa", "Oficina"), street, and details. The form SHALL have "Guardar" and "Cancelar" actions. On save, the new address SHALL be persisted via `addAddress` and automatically selected in the address list.

#### Scenario: User opens the add-address form

- **WHEN** the user clicks "Agregar nueva dirección"
- **THEN** the system SHALL render an inline form with label, street, and details fields, and "Guardar" and "Cancelar" buttons

#### Scenario: User saves a new address

- **WHEN** the user fills label, street, and details and clicks "Guardar"
- **THEN** the system SHALL call `addAddress` with the entered data, add the address to the list, and select it automatically
- **AND** the inline form SHALL close

#### Scenario: User cancels adding a new address

- **WHEN** the user clicks "Cancelar" on the inline form
- **THEN** the form SHALL close without saving, and the previously selected address SHALL remain selected

#### Scenario: Address validation prevents empty submission

- **WHEN** the user clicks "Guardar" with one or more required fields empty
- **THEN** the system SHALL display inline validation errors and SHALL NOT call `addAddress`

### Requirement: Shipping date selection

The checkout page SHALL display a list of available shipping dates returned by the `fetchShippingDates` service. Dates SHALL be work days only (Monday–Friday). Each option SHALL display the formatted date and the day of the week. The first available date (soonest) SHALL be pre-selected.

#### Scenario: Shipping dates loaded from backend

- **WHEN** the checkout page loads the shipping date section
- **THEN** the system SHALL call `fetchShippingDates` and render a list of work-day-only date options

#### Scenario: User selects a shipping date

- **WHEN** the user clicks on a different shipping date option
- **THEN** the selected date SHALL change to the clicked option

#### Scenario: Days-away summary

- **WHEN** a shipping date is selected
- **THEN** the system SHALL display "Tu pedido llegará en N días" below the date options, where N is the number of days from today

### Requirement: Shipping dates service

The system SHALL provide an in-memory service at `src/services/shipping-dates.ts` with a function `fetchShippingDates` that returns an array of available shipping dates as work days (Monday–Friday) only. The service SHALL return the next 10 work days starting from a configurable lead time (default: 2 business days from today).

#### Scenario: fetchShippingDates returns work days only

- **WHEN** `fetchShippingDates` is invoked
- **THEN** it SHALL return an array of ISO date strings representing work days only (no Saturdays or Sundays)

#### Scenario: Shipping dates exclude weekends

- **WHEN** the next calendar day is a Saturday
- **THEN** the first available shipping date SHALL be the following Monday (or Tuesday if Monday is a holiday, but holidays are out of scope)

### Requirement: Shipping dates query options

The system SHALL expose a TanStack Query `queryOptions` factory at `src/query-options/shipping-dates.ts` named `createShippingDatesQueryOptions`. The query key SHALL be `["shipping-dates"]`.

#### Scenario: Query options created

- **WHEN** `createShippingDatesQueryOptions` is called
- **THEN** it SHALL return a `queryOptions` object with `queryKey: ["shipping-dates"]` and `queryFn: fetchShippingDates`

### Requirement: Order summary

The checkout page SHALL display an order summary section showing the cart items (name, quantity, price), the subtotal (from the cart), and a grand total matching the subtotal (no shipping or tax).

#### Scenario: Order summary renders cart items

- **WHEN** the checkout page renders with a cart containing 2 items
- **THEN** the summary SHALL list both items with their quantities and line totals, followed by the subtotal

#### Scenario: Grand total matches subtotal

- **WHEN** the order summary is rendered
- **THEN** the grand total SHALL equal the subtotal (no shipping or tax added)

### Requirement: Pagar CTA and submission

The checkout page SHALL render a "Pagar" button below the order summary. On click, the system SHALL validate all fields (address selected, shipping date selected), create a pending order in the order service, and navigate to `/checkout/redirect?orderId=<orderId>`.

#### Scenario: Successful submission navigates to redirect

- **WHEN** the user selects an address, selects a shipping date, and clicks "Pagar"
- **THEN** the system SHALL create a pending order with `status: "active"`, `paymentStatus: "pending"`, the cart items, the selected address, and the selected shipping date
- **AND** the system SHALL navigate to `/checkout/redirect?orderId=<orderId>`
- **AND** the cart SHALL be cleared

#### Scenario: Duplicate-submission guard

- **WHEN** the user clicks "Pagar" while a submission is in flight
- **THEN** the button SHALL be disabled and SHALL NOT trigger a second submission

### Requirement: Checkout redirect page

The system SHALL render a route at `/checkout/redirect?orderId=<orderId>` that simulates a payment gateway redirect. The page SHALL display a spinner with the message "Redirigiendo a la pasarela de pago..." for 2 seconds, then update the order's `paymentStatus` to `"paid"` and navigate to `/myaccount/orders`.

#### Scenario: Redirect page shows spinner

- **WHEN** the user lands on `/checkout/redirect?orderId=abc-123`
- **THEN** the system SHALL render a full-screen spinner with the text "Redirigiendo a la pasarela de pago..."

#### Scenario: Redirect completes after 2 seconds

- **WHEN** 2 seconds have elapsed on the redirect page
- **THEN** the system SHALL set the order's `paymentStatus` to `"paid"`
- **AND** the system SHALL navigate to `/myaccount/orders`

#### Scenario: Invalid orderId shows error

- **WHEN** the user lands on `/checkout/redirect` (no orderId) or with an invalid orderId
- **THEN** the system SHALL navigate to `/cart` with an error toast "Error al procesar el pago"
