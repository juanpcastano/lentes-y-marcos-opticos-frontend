## Why

The main layout currently references a `Footer` component that does not exist, leaving the bottom of every page empty. A proper footer with enterprise contact information and social media links is essential for credibility, customer trust, and completing the site identity.

## What Changes

- Create a new `Footer` component in `src/components/footer.tsx`
- Wire it into the existing `_main-layout.tsx` route (the import already exists, but the component file is missing)
- Display enterprise data: business name, address, phone, email, and business hours
- Display social media links with icons (Facebook, Instagram, WhatsApp)
- Style the footer to match the existing design system (Tailwind v4, shadcn/radix-luma tokens)
- No breaking changes — the layout already expects a `Footer`; we are filling in the missing implementation.

## Capabilities

### New Capabilities

- `footer-with-socials`: A site-wide footer component that renders enterprise contact details and social media links, included in the main layout.

### Modified Capabilities

- None.

## Impact

- Adds one new component file: `src/components/footer.tsx`
- No API or dependency changes.
- Uses hardcoded in-memory data (no backend) per project conventions.
- Compatible with existing light/dark theme tokens.
