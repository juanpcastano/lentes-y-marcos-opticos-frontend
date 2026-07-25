## Why

The application currently has a public-only experience. Login and signup pages exist as UI skeletons, but there is no auth state, no route guards, and no mechanism to protect user-specific actions (cart, orders, appointments). Users need to authenticate before performing protected actions, and the frontend must be architected so a future JWT backend can be dropped in with minimal changes.

## What Changes

- Introduce an auth state layer (context + TanStack Query) that tracks the current user.
- Wire existing `/login` and `/signup` pages to an auth service layer.
- Add route-level authentication guards using TanStack Router `beforeLoad` for all pages under `_authenticated`.
- Add action-level login prompts on public pages: "Añadir al carrito" on product detail and "Confirmar Reserva" on appointments.
- Implement a redirect-after-login flow: the system stores the user's current location, redirects to `/login`, then returns them after successful authentication.
- Support Google OAuth as a backend redirect flow, with a sessionStorage-based redirect recovery mechanism.
- Provide hardcoded mock auth data so the feature is testable without a real backend.

## Capabilities

### New Capabilities

- `user-auth`: Authentication state management, login/logout, Google OAuth redirect recovery, and route/action guards.

### Modified Capabilities

- None.

## Impact

- New files: `src/services/auth.ts`, `src/query-options/auth.ts`, `src/components/auth-provider.tsx`.
- Modified files: `src/routes/__root.tsx`, `src/routes/_authenticated.tsx`, `src/routes/login.tsx`, `src/routes/signup.tsx`, `src/components/login-form.tsx`, `src/components/signup-form.tsx`, `src/components/actions-menu.tsx`, `src/routes/_main-layout/product.$id.tsx`, `src/routes/_main-layout/appointments.tsx`.
- Dependencies: TanStack Router, TanStack Query, Zod (for route search param validation).
