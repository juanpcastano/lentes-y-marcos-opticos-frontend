## ADDED Requirements

### Requirement: Brand filter section includes a link to view all brands

The catalog page sidebar brand filter section SHALL include a link below the brand checkbox list that navigates to the brands page.

#### Scenario: Link renders below brand filters

- **WHEN** the catalog page sidebar is visible
- **THEN** the system SHALL render the brand filter checkboxes
- **AND** render a "Ver todas" link immediately below the last brand checkbox
- **AND** the link SHALL navigate to `/brands`
- **AND** the link SHALL open the brands page without a full page reload

#### Scenario: Link is accessible

- **WHEN** the brand filter section is visible
- **THEN** the "Ver todas" link SHALL be keyboard-focusable
- **AND** the link text SHALL be descriptive ("Ver todas las marcas")
