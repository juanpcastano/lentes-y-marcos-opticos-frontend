## Why

The cart page currently has an "Ir a pagar" CTA pointing to `/checkout`, but no checkout route exists. Users cannot complete a purchase, select a shipping address from their saved ones, choose a shipping date, or simulate payment. Without this flow, the cart is a dead end and the orders page has no way to receive new orders.

## What Changes

- Create a new checkout page at `/checkout` with three steps: address selection, shipping date selection, and a fake redirect to a mock payout gateway
- Users pick from their saved addresses (backed by the existing `addresses.ts` service) or add a new address inline
- Shipping dates are fetched from a backend service and only include whole work days (Monday–Friday)
- On successful "payment", create an order and save it, then redirect the user to `/myaccount/orders`
- Update the myaccount-orders page to display real orders with items, totals, shipping dates, and shipping addresses
- Allow users to delete/cancel active orders up to 24 hours before the scheduled shipping date
- The checkout flow is gated behind authentication (same as cart)

## Capabilities

### New Capabilities

- `checkout-page`: Cart-to-order conversion flow — saved address selection with inline new-address option, backend-provided work-day shipping dates, mock payout gateway redirect, order creation on success
- `payout-gateway`: Fake payment gateway simulating an external redirect — generates a fake transaction ID, simulates a redirect delay, and returns a confirmation
- `shipping-dates`: Backend service that returns available shipping dates (work days only, Monday–Friday), used in the checkout page date picker

### Modified Capabilities

- `myaccount-orders`: Extend the order model to include `shippingAddress`, `shippingDate`, `items` from checkout, and the ability to cancel/delete active orders when current time is at least 24 hours before `shippingDate`

## Impact

- New route at `/checkout` inside the authenticated layout
- New route or component for the mock payout gateway redirect page (e.g. `/checkout/redirect`)
- New shipping-dates service at `src/services/shipping-dates.ts` with query options
- Order service (`src/services/orders.ts`) needs to support order creation via checkout and cancellation/deletion logic
- `myaccount-orders` spec, service, and UI need updates for enriched order model and cancel action
- Cart must be cleared after successful checkout
