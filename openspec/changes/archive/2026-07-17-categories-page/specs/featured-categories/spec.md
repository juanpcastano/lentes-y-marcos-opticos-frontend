## MODIFIED Requirements

### Requirement: Section header contains title, subtitle, and navigation link

The featured categories section SHALL include a header with a title, subtitle, and a link to view all categories.

#### Scenario: Header renders correctly

- **WHEN** the section is visible
- **THEN** the system SHALL render the title "Categorías Destacadas"
- **AND** a subtitle "Seleccionadas cuidadosamente para cada necesidad visual."
- **AND** a "Ver todas >" link aligned to the right of the header
- **AND** the link navigates to `/categories`
