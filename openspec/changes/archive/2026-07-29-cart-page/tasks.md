## 1. Cart service

- [x] 1.1 Create `src/services/cart.ts` with types `CartItem` (`{ productId, quantity }`), `CartLine` (with resolved `name`, `imageUrl`, `unitPrice`, `lineTotal`), and `Cart` (`{ id, items: CartLine[], subtotal }`)
- [x] 1.2 Add `MOCK_CART_KEY` constant and `localStorage` read/write helpers mirroring the `auth.ts` precedent
- [x] 1.3 Implement `fetchCart`: read persisted items, join against `fetchProducts()` to resolve line fields, drop and clean lines whose `productId` no longer exists, compute `subtotal = Σ lineTotal`; return an empty cart when nothing is persisted (no seeded default)
- [x] 1.4 Implement `addToCart(productId, quantity)`: merge into existing line if `productId` already present (sum quantities), otherwise append; persist and return the updated cart
- [x] 1.5 Implement `updateQuantity(productId, quantity)`: set absolute quantity; if `quantity < 1`, remove the line (delegate to remove behavior); persist and return the updated cart
- [x] 1.6 Implement `removeFromCart(productId)`: drop the line; persist and return the updated cart
- [x] 1.7 Implement `clearCart`: empty the persisted items; return the updated cart

## 2. Cart query options

- [x] 2.1 Create `src/query-options/cart.ts` exporting `createCartQueryOptions` returning `queryOptions` with `queryKey: ["cart"]` and `queryFn: fetchCart`, following the `createOrdersQueryOptions` canon (generics, `Omit<UseQueryOptions...>`)

## 3. Cart page

- [x] 3.1 Replace the stub in `src/routes/_main-layout/_authenticated/cart.tsx` with a real page: wrap in a `w-full max-w-2xl` container with an `<h1>` "Carrito" heading and consistent spacing
- [x] 3.2 Render the line-item list when populated: image, name, unit price (`formatCop`), quantity stepper, line total (`formatCop`), remove control
- [x] 3.3 Wire the quantity stepper: increment calls `updateQuantity(productId, qty+1)`; decrement calls `updateQuantity(productId, qty-1)` only when `qty > 1`; at `qty === 1` the decrement is disabled (removal uses the remove control)
- [x] 3.4 Wire the remove control to `removeFromCart(productId)` via a `useMutation` with optimistic update and `["cart"]` invalidation
- [x] 3.5 Render the subtotal (`Σ lineTotal`, `formatCop`) below the line list; render no shipping/tax/total field
- [x] 3.6 Render the empty-state view (message + link to `/catalog`) when the cart has no items; hide both the line list and the "Ir a pagar" CTA in this state
- [x] 3.7 Render the "Ir a pagar" CTA as a `Link to="/checkout"` visible only when the cart has one or more items

## 4. Product detail wiring

- [x] 4.1 In `src/routes/_main-layout/product.$id.tsx`, replace the `// TODO: actual add to cart logic` at line ~126 with a `useMutation` calling `addToCart(product.id, 1)`
- [x] 4.2 Preserve the existing auth guard: when `user` is null, navigate to `/login` with `search: { redirect: \`/product/${id}\` }` and do not call the mutation
- [x] 4.3 Configure the mutation with an optimistic cart update and `queryClient.invalidateQueries({ queryKey: ["cart"] })` on settle

## 5. Add-to-cart UX feedback

- [x] 5.1 Install `sonner` (`pnpm add sonner`) and create `src/components/ui/sonner.tsx` re-exporting `Toaster` with `richColors` and `position="bottom-right"`
- [x] 5.2 Mount `<Toaster />` in `src/routes/__root.tsx` inside the providers so toasts are globally available
- [x] 5.3 In `product.$id.tsx`, fire a `toast.success` on the `addToCart` mutation's `onSuccess` with the product name and a "Ver carrito" action that navigates to `/cart`; fire `toast.error` on `onError`
- [x] 5.4 Add a pending + success state to the PDP "Añadir al carrito" button: `Loader2` spinner + `disabled` while pending; brief `Check` icon + "Añadido" label on success, reverting after ~1.5s
- [x] 5.5 Add a live cart count badge to the `ShoppingCart` icon in `src/components/actions-menu.tsx`: read the `["cart"]` query, render a small badge with `Σ quantity` only when count > 0 and the user is authenticated

## 5b. Duplicate-submission guard

- [x] 5b.1 In `product.$id.tsx`, add a synchronous `submitting` state set in the click handler before `addToCartMutation.mutate()`, disable the button while `submitting || isPending`, and clear `submitting` in `onSettled`; verify rapid double-clicks no longer produce duplicate toasts/items
- [x] 5b.2 In `src/routes/_main-layout/_authenticated/cart.tsx`, apply the same synchronous guard to the quantity stepper increment/decrement and the remove control, so rapid clicks cannot queue duplicate `updateQuantity`/`removeFromCart` mutations

## 5c. PDP button → "Ver carrito" link

- [x] 5c.1 In `product.$id.tsx`, read the `["cart"]` query and derive `inCart = cart.items.some(line => line.productId === id) || submitting || mutation.isPending`; replace the `justAdded` check + 1.5s revert timer (now removed) with `inCart`
- [x] 5c.2 When `inCart` is true, unmount the "Añadir al carrito" button and render a text "El ítem ya ha sido añadido a tu carrito." followed by a `Button asChild` wrapping a `Link to="/cart"` labelled "Ver carrito" with a cart icon; when false, render the add button (with pending spinner) as before
- [x] 5c.3 Remove the `justAdded` state, the `revertTimer` ref, the `useEffect` cleanup, and the now-unused `Check` import
- [x] 5c.4 Confirm quantity tuning is intentionally NOT offered on the PDP — only the cart page stepper adjusts quantity

## 6. Verification

- [x] 6.1 Run `pnpm format && pnpm lint && pnpm build` and resolve any failures
- [x] 6.2 Manual check (`pnpm dev`): as an authenticated user, click "Añadir al carrito" on a product detail page, navigate to `/cart`, and confirm the item appears with correct image/name/unit price/line total
- [x] 6.3 Manual check: a toast "Producto añadido al carrito" appears with a "Ver carrito" action; the PDP button shows a spinner, then is replaced by a persistent "Ver carrito" link; the navbar cart badge shows the updated count
- [x] 6.4 Manual check: increment and decrement the stepper; confirm quantities update and persist; confirm decrement is disabled at quantity one
- [x] 6.5 Manual check: remove a line; confirm it disappears and persistence holds across refresh; the navbar badge updates; revisiting the product detail page shows "Añadir al carrito" again (the link reverted)
- [x] 6.6 Manual check: confirm the empty state renders when the cart is cleared, with the catalog link and no "Ir a pagar" CTA; the navbar badge is hidden
- [x] 6.7 Manual check: confirm "Ir a pagar" navigates to `/checkout` (still a stub)
- [x] 6.8 Manual check: as an unauthenticated user, click "Añadir al carrito" and confirm redirect to `/login?redirect=/product/<id>` with no cart mutation, no toast, and no badge
