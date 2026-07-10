## ADDED Requirements

### Requirement: Exam Offer Banner renders promotional content

The system SHALL render an "Exam Offer Banner" section on the homepage that displays a promotional headline, descriptive text, a call-to-action button, and a promotional image.

#### Scenario: Banner renders with all content

- **WHEN** the homepage mounts
- **THEN** the system SHALL display the headline "Tu Examen de la Vista es 100% Bonificado"
- **AND** the system SHALL display the description "Por la compra de tus cristales graduados, el examen profesional corre por nuestra cuenta. Tecnologia computarizada de ultima generacion."
- **AND** the system SHALL display a call-to-action button with the text "Reservar Mi Turno" and a calendar icon
- **AND** the system SHALL display a promotional image of the optical exam room

### Requirement: Exam Offer Banner uses two-column layout

The Exam Offer Banner SHALL display a two-column layout on desktop with the text content in the left column and the promotional image in the right column.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 768px or greater
- **THEN** the section SHALL display the text content in the left column
- **AND** the section SHALL display the promotional image in the right column
- **AND** both columns SHALL share equal width
- **AND** the left column SHALL use the primary color (`#002b9a`) as its background

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the section SHALL stack the text content above the promotional image
- **AND** the text content SHALL maintain the primary color background
- **AND** the image SHALL maintain its aspect ratio

### Requirement: Exam Offer Banner CTA button is styled for high contrast

The call-to-action button in the Exam Offer Banner SHALL use the secondary color to ensure high contrast against the primary color background.

#### Scenario: CTA button renders with correct styling

- **WHEN** the banner is visible
- **THEN** the CTA button SHALL use the secondary color (`#aaf457`) as its background
- **AND** the button text SHALL use the secondary foreground color (`#0f2000`)

### Requirement: Exam Offer Banner is positioned after Why Choose Us

The Exam Offer Banner SHALL be rendered immediately after the Why Choose Us section on the homepage.

#### Scenario: Homepage section order

- **WHEN** the homepage mounts
- **THEN** the system SHALL render the sections in the following order: HeroCarousel, TopSellers, FeaturedCategories, WhyChooseUs, ExamOfferBanner
