## 1. Prepare shared data exports

- [x] 1.1 Export the raw featured categories array from `src/services/featured-categories.ts` so it can be imported synchronously (e.g., `export const FEATURED_CATEGORIES: FeaturedCategory[] = [...]`)
- [x] 1.2 Export the raw featured brands array from `src/services/featured-brands.ts` so it can be imported synchronously (e.g., `export const FEATURED_BRANDS: FeaturedBrand[] = [...]`)
- [x] 1.3 Update `fetchFeaturedCategories()` and `fetchFeaturedBrands()` to return the exported arrays instead of inline literals

## 2. Implement the dropdown layout in nav-menu.tsx

- [x] 2.1 Replace the placeholder `<NavigationMenuLink>Link</NavigationMenuLink>` with a two-column grid layout inside `NavigationMenuContent`
- [x] 2.2 Add the left column titled "Categorías Destacadas" with links for Marcos ópticos, Gafas de sol, and Deportivas using TanStack `Link` with `search={{ categories: [name] }}`
- [x] 2.3 Add the right column titled "Marcas Destacadas" with links for Ray-Ban, Oakley, and Persol using TanStack `Link` with `search={{ brands: [name] }}`
- [x] 2.4 Add a "Ver todas las categorías" link at the bottom of the left column navigating to `/catalog` with all three featured categories in the `categories` array
- [x] 2.5 Add a "Ver todas las marcas" link at the bottom of the right column navigating to `/catalog` with all three featured brands in the `brands` array
- [x] 2.6 Use the `asChild` pattern on `NavigationMenuLink` so TanStack `Link` handles navigation natively and inherits focus/click behavior
- [x] 2.7 Apply compact Tailwind styling: column headings in muted-foreground, links with hover:bg-muted, consistent padding and gap

## 3. Polish and verify

- [x] 3.1 Run `pnpm format` to ensure code style matches the project (no semicolons, double quotes, trailing commas)
- [x] 3.2 Run `pnpm check` to verify formatting and TypeScript compilation
- [x] 3.3 Start `pnpm dev` and manually verify hover behavior, dropdown layout, and that category/brand links correctly pre-apply filters on the catalog page
