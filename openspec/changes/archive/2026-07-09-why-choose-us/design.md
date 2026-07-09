## Context

The homepage at `src/routes/_main-layout/index.tsx` currently renders two sections: `HeroCarousel` and `FeaturedCategories`. Both follow the established pattern of fetching hardcoded data via a service + TanStack Query `queryOptions`, displaying a skeleton while loading, and hiding when empty. The project uses Tailwind CSS v4 with theme tokens defined in `src/styles.css`, shadcn/ui components in `src/components/ui/`, and the custom `Image` component for lazy-loaded images with skeleton placeholders.

## Goals / Non-Goals

**Goals:**

- Add a `WhyChooseUs` section below `FeaturedCategories` on the homepage.
- Match the two-column layout from the reference image: image left, content right on desktop.
- Display a section title and three feature items, each with an icon badge, title, and description.
- Use existing theme colors for icon badges (primary blue `#002b9a` for items 1 & 3, secondary lime `#aaf457` for item 2).
- Use a slightly different background color (`muted` / `#e5eeff`) to visually separate the section.
- Follow existing data-fetching and loading patterns (service → queryOptions → skeleton → conditional render).

**Non-Goals:**

- No real backend integration (data remains hardcoded in services, per project convention).
- No new page routes or navigation changes.
- No new external dependencies or shadcn components.

## Decisions

**1. Data structure: single object with nested features**

- Rationale: The section is tightly coupled — one image, one title, three items. Returning a single object keeps the service simple and matches the visual grouping.
- Alternative: Separate queries for image and features — rejected as unnecessary complexity for static data.

**2. Icon selection: lucide-react icons**

- Rationale: The project already uses `lucide-react`. We’ll map `Microscope` (or `ScanEye`), `Tag`, and `CalendarDays` to the three features.
- Alternative: Custom SVG icons — rejected to avoid extra asset management.

**3. Color mapping: primary for items 1 & 3, secondary for item 2**

- Rationale: The reference image uses blue for the first and third badges and green for the second. The existing theme tokens map perfectly (`primary` = deep blue, `secondary` = lime green).
- Alternative: Single color for all badges — rejected because the mock intentionally differentiates the middle item.

**4. Background: `bg-muted`**

- Rationale: The mock shows a slightly different background. The existing `--muted: #e5eeff` token provides the subtle contrast needed without introducing a new color.

**5. Layout: CSS Grid / Flexbox with responsive breakpoints**

- Rationale: Tailwind’s `grid-cols-1 md:grid-cols-2` handles the responsive switch cleanly. The image column uses `aspect-square` or `aspect-[4/3]` to maintain proportions.

## Risks / Trade-offs

- **[Risk] Unsplash placeholder URL may fail or load slowly** → Mitigation: Use the existing `Image` component, which shows a skeleton placeholder and handles loading states gracefully.
- **[Risk] Spanish copy may need refinement later** → Mitigation: Hardcoded in the service; easy to update without touching components.
- **[Risk] Section adds vertical space to an already long homepage** → Mitigation: Keep padding moderate (`py-10 md:py-16`) and ensure the section collapses gracefully on mobile.
