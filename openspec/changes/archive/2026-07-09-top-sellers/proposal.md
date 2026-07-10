## Why

The homepage currently shows the hero, featured categories, and a "why choose us" section but lacks any way to surface the store's best-selling products. Highlighting the top 10 bestsellers right after the hero gives returning and new visitors an immediate, browseable entry point into the catalog and increases the visibility of high-converting products.

## What Changes

- Add a new "Top Sellers" homepage section rendered immediately after the hero carousel and before the featured categories section.
- A horizontally scrollable carousel of up to 10 product cards built on the existing shadcn/ui `Carousel` component (Embla).
- Each product card displays, in order: a product image, the product name (title), the brand name, and the price in COP.
- Prices are rendered as Colombian pesos (COP) using a `es-CO` currency format.
- The carousel auto-scrolls automatically when idle and pauses while the user hovers over it (and when the tab is hidden / reduced motion is preferred), resuming when the interaction ends.
- A loading skeleton is shown while the top sellers data is being fetched, and the section is hidden when there are no products.
- Products are served through a new in-memory service and TanStack Query option, following the established `src/services/` + `src/query-options/` pattern.

## Capabilities

### New Capabilities

- `top-sellers`: A homepage section that displays the top 10 best-selling products in an auto-scrolling, hover-pausable carousel of product cards showing name, brand, and COP price.

### Modified Capabilities

<!-- No existing spec-level requirements are changing. The new section is additive and simply inserted into the existing homepage layout. -->

## Impact

- **New code**:
  - `src/components/top-sellers/` — component folder (`top-sellers.tsx`, `top-sellers-skeleton.tsx`, `top-product-card.tsx`, `types.ts`), mirroring the `featured-categories/` structure.
  - `src/services/top-sellers.ts` — in-memory fetch returning an ordered list of top products.
  - `src/query-options/top-sellers.ts` — `queryOptions` wrapper (canonical pattern from `hero-slides`).
- **New dependency**: `embla-carousel-autoplay` plugin (used by the shadcn `Carousel` via the `plugins` prop) to provide native hover-pausable auto-scroll. (Alternative: a small custom autoplay hook; see design.md.)
- **Modified code**: `src/routes/_main-layout/index.tsx` — insert `<TopSellers />` between `<HeroCarousel />` and `<FeaturedCategories />`.
- **Routing / data**: No new routes. Data is hardcoded in-memory, consistent with the current "no real backend yet" constraint.
- **Affected systems**: Homepage layout only. No changes to authentication, routing, or persisted state.
