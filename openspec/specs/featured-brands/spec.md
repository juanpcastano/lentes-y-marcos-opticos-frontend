# Purpose

TBD

## ADDED Requirements

### Requirement: Featured brands section displays brand cards from the backend

The system SHALL render a featured brands section on the homepage that displays one or more brand cards fetched from the backend.

#### Scenario: Successful load

- **WHEN** the homepage mounts
- **THEN** the system fetches featured brands from the backend
- **AND** displays a section header with title "Marcas Destacadas", subtitle, and a "Ver todas" link
- **AND** renders each brand as a card with its background image, name, and tagline

#### Scenario: Loading state

- **WHEN** the homepage mounts and brands are still loading
- **THEN** the system SHALL display a skeleton placeholder matching the section layout and card dimensions

#### Scenario: Empty brands

- **WHEN** the backend returns zero brands
- **THEN** the system SHALL not render the featured brands section

### Requirement: Brand cards use a structured layout

Each brand card SHALL contain a background image URL, a name, and a short tagline.

#### Scenario: Card with image and text

- **WHEN** a brand card is rendered
- **THEN** the system SHALL display the background image covering the entire card
- **AND** overlay the brand name and tagline at the bottom-left of the card
- **AND** apply a gradient scrim to ensure text readability over the image

### Requirement: Section layout is responsive with right-side dominant card

The featured brands section SHALL adapt its layout to mobile, tablet, and desktop viewports, with the first card occupying the right column on desktop.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 768px or greater
- **THEN** the section SHALL display a 2-column grid with the first card spanning the full right column
- **AND** the remaining cards SHALL stack vertically in the left column

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the section SHALL display all cards in a single vertical column
- **AND** each card SHALL maintain its aspect ratio

### Requirement: Section header contains title, subtitle, and navigation link

The featured brands section SHALL include a header with a title, subtitle, and a link to view all brands.

#### Scenario: Header renders correctly

- **WHEN** the section is visible
- **THEN** the system SHALL render the title "Marcas Destacadas"
- **AND** a subtitle "Las mejores marcas del mercado óptico a tu alcance."
- **AND** a "Ver todas >" link aligned to the right of the header
- **AND** the link navigates to `/brands`

### Requirement: Brand cards are accessible

Each brand card SHALL be accessible to assistive technologies.

#### Scenario: Card accessibility

- **WHEN** a brand card is rendered
- **THEN** the image SHALL have descriptive alt text
- **AND** the card text SHALL use proper heading hierarchy
- **AND** focusable elements SHALL have visible focus indicators
