## ADDED Requirements

### Requirement: Why Choose Us section displays value proposition data

The system SHALL render a "Why Choose Us" section on the homepage that displays a section image, title, and three feature items fetched from the backend.

#### Scenario: Successful load

- **WHEN** the homepage mounts
- **THEN** the system fetches the Why Choose Us data from the backend
- **AND** displays a section with a background image on the left
- **AND** renders the section title "Tu Visión, Nuestra Prioridad Técnica"
- **AND** renders three feature items, each with an icon badge, title, and description

#### Scenario: Loading state

- **WHEN** the homepage mounts and Why Choose Us data is still loading
- **THEN** the system SHALL display a skeleton placeholder matching the two-column layout and feature item structure

#### Scenario: Empty data

- **WHEN** the backend returns no Why Choose Us data
- **THEN** the system SHALL not render the Why Choose Us section

### Requirement: Section layout is responsive two-column

The Why Choose Us section SHALL display a two-column layout on desktop and a stacked single-column layout on mobile.

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 768px or greater
- **THEN** the section SHALL display the image in the left column
- **AND** the title and feature items in the right column
- **AND** both columns SHALL share equal width

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 768px
- **THEN** the section SHALL stack the image above the title and feature items
- **AND** the image SHALL maintain its aspect ratio

### Requirement: Feature items use theme-colored icon badges

Each feature item SHALL display an icon inside a colored badge using the project's theme tokens.

#### Scenario: Feature item renders with badge

- **WHEN** a feature item is rendered
- **THEN** the system SHALL display an icon inside a rounded badge
- **AND** the first and third items SHALL use the primary color (`#002b9a`) for the badge background
- **AND** the second item SHALL use the secondary color (`#aaf457`) for the badge background
- **AND** the icon SHALL be white when the badge background is primary
- **AND** the icon SHALL be dark (foreground color) when the badge background is secondary

### Requirement: Section background uses muted color

The Why Choose Us section SHALL use a background color distinct from the main page background.

#### Scenario: Section background renders

- **WHEN** the section is visible
- **THEN** the system SHALL apply the `muted` theme token (`#e5eeff`) as the section background
