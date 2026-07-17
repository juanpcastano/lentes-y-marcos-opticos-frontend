## Why

Users need a dedicated way to browse all available categories before filtering products. Currently, the "Ver todas" link in the featured categories section points to the general catalog, and there is no standalone page to discover the complete category offering. A dedicated categories page improves discoverability and gives each category proper visibility.

## What Changes

- Add a new `/categories` route that renders a dedicated page listing all store categories.
- Update the featured categories section on the homepage so its "Ver todas" link navigates to `/categories` instead of `/catalog`.
- Update the catalog page sidebar filters so a "Ver todas" link appears below the category filter list and navigates to `/categories`.

## Capabilities

### New Capabilities

- `categories-page`: A standalone page that lists all categories offered by the store, accessible from the featured categories section and the catalog filters sidebar.

### Modified Capabilities

- `featured-categories`: Update the "Ver todas >" navigation link in the section header to route to `/categories` instead of `/catalog`.
- `catalog-page`: Add a "Ver todas" link below the category filter section in the sidebar that routes to `/categories`.

## Impact

- New route `/categories` added via TanStack Router file-based routing.
- Existing `featured-categories` component header link target updated.
- Existing catalog sidebar filter component updated to include the new link.
- Hardcoded in-memory category data service created or extended to support fetching all categories.
