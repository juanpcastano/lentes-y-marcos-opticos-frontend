## Why

The current homepage lacks a compelling entry point to showcase featured products, promotions, and key navigation paths. A carousel hero section will capture user attention immediately, highlight dynamic content from the backend, and provide clear calls-to-action to drive engagement with the catalog, appointments, and featured collections.

## What Changes

- Add a new `HeroCarousel` component to the homepage (`/_main-layout/index.tsx`) that displays a rotating slideshow of hero slides.
- Each slide will contain: a background image fetched from the backend, an overlay title, a short description, and one or more action buttons linking to relevant routes (e.g., catalog, appointments, promotions).
- Implement auto-play with a configurable interval, manual navigation (previous/next arrows and dot indicators), and pause-on-hover.
- Add smooth CSS transitions between slides using Tailwind CSS animations.
- Ensure responsive behavior across mobile, tablet, and desktop viewports.
- Fetch slide data from the backend API via TanStack Query; show a skeleton loader while loading.
- **BREAKING**: The homepage layout in `/_main-layout/index.tsx` will be restructured to accommodate the hero section above existing content.

## Capabilities

### New Capabilities

- `hero-carousel`: Backend-driven carousel hero section with images, titles, descriptions, and navigation buttons. Covers data fetching, UI rendering, user interactions (auto-play, manual nav, pause-on-hover), and responsive design.

### Modified Capabilities

<!-- No existing capabilities have spec-level requirement changes. -->

## Impact

- **Affected routes**: `/_main-layout/index.tsx` (homepage)
- **New components**: `HeroCarousel`, `HeroSlide`, navigation controls
- **Dependencies**: `@tanstack/react-query` (data fetching), existing `Button` and `Skeleton` shadcn/ui components, Tailwind CSS v4 animations
- **Backend contract**: Expects a new or existing API endpoint returning an array of hero slides with `imageUrl`, `title`, `description`, and `actions` (label + route/path per slide).
