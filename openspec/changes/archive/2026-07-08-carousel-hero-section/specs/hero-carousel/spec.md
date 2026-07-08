## ADDED Requirements

### Requirement: Hero carousel displays slides from the backend

The system SHALL render a carousel component on the homepage that displays one or more hero slides fetched from the backend.

#### Scenario: Successful load

- **WHEN** the homepage mounts
- **THEN** the system fetches hero slides from the backend
- **AND** displays the first slide with its image, title, description, and action buttons

#### Scenario: Loading state

- **WHEN** the homepage mounts and slides are still loading
- **THEN** the system SHALL display a skeleton placeholder matching the carousel dimensions

#### Scenario: Empty slides

- **WHEN** the backend returns zero slides
- **THEN** the system SHALL not render the carousel section

### Requirement: Each slide contains structured content

Each hero slide SHALL contain a background image URL, a title, a short description, and zero or more action buttons.

#### Scenario: Slide with single action

- **WHEN** a slide has one action button
- **THEN** the system SHALL render the title, description, and one button linking to the specified route

#### Scenario: Slide with multiple actions

- **WHEN** a slide has multiple action buttons
- **WHEN** the system SHALL render the title, description, and all buttons in a horizontal row

#### Scenario: Slide with no actions

- **WHEN** a slide has no action buttons
- **THEN** the system SHALL render only the title and description

### Requirement: Carousel supports auto-play

The carousel SHALL automatically advance to the next slide at a configurable interval.

#### Scenario: Auto-play advances

- **WHEN** the carousel is visible and auto-play is enabled
- **THEN** after the configured interval the next slide becomes active
- **AND** the transition loops to the first slide after the last slide

#### Scenario: Pause on hover

- **WHEN** the user hovers over the carousel
- **THEN** auto-play SHALL pause
- **AND** resume when the mouse leaves the carousel

#### Scenario: Pause on window blur

- **WHEN** the browser tab loses focus
- **THEN** auto-play SHALL pause
- **AND** resume when the tab regains focus

#### Scenario: Reduced motion preference

- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** auto-play SHALL be disabled
- **AND** transitions SHALL be instant instead of animated

### Requirement: Carousel supports manual navigation

The user SHALL be able to navigate between slides manually using previous/next arrows and dot indicators.

#### Scenario: Next arrow

- **WHEN** the user clicks the next arrow
- **THEN** the carousel advances to the next slide
- **AND** auto-play timer resets

#### Scenario: Previous arrow

- **WHEN** the user clicks the previous arrow
- **THEN** the carousel moves to the previous slide
- **AND** auto-play timer resets

#### Scenario: Dot indicator

- **WHEN** the user clicks a dot indicator
- **THEN** the carousel jumps to the corresponding slide
- **AND** auto-play timer resets

### Requirement: Slide transitions are smooth

The system SHALL animate the transition between active and inactive slides.

#### Scenario: Cross-fade transition

- **WHEN** a new slide becomes active
- **THEN** the outgoing slide fades out over 500ms
- **AND** the incoming slide fades in over 500ms

### Requirement: Carousel is responsive

The carousel SHALL adapt its layout and typography to mobile, tablet, and desktop viewports.

#### Scenario: Mobile viewport

- **WHEN** the viewport width is less than 640px
- **THEN** the title and description font sizes decrease
- **AND** action buttons stack vertically
- **AND** navigation arrows are smaller or hidden

#### Scenario: Desktop viewport

- **WHEN** the viewport width is 1024px or greater
- **THEN** the carousel uses full available width
- **AND** navigation arrows are positioned at the left and right edges

### Requirement: Action buttons link to application routes

Each action button SHALL navigate to an internal application route using TanStack Router without a full page reload.

#### Scenario: Internal route navigation

- **WHEN** the user clicks an action button
- **THEN** the application navigates to the specified route
- **AND** the current page does not reload
