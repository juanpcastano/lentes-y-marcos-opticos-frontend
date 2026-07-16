## 1. Data model and services

- [x] 1.1 Create `src/components/product-detail/types.ts` with the `ProductDetail` interface extending `CatalogProduct` and adding `additionalImages`, `stock`, `originalPrice`, `discountedPrice`, `discountPercentage`, and `description`.
- [x] 1.2 Update `src/services/products.ts` to export hardcoded `ProductDetail[]` fixtures (or a separate `productDetails` array) with the new fields populated for all products.
- [x] 1.3 Add `fetchProductById(id: string)` to `src/services/products.ts` that resolves a single `ProductDetail` by ID or throws if not found.
- [x] 1.4 Create `src/query-options/product.ts` exporting `createProductQueryOptions(id)` following the existing `queryOptions` pattern with `queryKey: ["product", id]`.

## 2. Reusable product-detail components

- [x] 2.1 Create `src/components/product-detail/product-image-gallery.tsx` with a main image container (zoom on hover via CSS transform) and a shadcn/ui Carousel thumbnail strip that updates the main image on click.
- [x] 2.2 Create `src/components/product-detail/product-price.tsx` that conditionally renders original price with strikethrough, discounted price in bold, and a discount-percentage badge when `discountPercentage > 0`.
- [x] 2.3 Create `src/components/product-detail/stock-indicator.tsx` that accepts `stock: number` and returns "En stock" (green), "Pocas unidades" (yellow), or "Agotado" (red).
- [x] 2.4 Create `src/components/product-detail/related-products.tsx` that fetches the full product list, filters by shared `categories` excluding the current product ID, and renders up to four `ProductCard` items.

## 3. Route and page assembly

- [x] 3.1 Create `src/routes/_main-layout/product.$id.tsx` as a TanStack Router file-based route that reads `id` from route params.
- [x] 3.2 In the route component, use `useQuery(createProductQueryOptions(id))` to load the product.
- [x] 3.3 Render a two-column layout on desktop (gallery left, info right) and stacked on mobile, using Tailwind responsive classes.
- [x] 3.4 Assemble the page from subcomponents: `ProductImageGallery`, product metadata (brand, name, material, shape, categories, description), `ProductPrice`, `StockIndicator`, and an "Añadir al carrito" `<Button>` (no-op `onClick`).
- [x] 3.5 Handle the not-found case: if `fetchProductById` throws or returns undefined, render a "Producto no encontrado" message with a link back to `/catalog`.
- [x] 3.6 Add the `RelatedProducts` section at the bottom of the page.

## 4. Catalog integration

- [x] 4.1 Update `src/components/catalog/product-card.tsx` to wrap the "Ver detalle" button in a TanStack Router `<Link to="/product/$id" params={{ id: product.id }}>`.

## 5. Verification and polish

- [x] 5.1 Run `pnpm generate-routes` to regenerate the route tree and confirm the new `/product/$id` route is registered.
- [x] 5.2 Run `pnpm dev` and manually verify that clicking "Ver detalle" navigates to the product page, the gallery swaps images, zoom works on desktop, pricing shows discounts correctly, stock colors are correct, and related products appear.
- [x] 5.3 Run `pnpm check` and `pnpm lint` to ensure formatting and types pass.
