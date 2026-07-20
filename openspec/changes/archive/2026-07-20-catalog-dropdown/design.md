## Context

The Catálogo item in the desktop navigation (`nav-menu.tsx`) uses a Radix-based `NavigationMenu` with a `NavigationMenuContent` container that currently holds a single placeholder `<NavigationMenuLink>Link</NavigationMenuLink>`. The project already has:

- `fetchFeaturedCategories()` and `fetchFeaturedBrands()` services returning 3 items each.
- Corresponding query option wrappers in `src/query-options/`.
- A catalog page at `/catalog` that accepts `categories` and `brands` query parameter arrays and filters products accordingly.
- A `NavigationMenu` primitive from `src/components/ui/navigation-menu.tsx` that handles hover/focus, viewport animation, and responsive positioning.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder dropdown with a two-column layout showing featured categories and brands.
- Keep compact text-only links (no large images) inside the dropdown to preserve fast hover interaction.
- Each link navigates to `/catalog` with the appropriate filter pre-applied.
- Include a "Ver todas" link in each column for discoverability.
- Maintain existing hover/focus behavior from the NavigationMenu primitive.

**Non-Goals:**

- No changes to mobile navigation (drawer stays unchanged).
- No changes to the homepage featured-categories or featured-brands sections.
- No new routes needed (`/categories`, `/brands`) — they already exist.
- No images or rich media inside the dropdown.

## Decisions

**1. Reuse existing `fetchFeaturedCategories` / `fetchFeaturedBrands` data**

- _Rationale_: The dropdown is a quick-access view; the same 3 featured items from the homepage provide consistency without duplicating data sources. Adding a separate "dropdown categories" service would be unnecessary overhead.
- _Alternative considered_: Creating a dedicated `fetchDropdownItems()` — rejected because it adds indirection for no functional gain.

**2. Directly import the data arrays in the nav component (no separate API call)**

- _Rationale_: Since all data is hardcoded in-memory, importing the arrays directly avoids the need for TanStack Query hooks inside the nav menu, which simplifies SSR/first-render behavior and avoids layout shift from a loading state in a hover dropdown.
- _Alternative considered_: Using `useQuery` inside `nav-menu.tsx` — rejected because a dropdown should not have a loading skeleton; the data is static anyway.

**3. Use `Link` from `@tanstack/react-router` with `search` prop for filter navigation**

- _Rationale_: TanStack Router's `Link` with typed `search` gives us type-safe navigation to `/catalog?categories=["..."]` or `/catalog?brands=["..."]` without manual string concatenation.

**4. Use a grid layout inside `NavigationMenuContent`**

- _Rationale_: Tailwind's `grid-cols-2` inside the content slot is the simplest way to create two equal columns while staying within the existing `NavigationMenu` markup. The `NavigationMenuContent` already supports full-width panels via `md:w-auto`.

**5. "Ver todas" navigates to dedicated category and brand pages**

- _Rationale_: The project has standalone `/categories` and `/brands` pages that showcase all items in a richer layout than the catalog filter sidebar. This gives users a proper destination for exploration rather than a pre-filtered product grid.
- _Alternative considered_: Pre-applying filters on `/catalog` — rejected because the dedicated pages provide a better browsing experience.

## Risks / Trade-offs

- **[Risk]** The `NavigationMenuContent` width is dynamic based on viewport width (`md:w-auto`). A very long brand or category name could make one column wider than the other.
  → _Mitigation_: Use `min-w-0` and `truncate` on link text, or set an explicit `min-w` on the grid container.

- **[Risk]** Adding `Link` elements with `search` props inside `NavigationMenuLink` may conflict with Radix's internal link styling.
  → _Mitigation_: Use the `asChild` pattern on `NavigationMenuLink` so the TanStack `Link` receives focus/click events natively.

- **[Trade-off]** Hardcoding the featured lists in the dropdown means any change to `fetchFeaturedCategories` must also be reflected in the dropdown if we ever want them to diverge. We accept this because the lists are intentionally the same.
