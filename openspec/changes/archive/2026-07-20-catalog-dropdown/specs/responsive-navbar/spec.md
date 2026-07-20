## MODIFIED Requirements

### Requirement: Desktop navigation preserves dropdown behavior

The system SHALL keep the existing desktop NavigationMenu dropdown for the Catálogo item, now populated with the real catalog-dropdown content instead of a placeholder.

#### Scenario: Desktop Catálogo dropdown

- **WHEN** the viewport is 768px or greater
- **THEN** the Catálogo navigation item SHALL continue to display its dropdown content on hover/focus
- **AND** the dropdown SHALL contain the two-column catalog-dropdown layout with featured categories and brands
