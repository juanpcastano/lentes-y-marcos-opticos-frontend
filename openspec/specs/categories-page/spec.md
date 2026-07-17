## ADDED Requirements

### Requirement: Categories page displays all store categories

The system SHALL render a dedicated categories page on the `/categories` route that lists every category offered by the store.

#### Scenario: Successful load

- **WHEN** the user navigates to `/categories`
- **THEN** the system fetches all categories from the backend
- **AND** displays a page title "Nuestras Categorías" with a subtitle
- **AND** renders each category as a card with its background image, name, and description

#### Scenario: Loading state

- **WHEN** the categories page mounts and data is still loading
- **THEN** the system SHALL display skeleton placeholders matching the card grid layout

#### Scenario: Empty categories

- **WHEN** the backend returns zero categories
- **THEN** the system SHALL not render the card grid and show an empty state message

### Requirement: Category cards on the categories page use a structured layout

Each category card on the categories page SHALL contain a background image URL, a name, and a short description.

#### Scenario: Card with image and text

- **WHEN** a category card is rendered
- **THEN** the system SHALL display the background image covering the entire card
- **AND** overlay the category name and description at the bottom-left of the card
- **AND** apply a gradient scrim to ensure text readability over the image

### Requirement: Categories page layout is responsive

The categories page grid SHALL adapt to mobile, tablet, and desktop viewports.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 1024px or greater
- **THEN** the grid SHALL display two columns of category cards

#### Scenario: Tablet viewport

- **WHEN** the viewport width is between 768px and 1023px
- **THEN** the grid SHALL display two columns of category cards

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the grid SHALL display a single column of category cards
- **AND** each card SHALL maintain its aspect ratio

### Requirement: Categories page cards are accessible

Each category card on the categories page SHALL be accessible to assistive technologies.

#### Scenario: Card accessibility

- **WHEN** a category card is rendered
- **THEN** the image SHALL have descriptive alt text
- **AND** the card text SHALL use proper heading hierarchy
- **AND** focusable elements SHALL have visible focus indicators
