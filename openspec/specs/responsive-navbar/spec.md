## ADDED Requirements

### Requirement: Navbar adapts layout to viewport size

The system SHALL render a responsive topbar that displays a full navigation menu on desktop and a condensed header with a hamburger toggle on mobile.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 768px or greater
- **THEN** the topbar SHALL display the logo, full navigation menu, and actions menu inline
- **AND** the hamburger toggle SHALL be hidden

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the topbar SHALL display the logo and a hamburger menu toggle
- **AND** the full navigation menu and actions menu SHALL be hidden from the header

### Requirement: Mobile navigation drawer contains all navigation links

The system SHALL provide a slide-out drawer that contains all primary navigation links when the mobile hamburger toggle is activated.

#### Scenario: Opening the drawer

- **WHEN** the user taps the hamburger toggle on a mobile viewport
- **THEN** a slide-out drawer SHALL appear from the left
- **AND** the drawer SHALL contain links for Inicio, Catálogo, and Agendar Cita

#### Scenario: Closing the drawer via backdrop

- **WHEN** the user taps outside the open drawer
- **THEN** the drawer SHALL close

#### Scenario: Closing the drawer via escape key

- **WHEN** the user presses the Escape key while the drawer is open
- **THEN** the drawer SHALL close

#### Scenario: Active link highlighting in drawer

- **WHEN** the current route matches a link inside the drawer
- **THEN** that link SHALL receive the same active styling as the desktop menu (underline and bold)

### Requirement: Mobile drawer contains action items

The system SHALL include action items inside the mobile drawer so users can search, toggle theme, access account, and view cart without returning to the desktop layout.

#### Scenario: Drawer shows search input

- **WHEN** the mobile drawer is open
- **THEN** the drawer SHALL display a search input with a search button

#### Scenario: Drawer shows theme toggle

- **WHEN** the mobile drawer is open
- **THEN** the drawer SHALL display the dark/light mode toggle

#### Scenario: Drawer shows account and cart icons

- **WHEN** the mobile drawer is open
- **THEN** the drawer SHALL display user account and shopping cart icon buttons
- **AND** tapping the cart icon SHALL navigate to the /orders route

### Requirement: Desktop navigation preserves dropdown behavior

The system SHALL keep the existing desktop NavigationMenu dropdown for the Catálogo item unchanged.

#### Scenario: Desktop Catálogo dropdown

- **WHEN** the viewport is 768px or greater
- **THEN** the Catálogo navigation item SHALL continue to display its dropdown content on hover/focus
- **AND** the dropdown SHALL contain the existing placeholder link

### Requirement: Touch targets meet accessibility minimums

All interactive elements inside the mobile drawer SHALL have a minimum touch target size of 44×44px.

#### Scenario: Drawer link tap targets

- **WHEN** the mobile drawer is rendered
- **THEN** every navigation link and action button inside the drawer SHALL have a rendered height and width of at least 44px

### Requirement: Mobile drawer uses accessible markup

The mobile drawer SHALL use the shadcn/ui Sheet component (built on Radix Dialog) so it inherits focus trapping, ARIA roles, and keyboard support.

#### Scenario: Focus trapping

- **WHEN** the drawer is open
- **THEN** keyboard focus SHALL be trapped inside the drawer
- **AND** the focus SHALL return to the hamburger toggle when the drawer closes
