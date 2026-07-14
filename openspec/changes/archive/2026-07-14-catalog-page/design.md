## Context

This is a React + Vite + TanStack Router + TanStack Query + Tailwind CSS v4 + shadcn/ui (`radix-luma` style) frontend for an optical frames store. All data is hardcoded in-memory; there is no real backend yet. The existing pattern is: `src/services/` holds raw fetch functions, `src/query-options/` exports `queryOptions` wrappers, and `src/routes/` uses file-based TanStack Router routing.

The `/catalog` route currently has no page. The user wants a catalog layout with a sidebar filter panel and a product grid, closely matching the provided design reference.

## Goals / Non-Goals

**Goals:**

- Render a responsive `/catalog` page with a 3-column product grid on desktop.
- Provide a left sidebar with filters: brand (checkbox), price range (slider), material (checkbox), shape (pill/checkbox), categories (checkbox, multiple per product), and a clear-all button.
- Provide a sort dropdown with options: Relevancia, Precio ascendente, Precio descendente.
- Display results count ("Mostrando X de Y resultados").
- Sync active filters and sort to URL query params via TanStack Router search params.
- Support product badges (NUEVO, OFERTA) on cards.
- Keep all data hardcoded in-memory following the existing `src/services/` + `src/query-options/` pattern.
- Reuse existing components (`Image`, currency formatting) and styling tokens.

**Non-Goals:**

- Pagination or infinite scroll.
- Product detail page navigation ("Ver detalle" is a placeholder CTA).
- Cart or checkout functionality.
- Real backend integration or API calls.
- Exact pixel-perfect filter UI (the user explicitly said filters don't need to match exactly).
- Filter animations or advanced accessibility features beyond standard form behavior.

## Decisions

1. **Client-side filtering**
   - _Rationale_: All product data is hardcoded in-memory. Filtering on the client avoids unnecessary complexity and keeps the page instant. If a backend is added later, the filter logic can be lifted into the service layer without changing the UI.

2. **TanStack Router search params for URL sync**
   - _Rationale_: TanStack Router has built-in search param validation (`validateSearch`). This gives us type-safe URL state, deep-linking, and browser history integration for free. No extra state management library is needed.
   - _Alternative considered_: React state + `useEffect` to push to `window.history`. Rejected because it is more error-prone and lacks validation.

3. **Hardcoded product service + query-options**
   - _Rationale_: Matches the existing convention (`hero-slides.ts`, `top-sellers.ts`). Keeps data layer decoupled from UI so replacing with an API later is a single-file change.

4. **Re-use existing `TopProduct` shape where possible, extended with new fields**
   - _Rationale_: The existing `TopProduct` interface covers image, name, brand, price. We will add `id`, `material`, `shape`, `categories` (string array, multiple per product), and `badge` fields for the catalog. This keeps types minimal and avoids duplication.

5. **Use shadcn/ui primitives for all form controls**
   - _Rationale_: The user already added `checkbox`, `radio`, and `slider` shadcn/ui components. Whenever a shadcn component exists (or can be added via the `shadcn` CLI), it is preferred over building custom controls. This ensures consistent styling, accessibility, and maintainability across the app. We will use `shadcn` CLI to add any missing primitives (e.g., `slider` for the price filter, `select` for the sort dropdown) and compose them into the catalog filter UI.

6. **Clear-all filters button**
   - _Rationale_: A single "Limpiar filtros" action in the sidebar improves UX by letting users quickly reset their selection without manually unchecking each filter. It resets the URL search params to defaults (including categories) and refreshes the grid to show all products.

## Risks / Trade-offs

- **[Risk] Long URL query strings with many active filters** → _Mitigation_: Use compact param keys (`b` for brand, `m` for material, etc.) and serialize arrays as comma-separated strings.
- **[Risk] Performance with large in-memory product lists** → _Mitigation_: Current hardcoded list will be ~20–30 items. If it grows, memoize filtering with `useMemo`.
- **[Trade-off] No real-time search/filter debounce** → _Acceptable_: Filters are checkbox/radio, not free-text, so no debounce is needed.

## Migration Plan

Not applicable. This is a new page with no existing state or data to migrate.

## Open Questions

None.
