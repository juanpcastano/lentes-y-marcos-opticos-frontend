## 1. Data Layer

- [x] 1.1 Create `src/services/why-choose-us.ts` with hardcoded data (image URL, title, three features with icon names)
- [x] 1.2 Create `src/query-options/why-choose-us.ts` with `queryOptions` wrapper

## 2. Component Structure

- [x] 2.1 Create `src/components/why-choose-us/types.ts` with TypeScript interfaces for section data and feature item
- [x] 2.2 Create `src/components/why-choose-us/why-choose-us-skeleton.tsx` with skeleton matching the two-column layout
- [x] 2.3 Create `src/components/why-choose-us/why-choose-us.tsx` with responsive grid, Image component, title, and three feature items with colored badges

## 3. Homepage Integration

- [x] 3.1 Import and render `WhyChooseUs` section in `src/routes/_main-layout/index.tsx` below `FeaturedCategories`
- [x] 3.2 Wire up TanStack Query hook using the new query options

## 4. Polish & Verification

- [x] 4.1 Run `pnpm format` to ensure code style compliance
- [x] 4.2 Run `pnpm check` to verify formatting and lint
- [x] 4.3 Run `pnpm dev` and visually verify the section renders correctly on desktop and mobile
- [x] 4.4 Confirm skeleton state displays during loading and section hides when data is empty
