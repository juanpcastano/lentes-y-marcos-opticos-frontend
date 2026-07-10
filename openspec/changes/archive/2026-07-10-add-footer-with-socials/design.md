## Context

The application uses a TanStack Router file-based layout at `src/routes/_main-layout.tsx` that already imports a `Footer` component from `#/components/footer`, but the component file does not exist. The layout wraps page content with a flex column and places the footer after `<main>`. The design system is Tailwind CSS v4 with shadcn/ui in the `radix-luma` style. Enterprise data is hardcoded in services (no backend). Icons are available via `lucide-react`.

## Goals / Non-Goals

**Goals:**

- Implement the missing `Footer` component so the main layout renders correctly.
- Display enterprise contact information (name, address, phone, email, hours).
- Display social media links (Facebook, Instagram, WhatsApp) with recognizable icons.
- Maintain visual consistency with the existing topbar and theme tokens.
- Support both light and dark themes automatically through existing CSS variables.

**Non-Goals:**

- No new routing or navigation behavior.
- No backend integration or dynamic data fetching.
- No form submission or interactive features beyond external link navigation.
- No changes to the `_main-layout.tsx` import contract (the import path stays `#/components/footer`).

## Decisions

- **Single component file** (`src/components/footer.tsx`) rather than a folder. This keeps the change minimal and aligns with how `Topbar` is organized.
- **Hardcoded enterprise data** inline in the component. There is no backend yet, and the data set is small and stable. If enterprise data grows later, it can be extracted into a service.
- **Use `lucide-react` for generic icons** (Mail, Phone, MapPin, Clock). For social brand icons (Facebook, Instagram, WhatsApp), use simple inline SVGs to avoid adding a new icon library dependency.
- **External links open in a new tab** with `target="_blank" rel="noopener noreferrer"` for security and UX.
- **Responsive two-column layout on desktop, stacked on mobile**: uses Tailwind grid with `grid-cols-1 md:grid-cols-2` to balance contact info and social links.
- **Footer background uses `bg-sidebar`** to visually separate it from the main content, consistent with the topbar styling.

## Risks / Trade-offs

- **Broken import risk**: The layout currently imports a non-existent file. If the filename or export name mismatches, the build will fail. → Mitigation: match the exact import path `#/components/footer` and use a default export named `Footer`.
- **Icon library bloat**: Adding a brand-icon dependency (e.g., `@fortawesome` or `react-icons`) for three icons is overkill. → Mitigation: use inline SVGs for brand logos.
- **Data staleness**: Hardcoded contact details require a code change to update. → Mitigation: keep data consolidated at the top of the component file for easy editing.
