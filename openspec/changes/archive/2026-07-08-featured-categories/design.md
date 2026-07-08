## Context

The project is an optical store frontend built with React, TanStack Router, TanStack Query, Tailwind CSS v4, and shadcn/ui. The homepage currently renders a hero carousel followed by a placeholder. The goal is to add a "Categorías Destacadas" section immediately below the hero to surface the three main product categories: Ópticos (eyeglasses), Sol (sunglasses), and Niños (kids).

The existing codebase already follows a clear pattern for data fetching:

- `src/services/` holds raw in-memory fetch functions
- `src/query-options/` exports `queryOptions` wrappers
- Components live in `src/components/<feature>/`

The design reference shows:

- A section header with title, subtitle, and "Ver todas" link
- A 2-column grid layout: one large card on the left spanning full height, two smaller stacked cards on the right
- Each card uses a full-bleed background image with text overlaid at the bottom-left
- Cards have rounded corners

## Goals / Non-Goals

**Goals:**

- Implement a visually prominent featured categories section on the homepage
- Match the reference layout: large left card + two right stacked cards
- Follow existing project patterns for data fetching, loading states, and component organization
- Ensure responsive behavior across mobile, tablet, and desktop
- Maintain accessibility standards (proper headings, alt text, focus states)

**Non-Goals:**

- Real backend integration (data remains hardcoded in-memory per project convention)
- Category detail pages or navigation (cards can be non-interactive or link to placeholders)
- Animations or hover effects beyond standard CSS transitions
- Dynamic category count or configurable layout

## Decisions

**Decision: CSS Grid for the card layout**

- _Rationale_: The reference shows a clear asymmetric grid (1 large + 2 small). CSS Grid with `grid-template-rows` and `grid-template-columns` is the most straightforward way to achieve this without nested flexbox containers. On mobile, it collapses to a single column.
- _Alternative considered_: Flexbox with fixed heights — rejected because it requires manual height synchronization between left and right columns.

**Decision: Reuse existing TanStack Query + services pattern**

- _Rationale_: The hero carousel already uses `src/services/` + `src/query-options/`. Consistency reduces cognitive load and follows the established convention.
- _Alternative considered_: Direct import of static data — rejected because it skips loading states and would require a different skeleton approach.

**Decision: Skeleton loading instead of inline spinner**

- _Rationale_: The hero carousel uses a skeleton placeholder. Matching this pattern keeps the UX consistent.
- _Alternative considered_: A centered spinner — rejected because it creates layout shift when data loads.

**Decision: Text overlay directly on images with gradient scrim**

- _Rationale_: The reference shows text at the bottom-left of each card over the image. A subtle bottom-to-top gradient ensures text readability regardless of image brightness, without requiring image preprocessing.
- _Alternative considered_: Solid color card backgrounds with images above text — rejected because it does not match the reference design.

## Risks / Trade-offs

- [Risk] Background images may have varying brightness, making white text hard to read on some images → Mitigation: Apply a semi-transparent dark gradient scrim (`from-transparent to-black/60`) at the bottom of each card.
- [Risk] Large images may cause layout shift if aspect ratios differ → Mitigation: Use `aspect-ratio` CSS properties and `object-cover` to enforce consistent card shapes.
- [Risk] Mobile viewport may make the 2-column grid too cramped → Mitigation: Collapse to a single column on screens below `md` (768px).
- [Risk] No real category routes exist yet, so "Ver todas" link navigates to `/catalog` as a temporary destination → Mitigation: Link to `/catalog` for now; update to `/categorias` once a dedicated categories listing page exists.

## Migration Plan

Not applicable — this is a purely additive feature with no existing data or APIs to migrate.

## Open Questions

- The "Ver todas" link navigates to `/catalog` for now, which already exists as a real route in the application.
