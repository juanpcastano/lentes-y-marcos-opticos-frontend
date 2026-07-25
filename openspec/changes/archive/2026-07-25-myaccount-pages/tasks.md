## 1. Layout Route

- [x] 1.1 Create `src/routes/_main-layout/_authenticated/myaccount.tsx` layout route component
- [x] 1.2 The layout renders a flex container with sidebar on the left and `<Outlet />` on the right
- [x] 1.3 Run `pnpm generate-routes` to regenerate `routeTree.gen.ts` and verify compilation

## 2. Sidebar Navigation

- [x] 2.1 Add sidebar card container with rounded corners, border, and background styling
- [x] 2.2 Add "Mi Perfil" link with `UserCircle` icon routing to `/myaccount/profile`
- [x] 2.3 Add "Historial de Compras" link with `ShoppingBag` icon routing to `/myaccount/orders`
- [x] 2.4 Add "Citas Agendadas" link with `Calendar` icon routing to `/myaccount/appointments`
- [x] 2.5 Add visual separator between navigation items and logout section
- [x] 2.6 Add "Cerrar Sesión" button with `LogOut` icon styled in red
- [x] 2.7 Ensure all items have appropriate padding, hover states, and touch targets

## 3. Active State & Interactions

- [x] 3.1 Use TanStack Router `Link` with `activeOptions` so the active route item gets highlighted
- [x] 3.2 Active styling: dark background (`bg-primary`) with white text (`text-primary-foreground`)
- [x] 3.3 Inactive styling: neutral text (`text-foreground`)
- [x] 3.4 Wire up logout button to call the existing logout service + `navigate({ to: "/" })`

## 4. Verification

- [x] 4.1 Start dev server and verify sidebar renders on `/myaccount/profile`, `/myaccount/orders`, and `/myaccount/appointments`
- [x] 4.2 Verify active item highlighting changes when navigating between sidebar links
- [x] 4.3 Verify logout clears session and redirects to `/`
- [x] 4.4 Run `pnpm check` and `pnpm lint` to ensure formatting and lint pass
