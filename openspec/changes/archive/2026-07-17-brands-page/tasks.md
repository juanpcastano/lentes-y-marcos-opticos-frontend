## 1. Data Layer

- [x] 1.1 Create `src/services/brands.ts` with a `fetchBrands` function that returns a hardcoded array of all store brands (`name`, `imageUrl`, `tagline`), matching the brands present in `products.ts`.
- [x] 1.2 Create `src/query-options/brands.ts` exporting a `createBrandsQueryOptions` wrapper using `queryOptions`, following the pattern in `query-options/featured-brands.ts`.
- [x] 1.3 Create `src/components/brands/types.ts` with a `Brand` interface (`name`, `imageUrl`, `tagline`).

## 2. Brands Page Route

- [x] 2.1 Create `src/routes/_main-layout/brands.tsx` with a `createFileRoute` for `/_main-layout/brands`, using TanStack Router file-based routing.
- [x] 2.2 Implement the `BrandsPage` component: fetch brands via `useQuery`, render a page header with "Nuestras Marcas" title and subtitle, and a responsive grid of brand cards.
- [x] 2.3 Add a skeleton loading state using `BrandsSkeleton` that matches the card grid layout.
- [x] 2.4 Add an empty state message for when zero brands are returned.

## 3. Brand Card Component

- [x] 3.1 Create `src/components/brands/brand-card.tsx` that renders a brand image with a gradient scrim overlay, brand name, and tagline at the bottom-left.
- [x] 3.2 Ensure the card uses proper alt text for the image and heading hierarchy for accessibility.

## 4. Update Existing Links

- [x] 4.1 In `src/components/featured-brands/featured-brands.tsx`, update the "Ver todas" `<Link>` `to` prop from `/catalog` to `/brands`.
- [x] 4.2 In `src/routes/_main-layout/catalog.tsx`, add a "Ver todas" link below the `<BrandFilter>` inside the "Marca" `<FilterSection>` that routes to `/brands` without a full page reload.

## 5. Verification

- [x] 5.1 Run `pnpm format` and `pnpm check` to ensure code style compliance.
- [x] 5.2 Run `pnpm dev` and verify the `/brands` route renders correctly with all brand cards.
- [x] 5.3 Verify the "Ver todas" link on the homepage featured brands section navigates to `/brands`.
- [x] 5.4 Verify the "Ver todas" link below the brand filters on the catalog page navigates to `/brands`.
- [x] 5.5 Run `pnpm build` to confirm the build passes.
