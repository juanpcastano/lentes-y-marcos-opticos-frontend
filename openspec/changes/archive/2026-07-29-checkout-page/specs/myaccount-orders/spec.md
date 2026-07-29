## MODIFIED Requirements

### Requirement: Order data service

The system SHALL provide an in-memory service that returns a mock list of orders for the currently authenticated user. Each order's `status` SHALL be either `active` or `finished` — no other states SHALL be used. Orders SHALL additionally carry `shippingAddress` (object with `id`, `label`, `street`, `details`), `shippingDate` (ISO date string), `paymentStatus` (either `"pending"` or `"paid"`), and `transactionId` (string).

#### Scenario: Service returns orders with extended fields

- **WHEN** the `fetchOrders` service is invoked
- **THEN** it SHALL return an array of order objects containing `id`, `createdAt`, `status` (either `active` or `finished`), `items`, `total`, `shippingAddress` (object with `id`, `label`, `street`, `details`), `shippingDate` (ISO date string), `paymentStatus` (either `"pending"` or `"paid"`), and `transactionId` (string)

### Requirement: Order card display

The system SHALL render each order as a card showing the order ID, date, items summary, total price, shipping address (label + street), and shipping date. Active orders within the cancellation window SHALL also render a "Cancelar pedido" button. No status badge SHALL be rendered per card, since the active tab already conveys the order's state.

#### Scenario: Order card renders extended fields

- **WHEN** an order is displayed in either tab
- **THEN** the card SHALL show the order ID, formatted creation date, a list of item names with quantities, the order total, the shipping address (label and street), and the shipping date

#### Scenario: Cancel button visible within window

- **WHEN** an order has `status: "active"` and the current time is at least 24 hours before the order's `shippingDate`
- **THEN** the order card SHALL render a "Cancelar pedido" button

#### Scenario: Cancel button hidden outside window

- **WHEN** an order has `status: "active"` and the current time is less than 24 hours before the order's `shippingDate`
- **THEN** the order card SHALL NOT render a "Cancelar pedido" button

#### Scenario: Cancel button hidden for finished orders

- **WHEN** an order has `status: "finished"`
- **THEN** the order card SHALL NOT render a "Cancelar pedido" button regardless of the shipping date

## ADDED Requirements

### Requirement: Cancel order mutation

The system SHALL provide a mutation to cancel an active order. When cancelled, the order SHALL be removed from the orders array.

#### Scenario: Cancel active order within window

- **WHEN** the user clicks "Cancelar pedido" on an active order and the current time is at least 24 hours before `shippingDate`
- **THEN** the order SHALL be removed from the orders list
- **AND** a success toast SHALL appear with "Pedido cancelado con éxito"

#### Scenario: Cancel attempt outside window shows error

- **WHEN** the user clicks "Cancelar pedido" on an active order and the current time is less than 24 hours before `shippingDate`
- **THEN** the system SHALL NOT cancel the order
- **AND** an error toast SHALL appear with "No se puede cancelar el pedido faltando menos de 24 horas para el envío"

#### Scenario: Confirm dialog before cancel

- **WHEN** the user clicks "Cancelar pedido"
- **THEN** the system SHALL display a confirmation dialog asking "¿Estás seguro de cancelar este pedido?" with "Sí, cancelar" and "No" actions
- **AND** the order SHALL only be cancelled if the user confirms

### Requirement: Query invalidation on cancel

The system SHALL invalidate the `["orders"]` query key after a successful order cancellation so the UI reflects the removed order.

#### Scenario: Orders query invalidated after cancel

- **WHEN** an order is successfully cancelled
- **THEN** the `["orders"]` query SHALL be invalidated and the orders list SHALL re-render without the cancelled order
