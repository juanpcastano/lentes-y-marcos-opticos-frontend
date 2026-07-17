## Context

The application is a Vite + React + TypeScript storefront using TanStack Router with file-based routing, TanStack Query for data fetching, Tailwind CSS v4, and shadcn/ui. The homepage contains a "Marcas Destacadas" section whose "Ver todas" link currently routes to `/catalog`. The `/catalog` route renders a sidebar with brand checkboxes derived from the hardcoded product catalog. There is no standalone page to browse all brands.

## Goals / Non-Goals

**Goals:**

- Introduce a new `/brands` route that lists every brand carried by the store.
- Update the featured brands "Ver todas" link to route to `/brands`.
- Add a "Ver todas" link below the brand filter list in the catalog sidebar that routes to `/brands`.
- Provide hardcoded in-memory brand data consistent with the existing services pattern.

**Non-Goals:**

- No real backend integration.
- No changes to product filtering logic or URL query parameter behavior.
- No dynamic brand detail pages (only a listing page).

## Decisions

**Decision: File-based routing for `/brands`**

- We will create `src/routes/_main-layout/brands.tsx` so the page inherits the main layout (navbar + footer) automatically, following the same pattern as `catalog.tsx`.

**Decision: Reuse product-derived brand list with richer metadata**

- The catalog already derives brands from `products.ts`. For the brands page we will create a new `src/services/brands.ts` that returns a static array of all store brands, each with a `name`, `imageUrl`, and `tagline`. This keeps the data layer consistent with existing hardcoded services and allows the brands page to show richer cards than a plain text list.

**Decision: Grid layout for brand cards**

- The brands page will render cards in a responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop). Each card will show the brand image, name, and tagline, styled similarly to the featured brand cards for visual consistency.

**Decision: TanStack Query for data fetching**

- A new `src/query-options/brands.ts` will wrap `fetchBrands` with `queryOptions`, matching the existing pattern used by `hero-slides.ts` and `featured-brands.ts`.

## Risks / Trade-offs

- [Risk] Brand image URLs may break if external links become invalid.  
  → Mitigation: Use the same image hosting strategy already in place for featured brands; accept the risk as it exists elsewhere in the app.

- [Risk] The brands page will list brands even if some have zero products in the current hardcoded dataset.  
  → Mitigation: Ensure the hardcoded brand list matches the set of brands present in `products.ts` so the page stays truthful.
