## 1. Setup

- [x] 1.1 Add `sheet` component via shadcn/ui (`npx shadcn add sheet`) if it does not already exist in `src/components/ui/`
- [x] 1.2 Verify the project builds (`pnpm build`) before making changes

## 2. Refactor Navigation Data

- [x] 2.1 Extract navigation link definitions (Inicio, Catálogo, Agendar Cita) into a shared constant array in `src/components/nav-menu.tsx`
- [x] 2.2 Ensure the constant includes route paths, labels, and a flag indicating which item has children/dropdown

## 3. Create Mobile Navigation Drawer

- [x] 3.1 Create `src/components/mobile-nav-drawer.tsx` using the shadcn/ui `Sheet` primitive
- [x] 3.2 Render the shared navigation links as a flat stacked `<ul>` list inside the sheet
- [x] 3.3 Apply active-route highlighting (underline + bold) using TanStack Router's `activeProps` on each link
- [x] 3.4 Ensure all list items and buttons inside the drawer have a minimum rendered size of 44×44px
- [x] 3.5 Add a hamburger trigger button (Menu icon from `lucide-react`) that opens the sheet

## 4. Update ActionsMenu for Responsiveness

- [x] 4.1 Hide the search input, mode toggle, user button, and cart button from the header on viewports below `md`
- [x] 4.2 Keep the cart icon visible in the mobile header (or move it into the drawer per design decision)
- [x] 4.3 Create a mobile-only actions section inside `MobileNavDrawer` containing the search input, mode toggle, user button, and cart button
- [x] 4.4 Ensure the cart button inside the drawer links to `/orders`

## 5. Update Topbar Layout

- [x] 5.1 Add responsive Tailwind classes to `topbar.tsx`:
  - Show logo + `NavMenu` + `ActionsMenu` on `md:` and up
  - Show logo + hamburger toggle (+ optional cart icon) below `md`
- [x] 5.2 Adjust logo image and text sizing for small screens (`sm:text-sm`, shrink image if needed)
- [x] 5.3 Import and place `MobileNavDrawer` in the topbar's mobile layout

## 6. Desktop Navigation Preservation

- [x] 6.1 Verify that on `md:` and up, `NavMenu` still uses the existing `NavigationMenu` with the Catálogo dropdown
- [x] 6.2 Confirm the dropdown content and hover/focus behavior remain unchanged

## 7. Verification

- [x] 7.1 Run `pnpm format` and `pnpm check` to ensure code style compliance
- [x] 7.2 Run `pnpm build` to confirm no TypeScript or lint errors
- [x] 7.3 Manually test responsive behavior in browser DevTools at 375px, 768px, and 1440px viewports
- [x] 7.4 Confirm focus trapping and Escape-to-close work in the mobile drawer
