## Context

The project is a React + Vite frontend for an optical store. It uses TanStack Router with file-based routing, TanStack Query for data fetching, and Tailwind CSS with shadcn/ui components. All backend data is currently mocked in-memory via async service functions backed by `localStorage`.

The My Account section already has a layout route (`/_main-layout/_authenticated/myaccount.tsx`) rendering a sidebar with links to Profile, Orders, and Appointments. The checkout page (`/checkout`) is currently a stub. To support a functional checkout, users need a way to manage delivery addresses.

## Goals / Non-Goals

**Goals:**

- Provide an `/myaccount/addresses` page where authenticated users can manage addresses.
- Provide a mock address service with CRUD operations and `localStorage` persistence.
- Integrate the new page into the existing My Account sidebar.
- Follow existing project patterns: services in `src/services/`, query options in `src/query-options/`, routes in `src/routes/`, and hardcoded in-memory data.

**Non-Goals:**

- Real backend integration or API contracts beyond the existing async service pattern.
- Address geocoding, autocomplete, or third-party address validation.
- Checkout page address selection UI (the checkout page itself remains out of scope; only the address management page is built here).
- International addresses beyond a Colombia-oriented form (street, details, label).

## Decisions

### Decision: Address model shape

The address model will include: `id`, `label` (e.g., "Casa", "Oficina"), `street`, `details` (apartment, floor, etc.), and `isDefault` (boolean). City and department are assumed to be Cali and Valle del Cauca respectively. This covers typical Colombian address fields without over-engineering.

**Rationale:** The checkout flow will later need a default address to pre-select. A free-text `label` keeps the UI simple compared to a fixed enum.

### Decision: Service layer mirrors cart service pattern

The address service (`src/services/addresses.ts`) will expose async functions `fetchAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, and `setDefaultAddress`, persisting to `localStorage` under a `MOCK_ADDRESSES_KEY`. The `fetchAddresses` function will return addresses enriched with computed or normalized fields if needed.

**Rationale:** The cart service already demonstrates the canonical pattern for in-memory, `localStorage`-backed services with async signatures. Replicating it minimizes cognitive load and ensures a clean swap path when a real backend is introduced.

### Decision: Query key `["addresses"]`

A single TanStack Query query options factory `createAddressesQueryOptions` will use the key `["addresses"]`. Mutations will invalidate this key.

**Rationale:** This matches the existing `createCartQueryOptions` pattern and gives the UI a single invalidation seam.

### Decision: Form validation with zod

Address forms will use `zod` for schema validation, consistent with other forms in the project (e.g., auth and profile).

**Rationale:** The project already uses `zod` elsewhere. Keeping validation consistent avoids introducing new libraries.

### Decision: Sidebar nav item uses `MapPin` icon

The new sidebar item will use the `MapPin` icon from `lucide-react`, matching the existing icon + label pattern.

**Rationale:** `MapPin` is semantically appropriate for addresses and is already available in the project's `lucide-react` dependency.

## Risks / Trade-offs

- **[Risk] Schema mismatch with future backend** → The address model may need to change when a real backend is introduced. Mitigation: keep the model flat and simple; the service functions are async and return typed data, so only the service bodies will need to change.
- **[Risk] `localStorage` data loss across browsers** → Mock data is device-bound. Mitigation: this is acceptable for the current in-memory-only constraint and will naturally resolve when a backend is added.
- **[Risk] No existing address form component** → A new form will need to be built from shadcn/ui primitives. Mitigation: the project already uses `Input`, `Label`, `Button`, `Card`, and `Dialog`, so composition is straightforward.
