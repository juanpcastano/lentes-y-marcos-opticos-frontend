## Context

The `/cart` and `/checkout` routes are stubs. The product detail page (`product.$id.tsx`) already renders an "Añadir al carrito" button behind an auth guard, but the click handler is a `// TODO: actual add to cart logic` placeholder. The project has an established mock-service precedent in `src/services/auth.ts`: state persisted to `localStorage` under `MOCK_*_KEY` constants, exposed through async functions shaped like future API calls, with TanStack Query as the consumption layer. The cart service mirrors that precedent.

`src/services/orders.ts` already exports `formatCop` for COP currency formatting; the cart reuses it rather than duplicating the formatter. The existing `fetchProducts` service returns the catalog used to resolve cart line fields at fetch time.

`openspec/config.yaml` mentions Zustand and `src/store/`, but the actual codebase has no Zustand usage and the auth flow established the service/query-options pattern instead. This change follows the actual precedent for consistency.

## Goals / Non-Goals

**Goals:**

- Cart state lives behind a service contract whose function signatures match a future backend API, so swapping localStorage for `fetch("/api/cart")` is mechanical and touches neither the UI nor the query layer.
- Cart line items persist the minimum (`productId`, `quantity`); derived fields are resolved at fetch time by joining against the catalog, mirroring server-side recomputation.
- The cart page is reachable from real UI flow — clicking "Añadir al carrito" on a product detail page populates the cart; no dev-only seeder is needed.
- The cart page displays only cart-appropriate totals (subtotal). Shipping, tax, and grand total live at `/checkout` and are excluded here.

**Non-Goals:**

- Building the `/checkout` page (stays a stub). Wompi gateway integration, shipping cost/address, tax/IVA computation, and order creation are deferred to a separate change.
- Product variants / SKU on cart line items (pending a separate product decision; the line item type is structured to grow a `variantId` later if needed).
- Multi-tab cart synchronization. localStorage diverges between tabs; this is tolerated because the future backend resolves it. No optimistic-sync gymnastics.

## Decisions

### 1. Cart state owned by a localStorage-backed service, not React state or Zustand

The cart service persists under `MOCK_CART_KEY` in `localStorage` and exposes async functions (`fetchCart`, `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`). The UI consumes it via TanStack Query mutations and invalidation.

**Rationale:** This is the established pattern in `auth.ts`. `config.yaml` mentions Zustand, but no Zustand store exists in the codebase and the auth flow already committed to the service pattern. Consistency with the actual precedent trumps the aspirational config entry.

**Alternative considered:** A Zustand store with persist middleware. Rejected because it would diverge from the auth precedent and complicate the backend swap (Zustand stores client state; the future source of truth is server-side).

### 2. Line items persist `{ productId, quantity }` only; resolved fields computed at fetch time

`fetchCart` reads the persisted items, calls `fetchProducts()`, and returns each line enriched with `name`, `imageUrl`, `unitPrice`, and `lineTotal` (quantity × unitPrice). The UI consumes the enriched `CartLine[]` and never reads an embedded price snapshot.

**Rationale:** Embedded price/name snapshots go stale when the catalog changes, and they break the server-cart migration: a real backend recomputes line fields at request time from current catalog data. Designing the mock to do the same makes the swap mechanical.

**Alternative considered:** Persist the full snapshot (`productId`, `name`, `price`, `imageUrl`, `quantity`). Rejected for staleness and migration cost.

### 3. Subtotal only on the cart page; no shipping, tax, or grand total

The cart page displays `subtotal = Σ lineTotal`. No `shippingCost`, `tax`, or `total` field exists on the `Cart` type. Those belong to a `CheckoutQuote` computed at `/checkout` from cart + shipping address.

**Rationale:** The cart page is the upstream piece; payment totals depend on shipping and tax inputs that don't exist in cart state. Modeling them on the cart would force fake values the checkout later overrides.

**Alternative considered:** Include `shippingCost: 0`, `tax: 0`, `total: subtotal` on the cart for shape symmetry. Rejected because zero values are still commit-worthy defaults the checkout must overwrite; cleaner to omit.

### 4. Tax-inclusive unit prices; no tax computation in the mock

Unit prices from the catalog are treated as tax-inclusive (Colombian retail norm). Subtotal is `Σ(unitPrice × qty)` — what the customer sees and what would eventually be charged. IVA breakdown is a future disclosure line ("Includes $X IVA"), not an additive computation that drives the cart.

**Rationale:** IVA treatment for eyewear in Colombia (19% frames vs 0% prescription lenses, mixed on one order) is unresolved with the product owner. Tax-inclusive pricing sidesteps the entire rate question until it is answered. The field fed to a future Wompi integration is just the subtotal; `tax_data` can be derived later as a follower field.

**Alternative considered:** Compute tax explicitly with a hardcoded 19% rate. Rejected because the rate is unconfirmed and wrong-rate computation is worse than none.

### 5. Cart starts empty; populated via the existing PDP "Añadir al carrito" button

No dev-only seeder, no `DEFAULT_MOCK_CART`. `fetchCart` returns an empty cart when `MOCK_CART_KEY` is absent. The cart is populated by clicking the existing button on `product.$id.tsx`, which this change wires to `addToCart` via a TanStack Query mutation with optimistic update and `["cart"]` queryKey invalidation.

**Rationale:** The PDP button already exists, is already auth-guarded, and already has a `// TODO` marker. Wiring it is a small, contained change that makes the cart reachable through real flow. A seeder would be throwaway scaffolding.

**Alternative considered:** A dev-only "Add demo item" button on the cart page (`import.meta.env.DEV`). Rejected as redundant once the PDP button is wired.

### 6. "Ir a pagar" CTA navigates to `/checkout`; building `/checkout` is out of scope

