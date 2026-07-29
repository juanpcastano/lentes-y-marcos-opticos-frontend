## 1. Service layer

- [x] 1.1 Create `src/services/addresses.ts` with `Address` and `AddressInput` interfaces
- [x] 1.2 Implement `fetchAddresses`, `addAddress`, `updateAddress`, `deleteAddress`, and `setDefaultAddress` using `localStorage` under `MOCK_ADDRESSES_KEY`
- [x] 1.3 Seed a default mock address list when `localStorage` has no persisted addresses

## 2. Query options

- [x] 2.1 Create `src/query-options/addresses.ts` exporting `createAddressesQueryOptions` with `queryKey: ["addresses"]` and `queryFn: fetchAddresses`
- [x] 2.2 Export `createAddAddressMutationOptions`, `createUpdateAddressMutationOptions`, `createDeleteAddressMutationOptions`, and `createSetDefaultAddressMutationOptions` that invalidate `["addresses"]` on success

## 3. Address form component

- [x] 3.1 Create `src/components/address-form.tsx` with a zod schema validating: label, composite street (type + 3 numbers), details, and isDefault
- [x] 3.2 Build the form UI using shadcn/ui `Dialog`, `Input`, `Label`, `Button`, and `Checkbox` primitives
- [x] 3.3 Support both "add" and "edit" modes via props, pre-filling values in edit mode

## 4. Addresses page

- [x] 4.1 Create `src/routes/_main-layout/_authenticated/myaccount/addresses.tsx` route file
- [x] 4.2 Implement the page layout with an `<h1>` heading "Direcciones" and an "Agregar dirección" button
- [x] 4.3 Render address cards from `useSuspenseQuery(createAddressesQueryOptions)`, each showing label, street, details, and a "Por defecto" badge when `isDefault` is true
- [x] 4.4 Add "Editar" and "Eliminar" actions on each card; "Eliminar" triggers a confirmation dialog
- [x] 4.5 Implement empty state when the address list is empty

## 5. Sidebar integration

- [x] 5.1 Update `src/routes/_main-layout/_authenticated/myaccount.tsx` to include a fourth nav item: `{ to: "/myaccount/addresses", label: "Direcciones", icon: MapPin }`
- [x] 5.2 Verify active highlighting works for `/myaccount/addresses`

## 6. Build and format

- [x] 6.1 Run `pnpm generate-routes` to regenerate `src/routeTree.gen.ts`
- [x] 6.2 Run `pnpm format` to ensure code style compliance
- [x] 6.3 Run `pnpm check` to verify formatting and lint
- [x] 6.4 Run `pnpm build` to confirm the project compiles without errors
