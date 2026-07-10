## 1. Dependencies & Scaffolding

- [x] 1.1 Add `embla-carousel-autoplay` to `package.json` (v8 line, compatible with `embla-carousel-react@^8.6.0`) and run `pnpm install`
- [x] 1.2 Create the component folder `src/components/top-sellers/` with stub files: `types.ts`, `top-product-card.tsx`, `top-sellers-skeleton.tsx`, `top-sellers.tsx`
- [x] 1.3 Create `src/services/top-sellers.ts` exporting an empty `fetchTopSellers` stub
- [x] 1.4 Create `src/query-options/top-sellers.ts` exporting a default `createTopSellersQueryOptions` stub

## 2. Data Layer (Service & Query Options)

- [x] 2.1 Define the `TopProduct` interface in `src/components/top-sellers/types.ts` with `imageUrl`, `name`, `brand`, and `price` (number, COP) fields
- [x] 2.2 Implement `fetchTopSellers()` in `src/services/top-sellers.ts` returning a `Promise<TopProduct[]>` of 10 hardcoded, ordered products
- [x] 2.3 Implement `createTopSellersQueryOptions` in `src/query-options/top-sellers.ts` following the `hero-slides` pattern (generic `TData`/`TError`, `queryKey: ["top-sellers", params ?? {}]`, `queryFn: fetchTopSellers`)
- [x] 2.4 Add a `formatCop(value: number): string` helper (using `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })`) in `src/components/top-sellers/types.ts` or a co-located `format.ts`

## 3. Product Card

- [x] 3.1 Implement `TopProductCard` in `src/components/top-sellers/top-product-card.tsx` accepting a `TopProduct` prop
- [x] 3.2 Render (top→bottom): product image (using `src/components/ui/image.tsx`), product name as title, brand name, COP price via `formatCop`
- [x] 3.3 Apply a fixed card aspect ratio and responsive styling (Tailwind v4 tokens) so layout does not shift while images load

## 4. Carousel Section

- [x] 4.1 Implement `TopSellers` in `src/components/top-sellers/top-sellers.tsx` using `useQuery(createTopSellersQueryOptions())`
- [x] 4.2 Render a section heading ("Top Sellers") with the same header pattern as `FeaturedCategories` (title + subtitle + "Ver todas" link to `/catalog`)
- [x] 4.3 Wrap the cards in the shadcn `Carousel`/`CarouselContent`/`CarouselItem` primitives with `CarouselPrevious`/`CarouselNext` arrows
- [x] 4.4 Configure `Carousel` with `opts={{ loop: true, align: "start" }}` and responsive `basis` per `CarouselItem` (e.g., `basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4`)
- [x] 4.5 Pass `Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })` to `Carousel` via the `plugins` prop

## 5. Accessibility & Auto-scroll Controls

- [x] 5.1 Add a `useEffect` that reads `matchMedia("(prefers-reduced-motion: reduce)")` and calls `api.plugins().autoplay.stop()` (or initialises `playOnInit: false`) when it matches; update on `change` events
- [x] 5.2 Add a `useEffect` that pauses auto-play on `document.hidden` (via `visibilitychange`) and resumes when visible again, using the autoplay plugin's `stop`/`play` API
- [x] 5.3 When the resolved list has ≤ 1 product, ensure auto-play is disabled (plugin `stop()`) and the section still renders the single card
- [x] 5.4 Wire keyboard navigation (ArrowLeft/ArrowRight) via the carousel's existing `onKeyDownCapture` behaviour or confirm Embla's default keyboard handling is active

## 6. Loading & Empty States

- [x] 6.1 Implement `TopSellersSkeleton` in `src/components/top-sellers/top-sellers-skeleton.tsx` matching the section header + a row of `Skeleton` card placeholders
- [x] 6.2 In `TopSellers`, return `<TopSellersSkeleton />` while `isLoading` and return `null` when the resolved list is empty

## 7. Homepage Integration

- [x] 7.1 Import `TopSellers` into `src/routes/_main-layout/index.tsx`
- [x] 7.2 Place `<TopSellers />` between `<HeroCarousel />` and `<FeaturedCategories />`

## 8. Verification

- [x] 8.1 Run `pnpm format` and `pnpm check` to enforce Prettier (no semicolons, double quotes, trailing commas)
- [x] 8.2 Run `pnpm lint` and `pnpm build` (or `tsc`) to confirm no TypeScript / `verbatimModuleSyntax` / unused-locals errors
- [ ] 8.3 Run `pnpm dev` and visually confirm: section ordering, card contents/order, COP formatting, auto-scroll, hover pause, arrow navigation, reduced-motion pause, loading skeleton, and empty state
- [x] 8.4 Run `openspec validate --changes top-sellers` to confirm the change's artifacts parse cleanly
