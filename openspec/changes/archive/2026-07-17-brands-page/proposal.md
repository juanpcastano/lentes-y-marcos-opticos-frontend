## Why

Users need a dedicated way to browse all available brands before filtering products. Currently, the "Ver todas" link in the featured brands section points to the general catalog, and there is no standalone page to discover the complete brand offering. A dedicated brands page improves discoverability and gives each brand proper visibility.

## What Changes

- Add a new `/brands` route that renders a dedicated page listing all store brands.
- Update the featured brands section on the homepage so its "Ver todas" link navigates to `/brands` instead of `/catalog`.
- Update the catalog page sidebar filters so a "Ver todas" link appears below the brand filter list and navigates to `/brands`.

## Capabilities

### New Capabilities

- `brands-page`: A standalone page that lists all brands offered by the store, accessible from the featured brands section and the catalog filters sidebar.

### Modified Capabilities

- `featured-brands`: Update the "Ver todas >" navigation link in the section header to route to `/brands` instead of `/catalog`.
- `catalog-page`: Add a "Ver todas" link below the brand filter section in the sidebar that routes to `/brands`.

## Impact

- New route `/brands` added via TanStack Router file-based routing.
- Existing `featured-brands` component header link target updated.
- Existing catalog sidebar filter component updated to include the new link.
- Hardcoded in-memory brand data service created or extended to support fetching all brands.
