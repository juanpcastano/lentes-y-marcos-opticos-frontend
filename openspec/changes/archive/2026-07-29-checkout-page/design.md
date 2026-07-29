## Context

The app has a cart page with an "Ir a pagar" CTA pointing to `/checkout`, but no checkout route exists. The myaccount-orders page exists with a basic two-state (`active`/`finished`) order model backed by hardcoded data. The `addresses.ts` service already provides CRUD operations for saved addresses with a default one pre-seeded. There is no real backend — all data must remain in-memory.

This change introduces a three-step checkout flow (address → shipping date → mock payout redirect), creates real orders from successful checkouts, and enriches the orders page to display them with cancellation support.

## Goals / Non-Goals

**Goals:**

- Functional checkout page at `/checkout` with address selection (from saved addresses), shipping date selection (work-day-only dates from backend), and mock payout redirect
- Use the existing `addresses.ts` service for saved addresses; add new address inline during checkout
- Ship a `shipping-dates.ts` service returning work-day-only dates (Mon–Fri) with a configurable lead time
- In-memory order creation service that writes orders from checkout
- Updated myaccount-orders page showing real orders with items, totals, addresses, and shipping dates
- Cancel/delete control on active orders when current time is at least 24 hours before `shippingDate`
- Cart cleared on successful checkout

**Non-Goals:**

- Real payment gateway integration (Placetopay will be mocked in a future real integration)
- Shipping cost calculation, taxes, or discounts
- Email notifications or order status tracking beyond `active`/`finished`
- Address book management page (users add addresses inline during checkout; full management is out of scope)
- Shipping date validation against real carrier calendars

## Decisions

| Decision              | Choice                                                                                                                  | Rationale                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checkout steps        | Single-page form with sections (not multi-page wizard)                                                                  | Simpler to implement, less route complexity. Still provides clear visual separation between address, date, and confirmation sections.                           |
| Address selection     | List radio group of saved addresses + "Agregar nueva dirección" inline form                                             | Leverages existing `addresses.ts` service (with `fetchAddresses`, `addAddress`). Users can pick a saved address or add one on the fly without leaving checkout. |
| Shipping date         | Backend returns work-day-only dates (Mon–Fri). UI renders a list of clickable date options, not a `<input type="date">` | Avoids the user selecting weekends. The `shipping-dates.ts` service computes N available work days starting from a lead time (e.g. 2 business days out).        |
| Payout simulation     | Route at `/checkout/redirect?orderId=X` that auto-redirects after 2s delay                                              | Mimics a Placetopay-style redirect flow. The query param carries the pending order; on "return", the order status flips to `active`.                            |
| Order persistence     | In-memory array (module-level), initialized from hardcoded data                                                         | Matches the project's "all data hardcoded in-memory" pattern.                                                                                                   |
| Order model extension | Add `shippingAddress`, `shippingDate`, `paymentStatus`, `transactionId` to existing order type                          | Minimal addition to the current two-state model. `finished` orders cannot be cancelled.                                                                         |
| Cancellation window   | `shippingDate - 24h > now` for `active` orders                                                                          | Simple client-side check. The delete button renders only when this condition is true.                                                                           |

## Risks / Trade-offs

- [**In-memory data loss**] Orders reset on page refresh. Mitigation: Acceptable for MVP; the service layer is async and returns `Promise`, so swapping to a real API later requires no UI changes.
- [**Fake payout redirect**] The 2s simulated delay could be confusing. Mitigation: Show a clear spinner with "Redirigiendo a la pasarela de pago..." messaging and a fake URL in the address bar.
- [**No real shipping dates**] Dates are mocked. Mitigation: The `shipping-dates` service is a clean backend seam — swapping to a real endpoint later is a one-file change.
