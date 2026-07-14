## 1. Data layer

- [x] 1.1 Define `CatalogProduct` type in `src/components/catalog/types.ts` with fields: id, imageUrl, name, brand, price, material, shape, categories (string array), badge (optional).
- [x] 1.2 Add `formatCop` re-export in `src/components/catalog/types.ts` for consistent currency formatting.
- [x] 1.3 Create `src/services/products.ts` with `fetchProducts()` returning hardcoded in-memory product array (~20–30 items).
- [x] 1.4 Create `src/query-options/products.ts` with `createProductsQueryOptions` following the existing query-options pattern.

## 2. Filter state and URL sync

- [x] 2.1 Define `CatalogSearch` schema in the route file using `z.object` for brands, priceRange, materials, shapes, categories, and sort fields.
- [x] 2.2 Add `validateSearch` to the `/catalog` route with default values so the URL always has a normalized state.
- [x] 2.3 Implement helper functions to parse and stringify array query params as comma-separated values.

## 3. UI components

- [x] 3.1 Create `src/components/catalog/product-card.tsx` with image, brand, name, price, badge, and "Ver detalle" button.
- [x] 3.2 Create `src/components/catalog/filter-section.tsx` for collapsible sidebar filter groups.
- [x] 3.3 Add missing shadcn/ui primitives via `shadcn` CLI if needed (e.g., `select` for sorting).
- [x] 3.4 Create `src/components/catalog/brand-filter.tsx` using the shadcn/ui `Checkbox` component.
- [x] 3.5 Refactor `src/components/catalog/price-filter.tsx` to use the shadcn/ui `Slider` component instead of `RadioGroup`.
- [x] 3.6 Create `src/components/catalog/material-filter.tsx` using the shadcn/ui `Checkbox` component.
- [x] 3.7 Create `src/components/catalog/shape-filter.tsx` using shadcn/ui `Checkbox` or `ToggleGroup` (prefer shadcn primitives over custom pills).
- [x] 3.8 Create `src/components/catalog/category-filter.tsx` using the shadcn/ui `Checkbox` component.
- [x] 3.9 Create `src/components/catalog/sort-select.tsx` using the shadcn/ui `Select` component.
- [x] 3.10 Create `src/components/catalog/results-count.tsx` label.
- [x] 3.11 Add a "Limpiar filtros" button in the sidebar that resets all filters (including categories) and updates the URL state.

## 4. Route page and integration

- [x] 4.1 Create `src/routes/_main-layout/catalog.tsx` route file.
- [x] 4.2 Wire `createProductsQueryOptions` in the route `loader` or component using `useQuery`.
- [x] 4.3 Implement client-side filter logic in the route component using `useMemo`, including category filter (match if product.categories intersects with selected categories).
- [x] 4.4 Implement client-side sort logic in the route component.
- [x] 4.5 Compose sidebar + product grid layout in the route component matching the reference design.
- [x] 4.6 Run `pnpm generate-routes` to regenerate `src/routeTree.gen.ts`.

## 5. Polish and verification

- [x] 5.1 Run `pnpm format` to ensure formatting passes.
- [x] 5.2 Run `pnpm check` to verify no lint or type errors.
- [x] 5.3 Run `pnpm dev` and manually verify filters, sorting, URL sync, and responsiveness.
- [x] 5.4 Run `pnpm build` to confirm the production build succeeds.
