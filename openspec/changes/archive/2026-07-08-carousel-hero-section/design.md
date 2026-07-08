## Context

This project is a React 19 + TanStack Router + Tailwind CSS v4 frontend for an optical store. The homepage (`/_main-layout/index.tsx`) currently lacks a visually engaging hero section to showcase featured content, promotions, and navigation paths. The proposal introduces a backend-driven carousel hero section.

Current constraints:

- Tailwind CSS v4 with `@tailwindcss/vite`
- shadcn/ui component system with `class-variance-authority`, `tailwind-merge`, `clsx`
- `@tanstack/react-query` already installed for server state
- `lucide-react` available for icons
- Existing `Button`, `Skeleton`, and `Image` shadcn/ui components present

## Goals / Non-Goals

**Goals:**

- Deliver a reusable, responsive `HeroCarousel` component that renders slides fetched from the backend.
- Support auto-play, manual navigation (arrows + dots), and pause-on-hover.
- Use Tailwind CSS for all styling and transitions; avoid extra carousel libraries to keep bundle size minimal.
- Integrate cleanly with TanStack Router links for action buttons.
- Provide graceful loading and error states using existing UI primitives.

**Non-Goals:**

- Full-screen background video support.
- Touch swipe gestures (can be added later; arrows/dots cover desktop and mobile tap).
- Backend API design/implementation (we consume an assumed endpoint shape).
- Accessibility audit beyond basic keyboard focus and ARIA labels (future enhancement).

## Decisions

### 1. Pure React + Tailwind carousel instead of an external library

**Rationale:** Keeps bundle size small and styling fully under Tailwind control. The requirements are simple (fade/slide transitions, auto-play, manual nav) and easily implemented with `useState`/`useEffect` and CSS transitions. An external library (e.g., Embla, Swiper) adds unnecessary weight and styling conflicts with Tailwind v4.
**Alternative considered:** Swiper/Embla Carousel — rejected to avoid dependency bloat and custom styling friction.

### 2. Data fetching via `@tanstack/react-query` with a custom hook `useHeroSlides`

**Rationale:** Consistent with existing patterns in the codebase. Encapsulates the API call, loading state, and error handling in one hook that the carousel component consumes.
**Alternative considered:** Raw `fetch` inside `useEffect` — rejected because it lacks caching, deduping, and background refetching that React Query provides out of the box.

### 3. Slide transition: CSS opacity cross-fade with optional translate

**Rationale:** Visually smooth, easy to implement with Tailwind `transition-opacity duration-500`, and avoids complex absolute-positioning bugs. A subtle `translateX` can be layered on top if desired.
**Alternative considered:** Complex spring physics — rejected as overkill for a marketing hero section.

### 4. Navigation controls rendered inside the carousel container

**Rationale:** Overlaying arrows and dots on the image area is the standard hero-carousel pattern and saves vertical space. Uses absolute positioning within a relative container.

### 5. Action buttons use TanStack Router `<Link>`

**Rationale:** The project uses TanStack Router; internal navigation should preserve SPA behavior. Buttons styled as `Button` variants wrapping `Link` components.

### 6. Pause auto-play on hover and on window blur

**Rationale:** Respects user attention and prevents background tab waste. Implemented via `mouseenter`/`mouseleave` and `visibilitychange` listeners.

## Risks / Trade-offs

- **[Risk]** If the backend returns many slides, the DOM will hold all images simultaneously.  
  **Mitigation:** Limit to a reasonable maximum (e.g., 5–6 slides) and lazy-load non-active images with `loading="lazy"`. If scaling beyond that, switch to a virtualization approach later.

- **[Risk]** Auto-play can be distracting or inaccessible for some users.  
  **Mitigation:** Provide manual controls (arrows + dots) and pause on hover/focus. A future enhancement can add a visible play/pause toggle.

- **[Risk]** Tailwind v4 syntax or custom keyframes differ from v3 patterns the team may be used to.  
  **Mitigation:** Keep all animations inside standard utility classes (`transition-opacity`, `duration-500`, `ease-in-out`). Only add custom `@theme` or `@keyframes` if strictly necessary.

- **[Trade-off]** No touch swipe in v1 means mobile users rely on dots/arrows. This is acceptable for an MVP but should be revisited if analytics show mobile engagement drops.

## Migration Plan

No migration required. The change is purely additive:

1. Create the `HeroCarousel` component directory under `src/components/hero-carousel/`.
2. Add the component to the homepage route (`/_main-layout/index.tsx`) above existing content.
3. Verify no regressions on homepage layout.
4. Rollback: remove the component import and usage from the homepage.

## Open Questions

- What is the exact backend endpoint URL and shape for hero slides? (Assumed: `GET /api/hero-slides` returning `{ slides: HeroSlide[] }`.)
- Should the carousel respect a user preference to reduce motion (`prefers-reduced-motion`)? (Recommended: yes, disable auto-play and transitions when the media query is active.)
