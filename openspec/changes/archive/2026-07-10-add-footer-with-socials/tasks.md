## 1. Create the Footer component file

- [x] 1.1 Create `src/components/footer.tsx` with a default-exported `Footer` component
- [x] 1.2 Define hardcoded enterprise data object (name, address, phone, email, hours) at the top of the file
- [x] 1.3 Add inline SVG components for Facebook, Instagram, and WhatsApp icons
- [x] 1.4 Render contact information section with `MapPin`, `Phone`, `Mail`, and `Clock` icons from `lucide-react`
- [x] 1.5 Render social links section with external `href` values, `target="_blank"`, and `rel="noopener noreferrer"`
- [x] 1.6 Apply responsive layout (`grid-cols-1 md:grid-cols-2`) and theme tokens (`bg-sidebar`, `text-sidebar-foreground`, `text-muted-foreground`)

## 2. Verify integration and styling

- [x] 2.1 Confirm `_main-layout.tsx` already imports `Footer` from `#/components/footer` and no import changes are needed
- [x] 2.2 Run `pnpm dev` and visually inspect the footer on a route wrapped by `_main-layout`
- [x] 2.3 Toggle dark mode and confirm footer colors adapt correctly
- [x] 2.4 Run `pnpm check` to verify formatting and lint pass
- [x] 2.5 Shrink the viewport to <768px and confirm content stacks vertically
