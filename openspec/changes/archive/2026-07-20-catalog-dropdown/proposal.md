## Why

The Catálogo navigation item currently shows an empty placeholder dropdown (`<NavigationMenuLink>Link</NavigationMenuLink>`). This provides no value to users and looks unfinished. Adding a meaningful two-column dropdown with featured categories and brands creates a natural discovery path and improves navigation UX.

## What Changes

- Replace the placeholder content in the Catálogo dropdown with a two-column layout.
- Left column: **Categorías Destacadas** (Marcos ópticos, Gafas de sol, Deportivas) with compact text links.
- Right column: **Marcas Destacadas** (Ray-Ban, Oakley, Persol) with compact text links.
- Each item navigates to `/catalog` with the corresponding filter pre-applied via query parameters.
- Each column includes a "Ver todas" link at the bottom that navigates to `/catalog` with the appropriate filter type active.
- Maintain the existing hover/focus behavior from the Radix NavigationMenu primitive.

## Capabilities

### New Capabilities

- `catalog-dropdown`: Two-column mega-dropdown for the Catálogo navigation item featuring highlighted categories and brands with filter-aware navigation.

### Modified Capabilities

- `responsive-navbar`: Update the desktop Catálogo dropdown requirement to replace the placeholder link with the real `catalog-dropdown` content. No other navbar behavior changes.

## Impact

- `src/components/nav-menu.tsx` — dropdown content implementation.
- `src/services/featured-categories.ts` and `src/services/featured-brands.ts` — may need query parameter mappings for filters.
- Catalog page (`src/routes/_main-layout/catalog.tsx`) — must accept and apply category/brand filter query parameters.
