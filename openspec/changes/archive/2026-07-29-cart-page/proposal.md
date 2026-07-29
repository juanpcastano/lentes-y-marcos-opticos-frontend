## Why

The `/cart` and `/checkout` routes exist only as stubs. Before checkout and payment can be built, the cart needs a state layer whose contract mirrors a future backend, so a server-side cart drops in later without UI or query-layer changes. The `auth.ts` precedent — a localStorage mock behind async functions shaped like future API calls — is the template. The product detail page already scaffolds an "Añadir al carrito" button behind an auth guard with a `// TODO` placeholder; wiring it to the new cart service makes the cart reachable from real UI flow rather than requiring a dev-only seeder.

## What Changes

- Introduce `src/services/cart.ts`: a localStorage-backed mock cart persisting under `MOCK_CART_KEY`, exposing async functions `fetchCart`, `addToCart`, `updateQuantity`, `removeFromCart`, and `clearCart`. The cart starts empty (no seeded default).
- Add `src/query-options/cart.ts`: a `createCartQueryOptions` factory following the project canon.
- Replace the `/cart` stub with the cart page: per-line image, name, resolved unit price, quantity stepper, line total, remove control; subtotal (tax-inclusive, COP-formatted); empty-state messaging; an "Ir a pagar" CTA navigating to `/checkout`.
- Line items persist only `{ productId, quantity }`; `name`, `imageUrl`, and `unitPrice` are resolved at fetch time by joining against `fetchProducts()`, mirroring how a server recomputes totals. The UI never reads an embedded price snapshot.
- Wire the existing "Añadir al carrito" button at `product.$id.tsx` (currently `// TODO: actual add to cart logic`) to a `useMutation` calling `addToCart`, with optimistic cart update and `["cart"]` queryKey invalidation. The existing auth-guard behavior (redirect to `/login` with a redirect search param when no user) is preserved unchanged.
- The `/checkout` route remains a stub. Building the checkout page, Wompi gateway integration, shipping, and tax/IVA computation are out of scope and deferred to a separate change.

## Capabilities

### New Capabilities

- `cart-page`: Cart state service (localStorage mock), cart query options, the `/cart` page rendering (line items, quantity stepper, remove, subtotal, empty state, "Ir a pagar" CTA), and cart persistence across refresh.

### Modified Capabilities

- `product-detail-page`: The "Añadir al carrito" button SHALL call the cart service's `addToCart(productId, quantity)` via a TanStack Query mutation with optimistic cart update and query invalidation, replacing the current `// TODO` placeholder.

## Impact

- New files: `src/services/cart.ts`, `src/query-options/cart.ts`.
- Modified files: `src/routes/_main-layout/_authenticated/cart.tsx` (stub → real page), `src/routes/_main-layout/product.$id.tsx` (wire "Añadir al carrito" to the cart service).
- Dependencies: TanStack Query, the existing `fetchProducts` service (join for resolved line fields), `formatCop` from `src/services/orders.ts` (subtotal formatting), shadcn/ui primitives (Button, Input for the stepper, Card).
- Out of scope: `/checkout` implementation, Wompi gateway integration, shipping cost/address, tax/IVA computation, product variants/SKU on line items (pending a separate product decision).
