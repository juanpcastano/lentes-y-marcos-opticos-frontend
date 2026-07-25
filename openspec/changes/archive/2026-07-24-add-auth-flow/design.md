## Context

The frontend currently has UI-only login/signup pages with no auth state management. Protected routes (`_authenticated` layout) exist but have no enforcement. The application uses TanStack Router with file-based routing and TanStack Query for data fetching. The project follows a pattern where `src/services/` holds raw fetch functions and `src/query-options/` exports `queryOptions` wrappers. All data returned by services must currently be hardcoded in-memory.

The future backend will use JWT delivered via `httpOnly` cookies. The frontend needs to be prepared for this contract now while remaining fully functional with mock data.

## Goals / Non-Goals

**Goals:**

- Establish a frontend auth layer that works today with hardcoded data and swaps to a real backend with minimal changes.
- Protect routes under `_authenticated` at the router level using `beforeLoad`.
- Guard specific actions on public pages (add to cart, confirm appointment) by redirecting to login with a return URL.
- Support Google OAuth via backend redirect with a sessionStorage redirect-recovery mechanism.
- Maintain the existing TanStack Query + service pattern.

**Non-Goals:**

- No real backend integration yet. All auth endpoints are mocked.
- No popup-based or sheet-based contextual login. Redirect-only flow.
- No guest cart or cart merge logic. Anonymous users cannot add to cart.
- No refresh token handling (backend will use `httpOnly` cookies, so refresh is transparent).

## Decisions

### 1. Login form back button

**Rationale:** The login page shall include a `<` icon in the top-left that navigates back to the `redirect` search param (or `/` if none is present). This gives users an explicit escape hatch and satisfies the spec requirement that canceling login returns the user to their original page.

### 2. Cookie-based JWT (not Bearer token in localStorage)

**Rationale:** The backend will set an `httpOnly` cookie. The frontend never touches the token, avoiding XSS exposure and complex token refresh logic. All `fetch` calls use `credentials: "include"`.
**Alternative considered:** Store JWT in `localStorage` and inject `Authorization: Bearer` headers. Rejected because it increases XSS surface and complicates Google OAuth redirect recovery.

### 2. Route-level guards via `beforeLoad`

**Rationale:** TanStack Router supports `beforeLoad` on route definitions. This blocks navigation to protected routes until auth state resolves, avoiding UI flashes. We pass `queryClient` into the router context so `beforeLoad` can read the cached user or fetch it synchronously.
**Alternative considered:** Component-level `useEffect` guards in `_authenticated.tsx`. Rejected because it allows a render flash before redirect and is less idiomatic for TanStack Router.

### 3. Redirect-based contextual login (no sheet/modal)

**Rationale:** When a user triggers a protected action on a public page (e.g., "Añadir al carrito"), the app navigates to `/login?redirect=/product/123`. After login, the app redirects back. This is simple, works with Google OAuth, and requires no promise-based auth prompt system.
**Alternative considered:** Sliding sheet overlay with promise-based login prompt. Rejected because Google OAuth inside a sheet is awkward without a popup SDK, and the redirect flow is more maintainable.

### 4. SessionStorage for Google OAuth redirect recovery

**Rationale:** Google OAuth is a full-page redirect to the backend. Before leaving, the frontend stores the intended redirect URL in `sessionStorage`. When the app boots after the OAuth callback, it checks `sessionStorage` and navigates there. This keeps the backend agnostic of frontend routing state.
**Alternative considered:** Pass `redirect_to` as a query param to the backend. Rejected because it couples backend to frontend URL structure; the frontend can manage its own recovery.

### 5. Mock user model: `{ id, name, email }`

**Rationale:** This is the minimal set needed for an e-commerce frontend (display name, identity). No roles or permissions yet.

### 6. Mock Google OAuth behavior

**Rationale:** There is no backend yet to handle the real Google OAuth redirect flow. In the mock phase, clicking the Google button will simulate the full flow by setting the mock session flag in `localStorage`, stashing the redirect in `sessionStorage`, and reloading the app. On boot, the app detects the sessionStorage redirect and navigates there. This tests the recovery mechanism without a real backend. When the backend is ready, this mock logic is replaced by a real `window.location.href = "/api/auth/google"` call.
**Alternative considered:** Hide the Google button entirely in mock mode. Rejected because testing the sessionStorage redirect recovery is valuable for the overall flow.

## Risks / Trade-offs

- **[Risk]** `beforeLoad` guards may cause a waterfall if every protected route independently checks auth.  
  **Mitigation:** The auth query uses a stable query key `["me"]`. TanStack Query deduplicates across the tree, so only one request fires.

- **[Risk]** Mock auth data means no real session validation. A page refresh always "logs out" the mock user unless we persist something in `localStorage`.  
  **Mitigation:** For the mock phase, persist a mock session flag in `localStorage` so devs can test the logged-in state across refreshes. This flag is removed when the real backend is wired in.

- **[Risk]** The `beforeLoad` guard depends on `queryClient` being available in the router context. If the context is misconfigured, guards silently fail or throw.  
  **Mitigation:** Type-safe router registration ensures the context shape is enforced at compile time.

- **[Trade-off]** Redirect-based login is less seamless than an in-place sheet. The user loses scroll position and modal context. Accepted because the complexity savings outweigh the UX cost for an e-commerce flow.

## Migration Plan

Not applicable for a new feature. Deployment is straightforward: merge the branch and the auth layer becomes active. No rollback-specific steps needed.

## Open Questions

- Should the login page show a "continue as guest" or "skip login" option for the cart flow? (Not in scope for now.)
- Backend OAuth initiation URL: **`/api/auth/google`** (agreed contract with future backend). The callback URL is backend-managed and invisible to the frontend.
