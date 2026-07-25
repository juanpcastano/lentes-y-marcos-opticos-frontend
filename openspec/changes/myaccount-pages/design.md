## Context

The project already has three My Account placeholder routes nested under `_main-layout/_authenticated`:

- `/myaccount/profile`
- `/myaccount/orders`
- `/myaccount/appointments`

These routes currently render plain placeholder text with no surrounding account UI. The goal is to introduce a parent layout route that provides a left sidebar navigation panel so users can easily switch between account sections and log out.

The reference design shows a card-style sidebar with four items: **Mi Perfil**, **Historial de Compras**, **Citas Agendadas**, and **Cerrar Sesión**. The active item uses a dark blue background with white text; inactive items are plain text. The logout item is visually separated and styled in red.

## Goals / Non-Goals

**Goals:**

- Create a reusable `myaccount` layout route that wraps all `/myaccount/*` pages.
- Render a left sidebar navigation panel matching the reference design.
- Highlight the currently active route in the sidebar.
- Provide a working logout button that clears the session and redirects to `/`.
- Keep child pages as simple placeholders for now.

**Non-Goals:**

- Building out the actual content of Profile, Orders, or Appointments pages.
- Adding responsive/mobile-specific sidebar behavior (the layout can be a simple flex row).
- Changing any authentication logic beyond what the existing `user-auth` spec already covers.

## Decisions

**1. Use a TanStack Router file-based layout route (`myaccount.tsx`)**

- Placing `myaccount.tsx` directly inside `src/routes/_main-layout/_authenticated/myaccount/` turns it into a parent layout for the sibling `.tsx` files (`profile.tsx`, `orders.tsx`, `appointments.tsx`).
- This is the idiomatic TanStack Router pattern already used by `_authenticated.tsx` and `_main-layout.tsx`.
- Alternative: create a regular React component and import it into each child route — rejected because it duplicates layout code and breaks the outlet pattern.

**2. Sidebar navigation links use TanStack Router `Link` with `activeProps` / `activeOptions`**

- The router can tell us which route is active, eliminating the need for manual path comparison.
- Each `Link` will set `activeOptions={{ exact: false }}` so parent segments remain active.
- Alternative: manual `useLocation` comparison — rejected because `Link` already provides this natively and is less error-prone.

**3. Logout handled via existing `useAuth` / `logout` service + `useNavigate`**

- The existing auth system already exposes a logout mutation that clears `localStorage` and invalidates the `["me"]` query.
- We will reuse that same hook and call `navigate({ to: "/" })` afterward.
- No new auth logic is introduced.

**4. Sidebar styled with Tailwind CSS and shadcn/ui primitives**

- The project uses Tailwind v4 with custom theme tokens in `src/styles.css`.
- The sidebar will be a simple `div` with `rounded-lg`, `border`, and `bg-white` / `bg-card` utilities.
- Active state: `bg-primary` + `text-primary-foreground`; inactive: `text-foreground`; logout: `text-destructive`.
- No new UI components are required beyond standard Tailwind utilities.

## Risks / Trade-offs

- **[Risk] File-based routing rename** → TanStack Router treats a folder sibling `.tsx` file as a layout. Adding `myaccount.tsx` will change the generated route tree. Mitigation: run `pnpm generate-routes` after creation and verify the dev server compiles.
- **[Risk] Active state mismatch for nested routes** → If future child routes are deeply nested (e.g. `/myaccount/orders/123`), the sidebar parent link should still highlight. Mitigation: use `activeOptions={{ exact: false, includeSearch: false }}` on the `Link`.
- **[Trade-off] No mobile sidebar** → On small viewports the sidebar will simply stack above content. This is acceptable for the current scope and can be revisited later.

## Migration Plan

Not applicable — this is a purely additive UI change with no data migration or breaking API changes.
