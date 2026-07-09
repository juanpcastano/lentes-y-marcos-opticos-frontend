## Context

The application navbar is composed of three components in `src/components/`:

- `topbar.tsx` — flex row holding logo, `NavMenu`, and `ActionsMenu`
- `nav-menu.tsx` — desktop `NavigationMenu` from shadcn/ui with links to Inicio, Catálogo (dropdown), and Agendar Cita
- `actions-menu.tsx` — search input + mode toggle + user + cart icons

There is no responsive handling today. On narrow viewports the topbar overflows horizontally and navigation becomes unusable. The project uses Tailwind CSS v4 (utility-based, no `tailwind.config.js`), shadcn/ui (`radix-luma` style), and TanStack Router.

## Goals / Non-Goals

**Goals:**

- Make the navbar usable and visually correct on mobile (< 768px), tablet (768–1023px), and desktop (≥ 1024px).
- Provide a slide-out mobile navigation drawer that contains both nav links and action items.
- Preserve the existing desktop dropdown navigation experience.
- Keep active-route highlighting in both desktop and mobile modes.

**Non-Goals:**

- Redesigning the visual style, colors, or typography of the navbar.
- Adding new pages or changing the navigation information architecture.
- Implementing real search functionality or backend-driven menus.
- Changing the existing hero-carousel or featured-categories specs.

## Decisions

1. **Mobile drawer via shadcn/ui Sheet**
   - _Rationale:_ Sheet is already part of the shadcn/ui component library (or can be added with `npx shadcn add sheet`). It provides accessible focus trapping, keyboard escape, and animation out of the box, matching the existing design system.
   - _Alternative considered:_ Custom CSS drawer — rejected because it would duplicate accessibility logic already solved by Radix primitives.

2. **Breakpoint at `md` (768px) for the mobile ↔ desktop switch**
   - _Rationale:_ Tailwind’s default `md` breakpoint is the industry-standard tablet boundary. The current navigation items fit comfortably at ≥ 768px.
   - _Alternative considered:_ Custom `sm` (640px) — rejected because tablets in landscape already show enough width for the full nav.

3. **ActionsMenu collapses into the drawer on mobile; only cart icon stays in the header**
   - _Rationale:_ Cart is the highest-priority e-commerce action and should remain one-tap accessible. Search input, mode toggle, and user icon move into the drawer to save horizontal space.
   - _Alternative considered:_ Keep all icons visible with smaller sizing — rejected because tap targets would fall below 44×44px and the header would still feel cramped.

4. **NavMenu renders a flat `<ul>` list inside the drawer instead of the `NavigationMenu` dropdown**
   - _Rationale:_ Dropdown hover/fly-out patterns do not translate well to touch. A simple stacked list with the same links is more usable on mobile.
   - _Alternative considered:_ Keep `NavigationMenu` inside the drawer — rejected because Radix `NavigationMenu` is designed for hover/keyboard desktop interaction and behaves poorly in a confined mobile container.

5. **Use Tailwind responsive utilities (`hidden md:flex`, `md:hidden`) rather than JS-based breakpoint detection**
   - _Rationale:_ Simpler, no extra state or re-render cost. The DOM contains both mobile and desktop markup, which is acceptable for a small header.
   - _Alternative considered:_ `useMediaQuery` hook — rejected as overkill for a toggle between two static layouts.

## Risks / Trade-offs

- **[Risk]** Duplicate link markup (one for mobile drawer, one for desktop menu) could drift if routes change.
  → _Mitigation:_ Extract the navigation link definitions into a shared constant array in `nav-menu.tsx` so both render paths consume the same data.

- **[Trade-off]** Hiding the search input on mobile reduces discoverability.
  → _Mitigation:_ Place a prominent "Buscar" row at the top of the mobile drawer with the same input and button.

- **[Trade-off]** The logo text is long (`LENTES Y MARCOS ÓPTICOS`) and may still wrap on very small screens.
  → _Mitigation:_ Reduce logo text font size on `sm` screens (`text-sm`) and allow the image to shrink slightly.
