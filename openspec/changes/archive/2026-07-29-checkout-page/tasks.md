## 1. Order Service — Model & Data Layer

- [x] 1.1 Extend the `Order` type in `src/services/orders.ts` to include `shippingAddress` (id, label, street, details), `shippingDate` (ISO string), `paymentStatus` (`"pending"` | `"paid"`), and `transactionId` (string)
- [x] 1.2 Add a `createOrder(data)` function that accepts cart items + address + shipping date, assigns a generated ID and `createdAt`, sets `status: "active"` and `paymentStatus: "pending"`, appends to the in-memory array, clears the cart via `clearCart`, and returns the new order
- [x] 1.3 Add a `cancelOrder(orderId)` function that removes the order from the in-memory array — only if status is `"active"` and the 24h-before-shipping check passes; otherwise throws
- [x] 1.4 Add a `confirmPayment(orderId, transactionId)` function that sets `paymentStatus` to `"paid"` and stores the `transactionId`

## 2. Payment Service — Mock Gateway

- [x] 2.1 Create `src/services/payment.ts` with `simulatePaymentRedirect(orderId)` that returns a Promise resolving after 2 seconds with `{ transactionId, status: "paid" }`
- [x] 2.2 Create `src/query-options/payment.ts` with a `createPaymentMutation` using TanStack Query

## 3. Shipping Dates Service — Backend-Provided Work Days

- [x] 3.1 Create `src/services/shipping-dates.ts` with `fetchShippingDates` returning the next 10 work days (Mon–Fri) starting from 2 business days from today
- [x] 3.2 Create `src/query-options/shipping-dates.ts` with `createShippingDatesQueryOptions` using `["shipping-dates"]` key

## 4. Checkout Page — Route & UI

- [x] 4.1 Create the checkout route at `src/routes/_authenticated/checkout.tsx`
- [x] 4.2 Build the saved-address selection section: radio group of addresses from `fetchAddresses` with default pre-selected, showing label + street + details per option
- [x] 4.3 Build the "Agregar nueva dirección" inline form with label, street, details fields, "Guardar" and "Cancelar" actions, validation, and auto-select on save
- [x] 4.4 Build the shipping date section: list of work-day options from `fetchShippingDates` with formatted date + day-of-week, default pre-selected, and "días" summary
- [x] 4.5 Build the order summary section displaying cart items and subtotal
- [x] 4.6 Build the "Pagar" button that validates (address selected + date selected), calls `createOrder`, navigates to `/checkout/redirect?orderId=X`
- [x] 4.7 Handle empty-cart redirect and unauthenticated redirect on the checkout page

## 5. Checkout Redirect Page — Mock Payout

- [x] 5.1 Create the redirect route at `src/routes/_authenticated/checkout/redirect.tsx` reading `orderId` from search params
- [x] 5.2 Render a spinner with "Redirigiendo a la pasarela de pago..." for 2 seconds, then call `confirmPayment` + `simulatePaymentRedirect`, navigate to `/myaccount/orders`
- [x] 5.3 Handle missing/invalid `orderId` with error toast and redirect to `/cart`

## 6. Myaccount Orders — Extended Display & Cancel

- [x] 6.1 Update order card to display `shippingAddress` (label + street) and `shippingDate`
- [x] 6.2 Add "Cancelar pedido" button on active orders where `now < shippingDate - 24h`
- [x] 6.3 Wire up cancel button to a confirmation dialog, then call `cancelOrder` and invalidate `["orders"]` query
- [x] 6.4 Handle cancellation outside the 24h window with an error toast
- [x] 6.5 Seed the mock orders service with at least one active order (within cancel window) and one finished order for demo purposes

## 7. Cart Integration — Clear on Checkout

- [x] 7.1 Call `clearCart` after successful order creation in the checkout flow
- [x] 7.2 Verify the navbar cart badge resets to hidden after checkout
