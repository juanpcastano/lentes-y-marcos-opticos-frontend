## ADDED Requirements

### Requirement: Footer renders enterprise contact information

The system SHALL render a footer that displays the enterprise name, physical address, phone number, email, and business hours.

#### Scenario: Footer displays all contact details

- **WHEN** the footer component is rendered inside the main layout
- **THEN** it SHALL display the business name "Lentes Y Marcos Ópticos"
- **AND** it SHALL display the address "Calle Principal 123, Ciudad"
- **AND** it SHALL display the phone number "+1 234 567 8900"
- **AND** it SHALL display the email "contacto@lentesymarcos.com"
- **AND** it SHALL display the business hours "Lun - Vie: 9:00 AM - 6:00 PM"

### Requirement: Footer renders social media links with icons

The system SHALL render clickable social media links for Facebook, Instagram, and WhatsApp, each accompanied by a recognizable icon.

#### Scenario: Social links are visible and accessible

- **WHEN** the footer component is rendered
- **THEN** it SHALL display a Facebook link with a Facebook icon
- **AND** it SHALL display an Instagram link with an Instagram icon
- **AND** it SHALL display a WhatsApp link with a WhatsApp icon
- **AND** each link SHALL have a valid `href` attribute pointing to the respective social profile URL

#### Scenario: Social links open in a new tab

- **WHEN** the user clicks any social media link in the footer
- **THEN** the link SHALL open in a new browser tab
- **AND** it SHALL include `rel="noopener noreferrer"` for security

### Requirement: Footer styling matches the design system

The system SHALL style the footer using Tailwind CSS classes and theme tokens so it is visually consistent with the topbar and supports light and dark themes.

#### Scenario: Footer background matches topbar

- **WHEN** the footer is rendered
- **THEN** its background color SHALL use `bg-sidebar` to match the topbar background

#### Scenario: Footer text uses theme foreground color

- **WHEN** the footer is rendered
- **THEN** all text inside the footer SHALL use `text-sidebar-foreground` or `text-muted-foreground` as appropriate

#### Scenario: Footer is responsive

- **WHEN** the viewport width is less than 768px
- **THEN** the footer content SHALL stack vertically in a single column
- **AND** **WHEN** the viewport width is 768px or greater
- **THEN** the footer content SHALL arrange into at least two columns

### Requirement: Footer is included in the main layout

The system SHALL include the `Footer` component in the `_main-layout.tsx` route so it appears on every page that uses the main layout.

#### Scenario: Footer appears on all main-layout pages

- **WHEN** the user navigates to any route wrapped by `_main-layout.tsx`
- **THEN** the footer SHALL be visible at the bottom of the page
