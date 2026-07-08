## 1. Data Layer

- [x] 1.1 Define `FeaturedCategory` type in `src/components/featured-categories/types.ts`
- [x] 1.2 Create hardcoded service `src/services/featured-categories.ts` returning three categories (Ópticos, Sol, Niños) with image URLs, names, and descriptions
- [x] 1.3 Create query options `src/query-options/featured-categories.ts` following the hero-slides pattern

## 2. UI Components

- [x] 2.1 Create `src/components/featured-categories/featured-categories-skeleton.tsx` with a skeleton matching the 2-column grid layout
- [x] 2.2 Create `src/components/featured-categories/featured-category-card.tsx` that renders a single card with background image, gradient scrim, name, and description overlaid at the bottom-left
- [x] 2.3 Create `src/components/featured-categories/featured-categories.tsx` that fetches data, handles loading/empty states, renders the section header (title, subtitle, "Ver todas" link pointing to `/catalog`), and arranges cards in the responsive grid layout

## 3. Integration

- [x] 3.1 Import and render `<FeaturedCategories />` in `src/routes/_main-layout/index.tsx` directly below `<HeroCarousel />`
- [x] 3.2 Remove the placeholder `<div>Home page</div>` from the index route

## 4. Polish & Verification

- [x] 4.1 Verify responsive behavior: single column on mobile, 2-column grid on md+
- [x] 4.2 Verify loading skeleton matches the final layout dimensions
- [x] 4.3 Verify empty state hides the section entirely
- [x] 4.4 Run `pnpm format` and `pnpm check` to ensure code style compliance
- [x] 4.5 Run `pnpm build` to confirm no TypeScript or build errors
