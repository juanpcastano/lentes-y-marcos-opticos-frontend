## Why

The homepage needs a dedicated section to showcase our key brand partners and strengthen customer trust. A visually distinct featured brands section will highlight our premium partnerships while maintaining visual consistency with the existing featured categories pattern.

## What Changes

- Add a new "Marcas Destacadas" (Featured Brands) section to the homepage, positioned below the existing featured categories section
- Create a responsive 3-card grid layout with the large featured card on the **right** side (mirror of featured categories layout)
- Build reusable brand card component with background image, brand name, and tagline overlay
- Add hardcoded in-memory service and query options for featured brands data (no real backend yet)
- Create a skeleton loading state matching the section layout
- Add appropriate types and route integration following the established featured-categories pattern

## Capabilities

### New Capabilities

- `featured-brands`: Homepage section that displays a grid of featured brand cards with a right-side dominant layout, loading state, and empty-state handling

### Modified Capabilities

<!-- No existing capabilities require requirement-level changes -->

## Impact

- Homepage (`src/routes/_main-layout/index.tsx`) will include the new `<FeaturedBrands />` component
- New files in `src/components/featured-brands/`, `src/services/featured-brands.ts`, and `src/query-options/featured-brands.ts`
- Follows the same data fetching pattern (TanStack Query + hardcoded service) as existing homepage sections
- No breaking changes to existing components or routes
