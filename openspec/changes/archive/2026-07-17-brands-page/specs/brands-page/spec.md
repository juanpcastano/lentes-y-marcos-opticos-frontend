## ADDED Requirements

### Requirement: Brands page displays all store brands

The system SHALL render a dedicated brands page on the `/brands` route that lists every brand offered by the store.

#### Scenario: Successful load

- **WHEN** the user navigates to `/brands`
- **THEN** the system fetches all brands from the backend
- **AND** displays a page title "Nuestras Marcas" with a subtitle
- **AND** renders each brand as a card with its background image, name, and tagline

#### Scenario: Loading state

- **WHEN** the brands page mounts and data is still loading
- **THEN** the system SHALL display skeleton placeholders matching the card grid layout

#### Scenario: Empty brands

- **WHEN** the backend returns zero brands
- **THEN** the system SHALL not render the card grid and show an empty state message

### Requirement: Brand cards on the brands page use a structured layout

Each brand card on the brands page SHALL contain a background image URL, a name, and a short tagline.

#### Scenario: Card with image and text

- **WHEN** a brand card is rendered
- **THEN** the system SHALL display the background image covering the entire card
- **AND** overlay the brand name and tagline at the bottom-left of the card
- **AND** apply a gradient scrim to ensure text readability over the image

### Requirement: Brands page layout is responsive

The brands page grid SHALL adapt to mobile, tablet, and desktop viewports.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 1024px or greater
- **THEN** the grid SHALL display two columns of brand cards

#### Scenario: Tablet viewport

- **WHEN** the viewport width is between 768px and 1023px
- **THEN** the grid SHALL display two columns of brand cards

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the grid SHALL display a single column of brand cards
- **AND** each card SHALL maintain its aspect ratio

### Requirement: Brands page cards are accessible

Each brand card on the brands page SHALL be accessible to assistive technologies.

#### Scenario: Card accessibility

- **WHEN** a brand card is rendered
- **THEN** the image SHALL have descriptive alt text
- **AND** the card text SHALL use proper heading hierarchy
- **AND** focusable elements SHALL have visible focus indicators
