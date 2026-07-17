## 1. Data Layer

- [x] 1.1 Create `src/services/categories.ts` with a `fetchCategories` function that returns a hardcoded array of all store categories (`name`, `imageUrl`, `description`), matching the categories present in `products.ts`.
- [x] 1.2 Create `src/query-options/categories.ts` exporting a `createCategoriesQueryOptions` wrapper using `queryOptions`, following the pattern in `query-options/featured-categories.ts`.
- [x] 1.3 Create `src/components/categories/types.ts` with a `Category` interface (`name`, `imageUrl`, `description`).

## 2. Categories Page Route

- [x] 2.1 Create `src/routes/_main-layout/categories.tsx` with a `createFileRoute` for `/_main-layout/categories`, using TanStack Router file-based routing.
- [x] 2.2 Implement the `CategoriesPage` component: fetch categories via `useQuery`, render a page header with "Nuestras Categorías" title and subtitle, and a responsive grid of category cards.
- [x] 2.3 Add a skeleton loading state using `CategoriesSkeleton` that matches the card grid layout.
- [x] 2.4 Add an empty state message for when zero categories are returned.

## 3. Category Card Component

- [x] 3.1 Create `src/components/categories/category-card.tsx` that renders a category image with a gradient scrim overlay, category name, and description at the bottom-left.
- [x] 3.2 Ensure the card uses proper alt text for the image and heading hierarchy for accessibility.

## 4. Update Existing Links

- [x] 4.1 In `src/components/featured-categories/featured-categories.tsx`, update the "Ver todas" `<Link>` `to` prop from `/catalog` to `/categories`.
- [x] 4.2 In `src/routes/_main-layout/catalog.tsx`, add a "Ver todas" link below the `<CategoryFilter>` inside the "Categoría" `<FilterSection>` that routes to `/categories` without a full page reload.

## 5. Verification

- [x] 5.1 Run `pnpm format` and `pnpm check` to ensure code style compliance.
- [x] 5.2 Run `pnpm dev` and verify the `/categories` route renders correctly with all category cards.
- [x] 5.3 Verify the "Ver todas" link on the homepage featured categories section navigates to `/categories`.
- [x] 5.4 Verify the "Ver todas" link below the category filters on the catalog page navigates to `/categories`.
- [x] 5.5 Run `pnpm build` to confirm the build passes.
