## Why

Users currently have no way to manage shipping addresses in their account. This is a prerequisite for a functional checkout flow, since the checkout page needs a saved address to complete a purchase. Adding an addresses management page under My Account lets users create, view, edit, and delete addresses so they can be selected later during checkout.

## What Changes

- Add a **Direcciones** page at `/myaccount/addresses` inside the existing My Account layout.
- Add an in-memory address service (`src/services/addresses.ts`) with hardcoded mock data persisted to `localStorage`, exposing `fetchAddresses`, `addAddress`, `updateAddress`, and `deleteAddress`.
- Add TanStack Query query options for addresses (`["addresses"]` query key).
- Extend the My Account sidebar to include a navigation link for **Direcciones** with active-state highlighting.
- Update the `myaccount-layout` spec to document the new sidebar item.
- Create a new `myaccount-addresses` spec covering CRUD operations, default-address handling, and form validation.

## Capabilities

### New Capabilities

- `myaccount-addresses`: Authenticated users can view a list of saved addresses, add new addresses, edit existing ones, delete addresses, and mark one address as the default for checkout.

### Modified Capabilities

- `myaccount-layout`: The sidebar navigation requirements are changing to include a fourth link, **Direcciones**, routing to `/myaccount/addresses`, with the same active-state highlighting rules as the existing links.

## Impact

- New route file: `src/routes/_main-layout/_authenticated/myaccount/addresses.tsx`
- New service: `src/services/addresses.ts`
- New query options: `src/query-options/addresses.ts`
- Updated route: `src/routes/_main-layout/_authenticated/myaccount.tsx` (sidebar nav items)
- Updated spec: `openspec/specs/myaccount-layout/spec.md`
- New spec: `openspec/specs/myaccount-addresses/spec.md`
- No breaking changes to existing APIs or routes.
