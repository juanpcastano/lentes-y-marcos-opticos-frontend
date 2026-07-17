## ADDED Requirements

### Requirement: Category filter section includes a link to view all categories

The catalog page sidebar category filter section SHALL include a link below the category checkbox list that navigates to the categories page.

#### Scenario: Link renders below category filters

- **WHEN** the catalog page sidebar is visible
- **THEN** the system SHALL render the category filter checkboxes
- **AND** render a "Ver todas" link immediately below the last category checkbox
- **AND** the link SHALL navigate to `/categories`
- **AND** the link SHALL open the categories page without a full page reload

#### Scenario: Link is accessible

- **WHEN** the category filter section is visible
- **THEN** the "Ver todas" link SHALL be keyboard-focusable
- **AND** the link text SHALL be descriptive ("Ver todas las categorías")
