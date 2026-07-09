## Why

The homepage currently only has a hero carousel and featured categories section. To build trust with visitors and communicate key value propositions (advanced technology, curated brands, easy scheduling), we need a dedicated "Why Choose Us" section that highlights the clinic's competitive advantages.

## What Changes

- Add a new `WhyChooseUs` section component to the homepage, positioned below `FeaturedCategories`.
- Create a `why-choose-us` service that returns hardcoded feature data (image URL, title, and three feature items).
- Create a `why-choose-us` query option wrapper for TanStack Query integration.
- Implement responsive two-column layout: image left, content right on desktop; stacked on mobile.
- Add skeleton loading state matching the section layout.
- Use existing theme tokens (`primary` and `secondary` colors) for feature icon badges.

## Capabilities

### New Capabilities

- `why-choose-us`: Homepage section that displays the clinic's value proposition with an image and three feature items, each with an icon badge, title, and description.

### Modified Capabilities

<!-- No existing specs require behavioral changes. -->

## Impact

- `src/routes/_main-layout/index.tsx` — import and render the new section.
- `src/components/why-choose-us/` — new folder with section component, types, and skeleton.
- `src/services/why-choose-us.ts` — new service with hardcoded data.
- `src/query-options/why-choose-us.ts` — new query options wrapper.
