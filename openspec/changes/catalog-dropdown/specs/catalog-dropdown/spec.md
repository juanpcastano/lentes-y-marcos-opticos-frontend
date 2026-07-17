## ADDED Requirements

### Requirement: Dropdown displays featured categories column

The system SHALL render a left column inside the Catálogo dropdown labeled "Categorías Destacadas" containing compact text links for the three featured categories.

#### Scenario: Desktop user hovers Catálogo

- **WHEN** the user hovers or focuses the Catálogo navigation item on desktop
- **THEN** the dropdown SHALL open
- **AND** the left column SHALL display links for "Marcos ópticos", "Gafas de sol", and "Deportivas"

#### Scenario: Clicking a featured category

- **WHEN** the user clicks a featured category link inside the dropdown
- **THEN** the browser SHALL navigate to `/catalog`
- **AND** the `categories` query parameter SHALL contain the selected category name

### Requirement: Dropdown displays featured brands column

The system SHALL render a right column inside the Catálogo dropdown labeled "Marcas Destacadas" containing compact text links for the three featured brands.

#### Scenario: Desktop user hovers Catálogo

- **WHEN** the user hovers or focuses the Catálogo navigation item on desktop
- **THEN** the dropdown SHALL open
- **AND** the right column SHALL display links for "Ray-Ban", "Oakley", and "Persol"

#### Scenario: Clicking a featured brand

- **WHEN** the user clicks a featured brand link inside the dropdown
- **THEN** the browser SHALL navigate to `/catalog`
- **AND** the `brands` query parameter SHALL contain the selected brand name

### Requirement: Dropdown includes view-all links

Each column SHALL include a "Ver todas" link at the bottom that navigates to the corresponding dedicated page.

#### Scenario: Clicking "Ver todas las categorías"

- **WHEN** the user clicks the "Ver todas las categorías" link
- **THEN** the browser SHALL navigate to `/categories`

#### Scenario: Clicking "Ver todas las marcas"

- **WHEN** the user clicks the "Ver todas las marcas" link
- **THEN** the browser SHALL navigate to `/brands`

### Requirement: Dropdown preserves NavigationMenu hover behavior

The dropdown SHALL continue to use the existing Radix NavigationMenu primitives so that open/close behavior, focus management, and animations remain unchanged.

#### Scenario: Mouse leaves dropdown

- **WHEN** the user moves the mouse away from the Catálogo trigger and dropdown content
- **THEN** the dropdown SHALL close after the standard NavigationMenu delay

## MODIFIED Requirements

### Requirement: Desktop navigation preserves dropdown behavior

The system SHALL keep the existing desktop NavigationMenu dropdown for the Catálogo item, now populated with the real catalog-dropdown content instead of a placeholder.

#### Scenario: Desktop Catálogo dropdown

- **WHEN** the viewport is 768px or greater
- **THEN** the Catálogo navigation item SHALL continue to display its dropdown content on hover/focus
- **AND** the dropdown SHALL contain the two-column catalog-dropdown layout with featured categories and brands
