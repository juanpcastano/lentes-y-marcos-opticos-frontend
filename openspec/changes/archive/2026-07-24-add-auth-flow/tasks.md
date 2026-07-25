## 1. Auth Infrastructure

- [x] 1.1 Create `src/services/auth.ts` with `fetchMe`, `login`, `logout`, and a `GOOGLE_OAUTH_URL = "/api/auth/google"` constant (all hardcoded/mock)
- [x] 1.2 Create `src/query-options/auth.ts` with a `createMeQueryOptions` function following the existing `queryOptions` pattern
- [x] 1.3 Create `src/components/auth-provider.tsx` with an `AuthContext`, `useAuth` hook, and `AuthProvider` that wraps the app

## 2. Router Context & Route Guards

- [x] 2.1 Wire `queryClient` into the TanStack Router context via `createRouter` in `src/main.tsx`
- [x] 2.2 Update `src/router.tsx` (or `main.tsx`) to type the router context with `queryClient``
- [x] 2.3 Add `beforeLoad` guard to `src/routes/_main-layout/_authenticated.tsx` that checks the `me` query and redirects to `/login` with a `redirect` param when anonymous

## 3. Login & Signup Pages

- [x] 3.1 Add Zod validation for the `/login` route search param `redirect` using `zodSearchValidator` in `src/routes/login.tsx`
- [x] 3.2 Wire `LoginForm` to call `login()` service, invalidate `["me"]` query, and navigate to `redirect` (or `/`) on success
- [x] 3.3 Wire `SignupForm` to call a mock `signup()` service, invalidate `["me"]` query, and navigate on success
- [x] 3.4 Add Google OAuth button logic in `LoginForm` to stash `redirect` in `sessionStorage` and simulate the OAuth flow (mock phase: set mock session flag and reload; future: `window.location.href = "/api/auth/google"`)
- [x] 3.5 Add Google OAuth recovery in `src/main.tsx` on app boot: check `sessionStorage` for `auth_redirect`, navigate there, and clear it
- [x] 3.6 Add a `<` back button to `LoginForm` that navigates to the `redirect` search param (or `/` if absent)

## 4. Action-Level Guards on Public Pages

- [x] 4.1 In `src/routes/_main-layout/product.$id.tsx`, guard "Añadir al carrito" button with `useAuth` — redirect to `/login?redirect=/product/<id>` if anonymous
- [x] 4.2 In `src/routes/_main-layout/appointments.tsx`, guard "Confirmar Reserva" button with `useAuth` — redirect to `/login?redirect=/appointments` if anonymous

## 5. Navigation Updates

- [x] 5.1 In `src/components/actions-menu.tsx`, link the `User` icon to `/myaccount/profile` (already under `_authenticated`)
- [x] 5.2 Ensure the `ShoppingCart` icon link to `/orders` is preserved (already under `_authenticated`)

## 6. Cleanup & Verification

- [x] 6.1 Run `pnpm format` and `pnpm check` to ensure no lint or formatting errors
- [x] 6.2 Verify route guards block `/orders` and `/myaccount/profile` when logged out
- [x] 6.3 Verify "Añadir al carrito" and "Confirmar Reserva" redirect to login with correct `redirect` param
- [x] 6.4 Verify successful login navigates back to the stored redirect URL
- [x] 6.5 Verify Google OAuth sessionStorage stash and recovery flow
