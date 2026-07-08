## 1. Data Layer

- [x] 1.1 Create `src/components/hero-carousel/types.ts` with the `HeroSlide` interface (`imageUrl`, `title`, `description`, `actions: { label: string; to: string }[]`).
- [x] 1.2 Create `src/services/hero-slides.ts` with the `fetchHeroSlides` query function, and `src/query-options/hero-slides.ts` exporting `createHeroSlidesQueryOptions(params?, options?)` so the component calls `useQuery(createHeroSlidesQueryOptions())`.

## 2. Core Carousel Component

- [x] 2.1 Create `src/components/hero-carousel/hero-carousel.tsx` implementing the container with `useState` for `activeIndex`, `useEffect` for auto-play timer, and `useRef` for hover/blur pause logic.
- [x] 2.2 Add keyboard navigation support (`ArrowLeft` / `ArrowRight`) and ARIA roles (`role="region"`, `aria-roledescription="carousel"`).
- [x] 2.3 Respect `prefers-reduced-motion` by disabling auto-play and transitions when the media query matches.
- [x] 2.4 Implement cross-fade CSS transitions using Tailwind `transition-opacity duration-500` on slide containers.

## 3. Slide & Controls Subcomponents

- [x] 3.1 Create `src/components/hero-carousel/hero-slide.tsx` rendering the background image (using the existing `Image` component or `<img loading="lazy">`), title, description, and action buttons wrapped in TanStack Router `<Link>`.
- [x] 3.2 Create `src/components/hero-carousel/carousel-controls.tsx` with previous/next arrow buttons (using `lucide-react` `ChevronLeft` / `ChevronRight`) and dot indicators.
- [x] 3.3 Style controls to overlay the carousel absolutely, with responsive sizing (hide arrows on mobile, show dots below).
- [x] 3.4 Arrows only appear on hover with a smooth appearing transition.

## 4. Loading & Empty States

- [x] 4.1 Create `src/components/hero-carousel/hero-carousel-skeleton.tsx` using the existing `Skeleton` component to match the carousel's aspect ratio and text block layout.
- [x] 4.2 Update `hero-carousel.tsx` to render the skeleton when `isLoading` is true.
- [x] 4.3 Update `hero-carousel.tsx` to return `null` (render nothing) when `slides.length === 0`.

## 5. Integration & Styling

- [x] 5.1 Update `src/routes/_main-layout/index.tsx` to import and render `<HeroCarousel />` above existing homepage content.
- [x] 5.2 Ensure the carousel container is responsive: `w-full`, mobile height (`h-64`), tablet (`md:h-96`), desktop (`lg:h-[28rem]`), with text and button stacking on small screens.
- [x] 5.3 Add a dark gradient overlay (`bg-gradient-to-t from-black/60 to-transparent`) behind text for readability over busy images.

## 6. Verification

- [x] 6.1 Run `pnpm dev` and visually verify the carousel renders, auto-plays, pauses on hover, and navigates correctly.
- [x] 6.2 Run `pnpm lint` and `pnpm check` to ensure no formatting or linting errors.
- [x] 6.3 Run `pnpm test` (if applicable) to confirm no existing tests are broken.
