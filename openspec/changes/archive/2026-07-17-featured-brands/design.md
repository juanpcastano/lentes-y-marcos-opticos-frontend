## Context

The project already has a `FeaturedCategories` section on the homepage that follows a well-established pattern: a TanStack Query hook fetches hardcoded data from a service function, renders a responsive grid with a large card on the left, and includes a skeleton loader. The goal is to introduce a `FeaturedBrands` section that mirrors this pattern exactly, with the only visual difference being that the dominant card appears on the right instead of the left.

Existing files to reference:

- `src/components/featured-categories/featured-categories.tsx`
- `src/components/featured-categories/featured-category-card.tsx`
- `src/services/featured-categories.ts`
- `src/query-options/featured-categories.ts`

## Goals / Non-Goals

**Goals:**

- Replicate the featured-categories architecture for a new featured-brands section
- Swap the desktop grid layout so the first (large) card occupies the right column
- Keep file structure, naming conventions, and data patterns identical to the existing section for maintainability

**Non-Goals:**

- No new backend integration (continue using hardcoded in-memory data)
- No changes to the existing featured-categories component or its behavior
- No new design system tokens or styling beyond what already exists

## Decisions

**Decision: Mirror the featured-categories component structure**

- Rationale: The project already has a proven, accessible, responsive pattern for homepage promotional sections. Repeating the same component organization (`<section>`, header, grid, card subcomponent, skeleton, types, service, query options) makes the code predictable for future maintainers.
- Alternative considered: Building a single generic "featured grid" component that accepts a `dominantSide` prop. Rejected because the project currently has only two sections, and premature abstraction adds unnecessary complexity. If a third similar section is added later, we can generalize then.

**Decision: Use CSS grid with explicit placement for the right-side dominant card**

- Rationale: On desktop (`md:` breakpoint) we need a 2-column grid where the first item spans the right column. Tailwind's `grid-cols-2` plus explicit `col-start` / `col-end` or `row-span-2` utilities can achieve this. The simplest approach is to place the large card in the second column by rendering it after the two smaller cards in the DOM order, or by using `order` utilities.
- Chosen approach: Render the large card as the last DOM child and use `md:order-last` (or simply rely on natural grid flow with `grid-auto-flow: row dense`) so the right column gets the tall card. This keeps the code readable and avoids complex manual grid-area declarations.

**Decision: Continue with hardcoded service data**

- Rationale: The `AGENTS.md` explicitly states: "For the moment, all data returned by services must be hardcoded in-memory data — there is no real backend yet." The new `fetchFeaturedBrands` service will follow the same array-of-objects pattern.

## Risks / Trade-offs

- [Risk] Grid layout confusion on desktop if DOM order is not carefully controlled → Mitigation: Place the large card as the last child in the grid container and test at `md:` breakpoint.
- [Risk] Slight visual asymmetry if the two sections are stacked directly on top of each other with mirrored layouts → Mitigation: Accept this as intentional per user request; it creates visual rhythm rather than monotony.

## Migration Plan

Not applicable — this is a purely additive change with no breaking changes or deprecations.
