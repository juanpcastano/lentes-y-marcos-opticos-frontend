## MODIFIED Requirements

### Requirement: Section header contains title, subtitle, and navigation link

The featured brands section SHALL include a header with a title, subtitle, and a link to view all brands.

#### Scenario: Header renders correctly

- **WHEN** the section is visible
- **THEN** the system SHALL render the title "Marcas Destacadas"
- **AND** a subtitle "Las mejores marcas del mercado óptico a tu alcance."
- **AND** a "Ver todas >" link aligned to the right of the header
- **AND** the link navigates to `/brands`
