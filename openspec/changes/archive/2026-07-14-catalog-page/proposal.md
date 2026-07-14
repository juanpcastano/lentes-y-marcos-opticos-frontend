## Why

The `/catalog` route currently has no page content. We need a functional product catalog that lets customers browse the full inventory with filters and sorting, matching the design shown in the reference image. Synchronizing filters with URL query params enables shareable filtered views and improves UX.

## What Changes

- Add a `/catalog` route page with a product grid layout.
- Create a sidebar filter panel with: brand (checkbox), price range (slider), material (checkbox), shape (pill/checkbox), and categories (checkbox, multiple per product).
- Add a "Limpiar filtros" button to reset all active filters at once.
- Create a product card component with image, brand, name, price, and "Ver detalle" CTA.
- Add sort dropdown (Relevancia, Precio: menor a mayor, Precio: mayor a menor).
- Sync all active filters and sort to URL query params using TanStack Router search params.
- Add hardcoded in-memory product data service and query-options following existing patterns.
- Add a results count label ("Mostrando X de Y resultados").
- Support product badges (NUEVO, OFERTA) on cards.

## Capabilities

### New Capabilities

- `catalog-page`: Full product catalog browsing with sidebar filters, sorting, URL query param synchronization, and product grid.

### Modified Capabilities

- None. This change introduces new UI and data services without altering existing spec-level behavior.

## Impact

- New route file: `src/routes/_main-layout/catalog.tsx`
- New components: `src/components/catalog/`
- New services: `src/services/products.ts`
- New query-options: `src/query-options/products.ts`
- New types under `src/components/catalog/types.ts`
- No breaking changes to existing pages or APIs.
