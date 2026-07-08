## Why

The homepage currently only displays the hero carousel followed by a placeholder. To guide users toward product discovery and improve conversion, we need a visually prominent section showcasing the main product categories immediately after the hero. This follows standard e-commerce patterns where category navigation is one of the strongest drivers of engagement.

## What Changes

- Add a "Categorías Destacadas" (Featured Categories) section on the homepage, positioned directly below the hero carousel.
- Display three category cards in a responsive layout: a large featured card on the left and two stacked smaller cards on the right.
- Each card displays a background image, category name, and a short description.
- Include a section header with title, subtitle, and a "Ver todas" link with a chevron icon.
- Implement skeleton loading state while category data is being fetched.
- Hide the entire section if no categories are returned from the backend.
- All data is hardcoded in-memory for now, following the existing service pattern.

## Capabilities

### New Capabilities

- `featured-categories`: Homepage section that displays a grid of featured product category cards with images, titles, descriptions, and a section header with navigation link.

### Modified Capabilities

- _(none)_

## Impact

- Affects `src/routes/_main-layout/index.tsx` to include the new section below the hero carousel.
- New components: `src/components/featured-categories/featured-categories.tsx`, `featured-category-card.tsx`, `featured-categories-skeleton.tsx`.
- New service: `src/services/featured-categories.ts` with hardcoded data.
- New query options: `src/query-options/featured-categories.ts`.
- No breaking changes to existing APIs or routes.
