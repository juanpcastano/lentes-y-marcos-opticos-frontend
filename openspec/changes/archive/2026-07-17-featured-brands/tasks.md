## 1. Data Layer

- [x] 1.1 Create `src/components/featured-brands/types.ts` with `FeaturedBrand` interface (imageUrl, name, tagline)
- [x] 1.2 Create `src/services/featured-brands.ts` with hardcoded `fetchFeaturedBrands()` returning 3 brand objects
- [x] 1.3 Create `src/query-options/featured-brands.ts` with `createFeaturedBrandsQueryOptions()` following the featured-categories pattern

## 2. UI Components

- [x] 2.1 Create `src/components/featured-brands/featured-brand-card.tsx` with background image, gradient scrim, name/tagline overlay, and focus indicators
- [x] 2.2 Create `src/components/featured-brands/featured-brands-skeleton.tsx` matching the right-side dominant grid layout
- [x] 2.3 Create `src/components/featured-brands/featured-brands.tsx` section component with header (title "Marcas Destacadas", subtitle, "Ver todas" link), grid layout with large card on the right, loading/empty states

## 3. Integration & Polish

- [x] 3.1 Add `<FeaturedBrands />` to `src/routes/_main-layout/index.tsx` below `<FeaturedCategories />`
- [x] 3.2 Run `pnpm format` and `pnpm check` to verify formatting and build
- [x] 3.3 Run `pnpm dev` and visually verify the section renders correctly at mobile and desktop breakpoints
