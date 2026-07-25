# myaccount-orders Specification

## Purpose

Define the behavior of the authenticated user's orders page under `/myaccount/orders`, including the in-memory order data service, TanStack Query integration, the route/page rendering, the two-state order model (`active` / `finished`), the tabbed UI for switching between active and finished orders, the per-order card display, and the empty-state messaging.

## Requirements

### Requirement: Order data service

The system SHALL provide an in-memory service that returns a mock list of orders for the currently authenticated user. Each order's `status` SHALL be either `active` or `finished` — no other states SHALL be used.

#### Scenario: Service returns orders

- **WHEN** the `fetchOrders` service is invoked
- **THEN** it SHALL return an array of order objects containing `id`, `createdAt`, `status` (either `active` or `finished`), `items`, and `total`

### Requirement: Order query options

The system SHALL expose a TanStack Query `queryOptions` factory for fetching orders.

#### Scenario: Query options created

- **WHEN** `createOrdersQueryOptions` is called
- **THEN** it SHALL return a `queryOptions` object with `queryKey: ["orders"]` and `queryFn: fetchOrders`

### Requirement: Orders page route

The system SHALL render a functional orders page at `/myaccount/orders` inside the authenticated account layout, matching the profile page's spacing and aesthetic.

#### Scenario: Authenticated user visits orders page

- **WHEN** an authenticated user navigates to `/myaccount/orders`
- **THEN** the system SHALL display the orders page wrapped in a `w-full max-w-2xl` container, with an `<h1>` "Pedidos" styled as `text-2xl font-bold` and followed by a `mb-6` spacing block
- **AND** the system SHALL display a shadcn/ui Tabs component with two tabs: "Pedidos Activos" and "Pedidos Finalizados" placed directly below the title block

### Requirement: Two-state order model

The system SHALL model order progress using only two states: `active` and `finished`. There SHALL be no intermediate sub-states (e.g. pending, processing, shipped, delivered, cancelled) for active orders.

#### Scenario: Active orders

- **WHEN** an order has `status` equal to `active`
- **THEN** the order SHALL appear under the "Pedidos Activos" tab

#### Scenario: Finished orders

- **WHEN** an order has `status` equal to `finished`
- **THEN** the order SHALL appear under the "Pedidos Finalizados" tab

### Requirement: Tabs component

The system SHALL use a shadcn/ui Tabs component to switch between active and finished orders, rather than rendering separate stacked sections.

#### Scenario: Tab switching

- **WHEN** the user selects either the "Pedidos Activos" or "Pedidos Finalizados" trigger
- **THEN** the system SHALL display only the orders matching that tab's filter, hiding orders from the other group

### Requirement: Order card display

The system SHALL render each order as a card showing the order ID, date, items summary, and total price. No status badge SHALL be rendered per card, since the active tab already conveys the order's state.

#### Scenario: Order card rendered

- **WHEN** an order is displayed in either tab
- **THEN** the card SHALL show the order ID, formatted creation date, a list of item names with quantities, and the order total

### Requirement: Empty state

The system SHALL display a friendly empty state when a tab contains no orders.

#### Scenario: No active orders

- **WHEN** the "Pedidos Activos" tab contains zero orders
- **THEN** the system SHALL render a message indicating there are no active orders

#### Scenario: No finished orders

- **WHEN** the "Pedidos Finalizados" tab contains zero orders
- **THEN** the system SHALL render a message indicating there are no finished orders