The cart page renders an "Ir a pagar" button as a `Link to="/checkout"`. The `/checkout` route already exists as a stub and remains a stub after this change. Building checkout, Wompi integration, shipping, and tax is a separate change.

**Rationale:** The CTA establishes the navigation contract now (so the cart page is not a dead end), without committing to the checkout UX before the Wompi/IVA/shipping decisions are made. A disabled CTA would hide the contract; a 404 would create a broken link.

**Alternative considered:** Disable the CTA with a "próximamente" tooltip. Rejected because `Link to="/checkout"` is honest about the intended flow without dead-linking; the stub renders rather than 404-ing.

### 7. Add-to-cart feedback UX (toast, count badge, button → "Ver carrito")

The initial wiring gives no visible feedback on click, which reads as "clunky." Three coupled affordances fix this:

1. **Toast confirmation via `sonner`.** On a successful `addToCart` mutation, fire `toast.success("Producto añadido al carrito", { action: { label: "Ver carrito", onClick: navigate("/cart") } })`. A `<Toaster />` is mounted once at the root route. The toast doubles as the cart-update acknowledgment and an express lane to the cart page.
2. **Live cart count badge on the navbar `ShoppingCart` icon.** `ActionsMenu` reads the `["cart"]` query and renders a small badge with the total item count (`Σ quantity`) when > 0. The cart query already hydrates on app boot; the badge is a presentation layer over the same cache the mutations optimistically update.
3. **PDP button transitions to a persistent "Ver carrito" link once the product is in the cart.** The PDP reads the `["cart"]` query and derives `inCart` (true when the current product's `productId` appears in `cart.items`). When `inCart` is false, the button renders as "Añadir al carrito"; while the mutation is pending, it shows a `Loader2` spinner with `disabled`; once `inCart` flips true (via the optimistic update in `onMutate`, plus the brief pending window), the button is _replaced_ by a `Link to="/cart"` labelled "Ver carrito" with a cart icon. Quantity adjustments are intentionally not offered on the PDP — the user navigates to the cart page to change quantity there. Removing the item from the cart causes `inCart` to revert to false and the "Añadir al carrito" button returns.

**Rationale:** These three signals operate at three scopes — page-level navigation cue (toast), global-at-a-glance state (badge), and an in-place affordance change (button → link). The button→link transition is a single mechanism that simultaneously (a) confirms the add succeeded, (b) routes the user toward the cart, and (c) structurally prevents adding the same product from the PDP more than once — the add control literally no longer exists after the first add. Quantity tuning lives on the cart page stepper, which is the appropriate surface for it.

**Alternative considered (rejected):** Keep the "Añadir al carrito" button permanently and let repeated clicks increment the same line's quantity. Rejected because it invites bulk-adding the same product by accident (the user can already tune quantity on the cart page) and gives no natural "go to cart" affordance at the point of confirmation.

**Alternative considered (rejected):** A brief "Añadido ✓" state that reverts to "Añadir al carrito" after ~1.5s. Rejected as requested by the product owner — the revert re-opens the duplicate-add window and re-introduces the ambiguity about whether the click landed.

### 8. Duplicate-submission guard on cart mutations

On the PDP "Añadir al carrito" button, the natural duplicate guard is the button→link transition in decision #7: once `inCart` is true, the add control is unmounted, so no second click is possible. During the brief pending window (between click and `onMutate` setting the cache), a synchronous `submitting` state set inside the click handler before `mutate()` prevents a double-click from queuing a second `addToCart` call before React re-renders.

On the cart page stepper and remove controls, the same `submitting`-state guard closes the analogous race (rapid clicks queuing duplicate `updateQuantity` / `removeFromCart` mutations before `isPending` flips `disabled`).

Because optimistic update sets the cart cache synchronously in `onMutate` and invalidation only happens in `onSettled`, the cart `["cart"]` query does not refetch mid-flight — so no additional query disabling is required.

**Rationale:** A state flag set synchronously in the click handler captures intent before any async render cycle, which `disabled={isPending}` alone cannot. On the PDP, the button→link transition is the dominant guard; the `submitting` flag only covers the pending window. On the cart page, the `submitting` flag is the sole mechanism.

**Alternative considered:** Disable the `["cart"]` query via `enabled = !isMutating`. Rejected — it would briefly hide the navbar badge and empty the cart view during the mutation, degrading UX, and it does not actually prevent the second `mutate()` from running.

### 9. Future backend swap surface

The service functions are async-shaped and return typed data; replacing the localStorage bodies with `fetch("/api/cart")` calls leaves the UI and query layer untouched. The `["cart"]` queryKey is the single invalidation seam.

## Risks / Trade-offs

- **[Risk]** Multi-tab divergence: editing the cart in two tabs produces inconsistent views because localStorage is per-tab-cached until refresh.
  **Mitigation:** Tolerated. The future backend resolves it. No optimistic-sync logic is built now; it would be wasted work the backend deletes.
- **[Risk]** A cart line referencing a deleted/changed product shows stale data at fetch time.
  **Mitigation:** `fetchCart` joins against current `fetchProducts()`. Lines whose `productId` no longer exists are dropped from the returned cart and the persisted cart is cleaned. (Behavior to confirm in tasks.)
- **[Risk]** Tax-inclusive pricing assumption may be wrong if the product owner later mandates tax-exclusive display.
  **Mitigation:** The assumption affects only presentation (`formatCop(subtotal)`); switching to tax-exclusive display touches format helpers, not the cart data model.
- **[Risk]** Wiring the PDP button widens this change's blast radius beyond the `/cart` page.
  **Mitigation:** The modification is a single `useMutation` call replacing a `// TODO`, in one file, preserving the existing auth guard. The `product-detail-page` spec receives a small delta (MODIFIED requirement) describing the new behavior.
