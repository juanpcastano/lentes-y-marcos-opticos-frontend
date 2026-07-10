## Context

The homepage currently renders four sections in order: `HeroCarousel`, `TopSellers`, `FeaturedCategories`, and `WhyChooseUs`. The business wants to highlight a free eye exam offer (100% bonificado) to drive appointment bookings. This change adds a new promotional banner section immediately after `WhyChooseUs`.

The project uses React + TypeScript, Tailwind CSS v4 with theme tokens defined in `src/styles.css`, TanStack Query for data fetching, and shadcn/ui components. All service data is hardcoded in-memory per project conventions.

## Goals / Non-Goals

**Goals:**

- Add a reusable `ExamOfferBanner` section component to the homepage.
- Position it immediately after the `WhyChooseUs` section.
- Render a two-column layout: text content (headline, description, CTA) on the left with a dark blue background, and a promotional image on the right.
- Ensure responsive behavior: stack vertically on mobile, two columns on desktop.
- Use existing theme tokens and shadcn/ui `Button` component.
- Keep data hardcoded in-memory following project patterns.

**Non-Goals:**

- No changes to the `WhyChooseUs` component or its spec requirements.
- No backend/API integration or real booking flow (the CTA can link to the existing `/apointments` route or be a placeholder).
- No new runtime dependencies.
- No skeleton/loading state (data is static).

## Decisions

**Component structure: Standalone section component**

- Rationale: Follows the established pattern used by `HeroCarousel`, `TopSellers`, `FeaturedCategories`, and `WhyChooseUs`. Each section is a self-contained component under `src/components/<section-name>/`.
- Alternative: Inline the JSX directly in the homepage route. Rejected because it hurts reusability and testability.

**Data approach: Hardcoded constant in the component file**

- Rationale: The promotional content (headline, description, image URL, CTA text, CTA link) is static marketing copy that rarely changes. Placing it directly in the component avoids unnecessary abstraction. If the content later needs to be dynamic, a service layer can be introduced following the existing `src/services/` + `src/query-options/` pattern.
- Alternative: Create a dedicated service file. Rejected as overkill for static copy.

**Layout: CSS Grid with `grid-cols-1 md:grid-cols-2`**

- Rationale: Matches the responsive two-column pattern already used by `WhyChooseUs`. Consistent with the codebase and minimal CSS.
- Alternative: Flexbox with media queries. Rejected because grid provides cleaner equal-width columns on desktop without manual width calculations.

**Left column background: `--color-primary` (`#002b9a`)**

- Rationale: The design mockup shows a dark navy left panel. The project's primary color (`#002b9a`) is an exact match. Using the theme token ensures consistency and dark-mode compatibility if the token is updated.
- Alternative: Hardcoded hex value. Rejected because it breaks theme consistency.

**CTA button style: `variant="secondary"` (lime green)**

- Rationale: The secondary color (`#aaf457`) provides high contrast against the dark blue primary background, making the CTA highly visible. This is the project's standard accent/action color.
- Alternative: `variant="default"` with primary background. Rejected because a blue button on a blue background would have poor contrast.

**Image handling: Reuse existing `Image` component from `#/components/ui/image`**

- Rationale: The project already has a custom `Image` component used by `WhyChooseUs` and `HeroCarousel`. It likely handles loading states, aspect ratios, and optimizations.
- Alternative: Native `<img>` tag. Rejected to maintain consistency with existing image handling behavior.

## Risks / Trade-offs

- **[Risk] Image aspect ratio shifts on different viewports** → Mitigation: Use `object-cover` and a consistent container aspect ratio (e.g., `aspect-[4/3]` or `aspect-square` on mobile, `aspect-auto` or full height on desktop).
- **[Risk] Text overflows on very small screens** → Mitigation: Use responsive font sizes (`text-2xl md:text-3xl lg:text-4xl`) and adequate padding (`p-6 md:p-10 lg:p-16`).
- **[Trade-off] Hardcoded Spanish copy** → The text is fixed in the component. If marketing copy changes frequently, a future refactor to a service/config file will be needed.

## Migration Plan

Not applicable. This is a pure UI addition with no data migration, API changes, or deployment complexity.
