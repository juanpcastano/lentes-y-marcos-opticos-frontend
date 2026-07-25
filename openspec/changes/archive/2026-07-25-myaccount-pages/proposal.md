## Why

The My Account section currently has three standalone routes (`/myaccount/profile`, `/myaccount/orders`, `/myaccount/appointments`) but lacks a consistent layout and navigation. Users must rely solely on the top navbar dropdown to move between account pages. A dedicated sidebar navigation will improve discoverability and provide a familiar account-dashboard UX pattern.

## What Changes

- Create a new `myaccount` layout route (`src/routes/_main-layout/_authenticated/myaccount.tsx`) that wraps all `/myaccount/*` pages.
- The layout renders a left sidebar navigation panel and an `<Outlet>` for page content on the right.
- Sidebar items: **Mi Perfil**, **Historial de Compras**, **Citas Agendadas**, and **Cerrar Sesión**.
- Active sidebar item is visually highlighted (dark background, white text per the reference design).
- Logout action clears the session and navigates to `/`.
- Existing child routes (`profile`, `orders`, `appointments`) remain as content pages and are nested under the new layout.
- For this phase, the child pages remain placeholders; only the layout and navigation are implemented.

## Capabilities

### New Capabilities

- `myaccount-layout`: Layout route with left sidebar navigation for all authenticated account pages, including active-state highlighting and logout action.

### Modified Capabilities

<!-- No spec-level requirement changes; this is purely UI/layout addition -->

- _(none)_

## Impact

- Affects `src/routes/_main-layout/_authenticated/myaccount/` — new layout file and updated route tree.
- Requires `pnpm generate-routes` (or dev server) to regenerate `routeTree.gen.ts`.
- No API or backend changes; all data is hardcoded/mocked as per existing project constraints.
