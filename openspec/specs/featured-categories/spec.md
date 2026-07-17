# Purpose

TBD — Featured categories section on the homepage.

## Requirements

### Requirement: Featured categories section displays category cards from the backend

The system SHALL render a featured categories section on the homepage that displays one or more category cards fetched from the backend.

#### Scenario: Successful load

- **WHEN** the homepage mounts
- **THEN** the system fetches featured categories from the backend
- **AND** displays a section header with title "Categorías Destacadas", subtitle, and a "Ver todas" link
- **AND** renders each category as a card with its background image, name, and description

#### Scenario: Loading state

- **WHEN** the homepage mounts and categories are still loading
- **THEN** the system SHALL display a skeleton placeholder matching the section layout and card dimensions

#### Scenario: Empty categories

- **WHEN** the backend returns zero categories
- **THEN** the system SHALL not render the featured categories section

### Requirement: Category cards use a structured layout

Each category card SHALL contain a background image URL, a name, and a short description.

#### Scenario: Card with image and text

- **WHEN** a category card is rendered
- **THEN** the system SHALL display the background image covering the entire card
- **AND** overlay the category name and description at the bottom-left of the card
- **AND** apply a gradient scrim to ensure text readability over the image

### Requirement: Section layout is responsive

The featured categories section SHALL adapt its layout to mobile, tablet, and desktop viewports.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 768px or greater
- **THEN** the section SHALL display a 2-column grid with the first card spanning the full left column
- **AND** the remaining cards SHALL stack vertically in the right column

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the section SHALL display all cards in a single vertical column
- **AND** each card SHALL maintain its aspect ratio

### Requirement: Section header contains title, subtitle, and navigation link

The featured categories section SHALL include a header with a title, subtitle, and a link to view all categories.

#### Scenario: Header renders correctly

- **WHEN** the section is visible
- **THEN** the system SHALL render the title "Categorías Destacadas"
- **AND** a subtitle "Seleccionadas cuidadosamente para cada necesidad visual."
- **AND** a "Ver todas >" link aligned to the right of the header
- **AND** the link navigates to `/categories`

### Requirement: Category cards are accessible

Each category card SHALL be accessible to assistive technologies.

#### Scenario: Card accessibility

- **WHEN** a category card is rendered
- **THEN** the image SHALL have descriptive alt text
- **AND** the card text SHALL use proper heading hierarchy
- **AND** focusable elements SHALL have visible focus indicators
