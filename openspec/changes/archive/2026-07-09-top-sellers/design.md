## Context

The homepage (`src/routes/_main-layout/index.tsx`) currently stacks three building-block sections — `HeroCarousel`, `FeaturedCategories`, and `WhyChooseUs` — each backed by an in-memory service in `src/services/` and a `queryOptions` wrapper in `src/query-options/` (canonical example: `hero-slides`). shadcn/ui is the component layer, and a `Carousel` primitive (Embla-backed) already exists at `src/components/ui/carousel.tsx` but is not yet used by any feature.

This change adds a "Top Sellers" section directly after the hero. It needs an auto-scrolling carousel that pauses on hover. Embla supports autoplay natively via the `Autoplay` plugin (`embla-carousel-autoplay`), which the shadcn `Carousel` surfaces through its `plugins` prop.

## Goals / Non-Goals

**Goals:**

- Render up to 10 best-selling products in a horizontally scrollable carousel using the existing shadcn `Carousel` primitive.
- Provide native auto-scroll that pauses on hover, tab-hidden, and `prefers-reduced-motion`, resuming when the interaction ends.
- Display each product card with image, name, brand, and a COP-formatted price.
- Follow the established service + `queryOptions` + component-folder pattern so the section is consistent with `featured-categories` and `hero-carousel`.
- Show a skeleton during fetch and hide the section entirely when there are no products.

**Non-Goals:**

- Product detail pages, add-to-cart, or product linking to `/catalog` filters (cards stay non-interactive visual tiles for now; future change can wire navigation).
- Real backend integration — data stays hardcoded in-memory per the project constraint.
- Server-side pagination, sorting, or analytics ordering — the in-memory list is already ordered by sales rank.
- Vertical orientation or drag-to-scroll tuning beyond Embla defaults.

## Decisions

### Decision 1: Use the shadcn `Carousel` primitive (Embla) rather than a custom carousel

**Choice:** Implement the section on top of the existing `src/components/ui/carousel.tsx` (Embla-backed) instead of hand-rolling transitions like `HeroCarousel` does.

**Why:** The user explicitly asked for the shadcn carousel, and Embla gives us free scrolling, snapping, RTL support, and accessibility primitives. `HeroCarousel` uses a custom opacity-crossfade because it needs full-bleed background images and absolute-stacked slides; product cards in a row don't need that.

**Alternatives considered:**

- Reuse the `HeroCarousel` absolute-stack approach → overkill and visually wrong for a row of cards.
- Build a CSS `scroll-snap` strip without Embla → loses keyboard nav, drag momentum, and the `CarouselApi` events we need for auto-scroll control parity with the hero spec.

### Decision 2: Use the official `embla-carousel-autoplay` plugin for auto-scroll

**Choice:** Add `embla-carousel-autoplay` to `package.json` and pass `Autoplay({ delay, stopOnInteraction: false, stopOnMouseEnter: true })` to `Carousel` via the `plugins` prop.

**Why:** The plugin natively provides exactly what the user asked for — "scrolling automatically unless the user hovers the carousel" — via `stopOnMouseEnter: true`, plus `play`/`stop` API methods for the tab-hidden and reduced-motion cases. This is the Embla-recommended approach and avoids reimplementing the interval/visibility logic that `HeroCarousel` maintains by hand.

**Alternatives considered:**

- A custom `useAutoPlay` hook mirroring `HeroCarousel`'s `setInterval` + `visibilitychange` + `prefers-reduced-motion` code → would work but duplicates logic and bypasses the plugin built for this purpose. Rejected to keep behavior consistent across carousels and reduce维护.
- `embla-carousel-auto-scroll` (continuous, non-snapping scroll) → suites the brief ("scrolls automatically") but it conflicts with `stopOnInteraction`-style manual arrows and is a heavier behavioral change. Rejected in favor of step-wise autoplay.

### Decision 3: COP price formatting via `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })`

**Choice:** A small `formatCop(value)` helper (in `src/components/top-sellers/types.ts` or a `format.ts` next to it) that wraps `Intl.NumberFormat`.

**Why:** Native, locale-aware, zero dependencies, produces the expected `$ 99.900` Colombian formatting. Keeps COP logic in one place so future components can reuse it.

**Alternatives considered:**

- A third-party currency library → overkill; `Intl` is built in.
- Manual string concatenation with thousands separators → error-prone and not locale-aware.

### Decision 4: One in-memory service + one `queryOptions` wrapper

**Choice:** `src/services/top-sellers.ts` exports `fetchTopSellers(): Promise<TopProduct[]>`, and `src/query-options/top-sellers.ts` exports a default `createTopSellersQueryOptions` function (matching `hero-slides`).

**Why:** Mirrors the canonical pattern documented in `AGENTS.md` and keeps the component thin.

### Decision 5: Card contents — name, then brand, then COP price

**Choice:** Card layout (top to bottom): product image, product `name` (title), product `brand` (secondary text / label), and `price` formatted in COP at the bottom. The ordering matches the user's request ("a title with the name, followed by the brand name and the price in cop").

### Decision 6: Auto-scroll config defaults

**Choice:** `delay` of 3000 ms; `stopOnInteraction: false` (so prev/next clicks don't permanently stop auto-scroll); `stopOnMouseEnter: true` (the user's explicit hover-pause ask); loop enabled via `opts={{ loop: true, align: "start" }}`.

**Why:** 3000 ms matches `HeroCarousel`'s `AUTO_PLAY_INTERVAL`, giving visual consistency across the homepage's two carousels.

## Risks / Trade-offs

- **[New dependency]** `embla-carousel-autoplay` is additive to the existing `embla-carousel-react` package and must be added to `package.json` and installed via `pnpm`. → Mitigation: pin a minor version compatible with `embla-carousel-react@^8.6.0` (the autoplay plugin's v8 line tracks embla v8).
- **[Reduced-motion accessibility]** If we forget to call `plugin.stop()` on `matchMedia("(prefers-reduced-motion: reduce)")`, auto-scroll runs for motion-sensitive users. → Mitigation: read the media query in a `useEffect` and call `api.plugins().autoplay.stop()` (or pass `playOnInit: false` initialised from the media query) — the spec captures this as a requirement/scenario.
- **[Tab-hidden CPU]** Auto-playing off-screen wastes a little CPU. → Mitigation: pause on `visibilitychange` via the same effect, mirroring `HeroCarousel`.
- **[Single product / empty list]** Loop with one item is visually inert. → Mitigation: section is hidden when empty; with fewer items than slides-per-view the carousel still works because Embla handles partial sets — no special-casing required, but the spec captures the "≤ 1 item disables autoplay" expectation.
- **[Performance of large images]** 10 remote product images could jank the homepage. → Mitigation: reuse the existing `src/components/ui/image.tsx` (likely lazy/ratio-aware) and set a fixed card aspect ratio so layout doesn't shift.
- **[No real backend]** Hardcoded list can drift from real catalog. → Accepted trade-off given the project constraint; service is the swap point once a backend exists.
