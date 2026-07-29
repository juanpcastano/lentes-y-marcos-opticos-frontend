## ADDED Requirements

### Requirement: Mock payout gateway service

The system SHALL provide an in-memory service at `src/services/payment.ts` with a function `simulatePaymentRedirect(orderId: string): Promise<{ transactionId: string; status: "paid" }>` that simulates a 2-second delay and returns a fake transaction ID and a `"paid"` status.

#### Scenario: Simulate payment returns after delay

- **WHEN** `simulatePaymentRedirect("order-1")` is invoked
- **THEN** it SHALL wait 2000ms and return an object with a `transactionId` (a generated UUID-like string) and `status: "paid"`

### Requirement: Payment query options

The system SHALL expose a TanStack Query mutation for executing the payment simulation, using the key pattern `["payment", "simulate"]`.

#### Scenario: Payment mutation created

- **WHEN** the payment mutation is invoked with an `orderId`
- **THEN** it SHALL call `simulatePaymentRedirect(orderId)` and return the result
