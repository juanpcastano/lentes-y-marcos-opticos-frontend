## 1. Component Setup

- [x] 1.1 Create component directory `src/components/exam-offer-banner/`
- [x] 1.2 Add promotional image asset or determine image URL to use

## 2. Implement ExamOfferBanner Component

- [x] 2.1 Create `src/components/exam-offer-banner/exam-offer-banner.tsx`
- [x] 2.2 Implement two-column grid layout (`grid-cols-1 md:grid-cols-2`)
- [x] 2.3 Implement left column with primary (`#002b9a`) background, headline, description, and CTA button using secondary variant with calendar icon
- [x] 2.4 Implement right column with promotional image using the project's `Image` component
- [x] 2.5 Ensure responsive styling: adequate padding (`p-6 md:p-10 lg:p-16`), responsive font sizes, and image `object-cover`
- [x] 2.6 Hardcode promotional text in Spanish as specified in the spec

## 3. Integrate into Homepage

- [x] 3.1 Import `ExamOfferBanner` in `src/routes/_main-layout/index.tsx`
- [x] 3.2 Place `<ExamOfferBanner />` immediately after `<WhyChooseUs />` in the section order

## 4. Quality Assurance

- [x] 4.1 Run `pnpm format` to ensure code formatting matches project style
- [x] 4.2 Run `pnpm check` to verify no lint or type errors
- [x] 4.3 Run `pnpm dev` and visually verify the banner on desktop and mobile viewports
- [x] 4.4 Confirm section order: HeroCarousel → TopSellers → FeaturedCategories → WhyChooseUs → ExamOfferBanner
