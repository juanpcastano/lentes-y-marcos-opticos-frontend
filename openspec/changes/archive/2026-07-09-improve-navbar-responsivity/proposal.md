## Why

The current navbar (topbar, navigation menu, and actions menu) lacks responsive behavior, causing layout breakage and poor usability on mobile and tablet viewports. As this is an e-commerce storefront, a significant portion of users will browse on smaller devices, making responsive navigation critical for conversion and user experience.

## What Changes

- **Responsive topbar layout**: Adapt the topbar to use a hamburger menu on mobile, a condensed layout on tablet, and the full layout on desktop.
- **Mobile navigation drawer**: Implement a slide-out drawer (using shadcn/ui Sheet) that contains navigation links and actions on viewports below `md` (768px).
- **Collapsible actions menu**: On mobile, hide the search input and mode toggle inside the drawer; keep only essential icons (cart, user) visible in the header or move them into the drawer.
- **Navigation menu adaptation**: Replace the desktop `NavigationMenu` dropdown with a simple stacked link list inside the mobile drawer. Preserve active link highlighting.
- **Touch-friendly sizing**: Ensure tap targets inside the mobile drawer meet at least 44×44px.

## Capabilities

### New Capabilities

- `responsive-navbar`: Responsive behavior for the main application navbar, including mobile drawer, adaptive topbar layout, and collapsible actions.

### Modified Capabilities

- _(none — no existing navbar spec; this is purely a UI/UX improvement without changing business requirements of other capabilities)_

## Impact

- `src/components/topbar.tsx` — layout and responsive breakpoints
- `src/components/nav-menu.tsx` — mobile drawer integration and conditional rendering
- `src/components/actions-menu.tsx` — mobile collapsible behavior
- New component: `src/components/mobile-nav-drawer.tsx` (or similar)
- Tailwind CSS responsive utility classes
- No API or route changes
