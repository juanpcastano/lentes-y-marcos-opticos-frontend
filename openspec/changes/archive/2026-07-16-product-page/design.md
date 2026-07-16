## Context

The application currently displays products in a catalog grid at `/catalog` using `CatalogProduct` cards. Each card shows a single image, brand, name, price, and a "Ver detalle" button, but there is no destination page. Users cannot inspect additional images, read descriptions, verify stock, or evaluate discounts before purchasing. The stack uses TanStack Router (file-based), TanStack Query, Tailwind CSS v4, shadcn/ui, and in-memory hardcoded services.

## Goals / Non-Goals

**Goals:**

- Introduce a `/product/:id` route that renders a complete product detail page.
- Display an image gallery with a main image (zoom on hover), thumbnail strip, and shadcn/ui Carousel for additional images.
- Show pricing accurately: original price with strikethrough, discounted price prominently, and a discount-percentage badge when applicable.
- Display stock availability (in stock, low stock, out of stock).
- Provide an "Add to cart" button layout without wiring cart state logic.
- Surface product metadata: brand, name, material, shape, categories, and description.
- Include a related-products section that reuses existing `ProductCard` components.
- Wire the existing catalog "Ver detalle" button to navigate to `/product/$id`.

**Non-Goals:**

- Real cart functionality (add, remove, quantity, persistence).
- Backend integration or API contracts beyond in-memory hardcoded data.
- Authentication gates for the product page.
- Reviews, ratings, or social proof widgets.
- Size / color variant selectors.

## Decisions

### 1. Extend `CatalogProduct` into a `ProductDetail` type

**Rationale:** The existing `CatalogProduct` is intentionally lightweight for grid rendering. A new `ProductDetail` interface in `src/components/product-detail/types.ts` extends the base fields and adds `additionalImages: string[]`, `stock: number`, `originalPrice: number`, `discountedPrice: number`, `discountPercentage: number`, and `description: string`. This avoids bloating the catalog grid type while keeping the relationship explicit.
**Alternative considered:** Adding all fields directly to `CatalogProduct`. Rejected because it would force the catalog service to carry heavy detail payloads for every grid item.

### 2. Create `fetchProductById(id: string)` service

**Rationale:** Follows the established `services/` → `query-options/` pattern used by `hero-slides`, `top-sellers`, and `products`. The service filters the hardcoded product array by `id` and returns a single `ProductDetail` (or throws if missing). The query-options wrapper uses `queryKey: ["product", id]`.
**Alternative considered:** Reusing the existing `fetchProducts()` and filtering client-side. Rejected because it downloads the full catalog for every product visit and complicates cache invalidation later.

### 3. Use shadcn/ui Carousel for the thumbnail gallery

**Rationale:** The project already includes `src/components/ui/carousel.tsx` (Embla-based). Using it maintains UI consistency and avoids introducing a new dependency. The main image sits above the carousel; clicking a thumbnail updates the main image index. The carousel will hold thumbnail-sized images.
**Alternative considered:** A custom horizontal scroll div. Rejected because the existing carousel already handles responsive scroll-snapping and accessibility.

### 4. Zoom on hover via CSS transform

**Rationale:** A lightweight, dependency-free approach. The main image container uses `overflow-hidden` and applies `scale(1.5)` on hover with `transform-origin` following the mouse position. This satisfies the zoom requirement without pulling in a heavy image-zoom library.
**Alternative considered:** A dedicated lightbox/modal zoom library (e.g., `react-image-zooom`). Rejected to keep bundle size small and avoid new dependencies.

### 5. Stock indicator with threshold constants

**Rationale:** A simple colored badge and text label driven by a small utility function. Thresholds: `stock === 0` → "Agotado" (red), `stock <= 5` → "Pocas unidades" (yellow), `stock > 5` → "En stock" (green). This is predictable and easy to style with Tailwind color tokens.
**Alternative considered:** A progress-bar style indicator. Rejected because exact numbers are more useful than relative bars for low-stock optics.

### 6. Related products derived from shared categories

**Rationale:** Because data is hardcoded, the related-products section filters the full product list by shared `categories` (excluding the current product) and shows the first 4 results. This reuses the existing `ProductCard` component and `createProductsQueryOptions()` without requiring manual curation.
**Alternative considered:** A dedicated `relatedProducts` field on `ProductDetail`. Rejected to avoid duplicating relational data in the in-memory fixtures.

### 7. Route param `id` as string

**Rationale:** The existing `CatalogProduct.id` is a string (e.g., `"prod-001"`). TanStack Router file-based routing supports `$id` as the dynamic segment (`src/routes/_main-layout/product.$id.tsx`). This aligns with the existing data type.

## Risks / Trade-offs

- **[Risk]** Extending product fixtures to include `additionalImages`, `stock`, `description`, etc., increases the size of the hardcoded data file.  
  → **Mitigation:** Keep fixture images lightweight (reuse existing URLs) and descriptions concise.
- **[Risk]** The zoom-on-hover CSS approach does not work well on touch devices.  
  → **Mitigation:** Disable zoom transforms on touch media queries (`@media (hover: none)`) so mobile users simply tap through the gallery.
- **[Risk]** If `CatalogProduct` is later refactored, `ProductDetail` must be updated in tandem.  
  → **Mitigation:** Import and extend `CatalogProduct` explicitly rather than duplicating fields.
- **[Risk]** Related-products logic based on category overlap may return irrelevant items if categories are too broad.  
  → **Mitigation:** Acceptable for MVP; future backend can provide curated `relatedIds`.

## Migration Plan

Not applicable — this is a pure addition with no database or API migration. Rollback consists of deleting the new route file and reverting the product card link.

## Open Questions

- Should the related-products carousel be horizontally scrollable (Embla) or a static 4-column grid? (Default: responsive grid for consistency with the catalog page.)
- Is a product-not-found state required, or can we assume all IDs from the catalog are valid? (Default: render a simple "Producto no encontrado" message.)
