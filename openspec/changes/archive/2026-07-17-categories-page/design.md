## Context

The application is a Vite + React + TypeScript storefront using TanStack Router with file-based routing, TanStack Query for data fetching, Tailwind CSS v4, and shadcn/ui. The homepage contains a "Categorías Destacadas" section whose "Ver todas" link currently routes to `/catalog`. The `/catalog` route renders a sidebar with category checkboxes derived from the hardcoded product catalog. There is no standalone page to browse all categories.

## Goals / Non-Goals

**Goals:**

- Introduce a new `/categories` route that lists every category carried by the store.
- Update the featured categories "Ver todas" link to route to `/categories`.
- Add a "Ver todas" link below the category filter list in the catalog sidebar that routes to `/categories`.
- Provide hardcoded in-memory category data consistent with the existing services pattern.

**Non-Goals:**

- No real backend integration.
- No changes to product filtering logic or URL query parameter behavior.
- No dynamic category detail pages (only a listing page).

## Decisions

**Decision: File-based routing for `/categories`**

- We will create `src/routes/_main-layout/categories.tsx` so the page inherits the main layout (navbar + footer) automatically, following the same pattern as `catalog.tsx`.

**Decision: Reuse product-derived category list with richer metadata**

- The catalog already derives categories from `products.ts`. For the categories page we will create a new `src/services/categories.ts` that returns a static array of all store categories, each with a `name`, `imageUrl`, and `description`. This keeps the data layer consistent with existing hardcoded services and allows the categories page to show richer cards than a plain text list.

**Decision: Grid layout for category cards**

- The categories page will render cards in a responsive grid (1 col mobile, 2 col tablet, 2 col desktop — matching the brands page layout as requested by the user). Each card will show the category image, name, and description, styled similarly to the featured category cards for visual consistency.

**Decision: TanStack Query for data fetching**

- A new `src/query-options/categories.ts` will wrap `fetchCategories` with `queryOptions`, matching the existing pattern used by `hero-slides.ts` and `featured-categories.ts`.

## Risks / Trade-offs

- [Risk] Category image URLs may break if external links become invalid.
  → Mitigation: Use the same image hosting strategy already in place for featured categories; accept the risk as it exists elsewhere in the app.

- [Risk] The categories page will list categories even if some have zero products in the current hardcoded dataset.
  → Mitigation: Ensure the hardcoded category list matches the set of categories present in `products.ts` so the page stays truthful.
