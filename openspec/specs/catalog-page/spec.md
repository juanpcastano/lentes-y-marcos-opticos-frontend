## ADDED Requirements

### Requirement: Product grid display

The system SHALL display a grid of product cards on the `/catalog` route.

#### Scenario: Catalog page loads

- **WHEN** the user navigates to `/catalog`
- **THEN** the page renders a grid of product cards with image, brand name, product name, formatted price, and a "Ver detalle" button

#### Scenario: Product badges visible

- **WHEN** a product has a badge of type `NUEVO` or `OFERTA`
- **THEN** the badge text is displayed on the product card image area

### Requirement: Sidebar filters

The system SHALL provide a left sidebar with filters for brand, price range, material, shape, and categories.

#### Scenario: Filter by brand

- **WHEN** the user checks one or more brand checkboxes
- **THEN** only products whose brand is in the selected set are shown in the grid

#### Scenario: Filter by price range

- **WHEN** the user adjusts the price range slider
- **THEN** only products whose price falls within the selected range are shown

#### Scenario: Filter by material

- **WHEN** the user checks one or more material checkboxes
- **THEN** only products whose material is in the selected set are shown

#### Scenario: Filter by shape

- **WHEN** the user selects one or more shape options
- **THEN** only products whose shape is in the selected set are shown

#### Scenario: Filter by categories

- **WHEN** the user checks one or more category checkboxes
- **THEN** only products that have at least one of the selected categories are shown in the grid

#### Scenario: Combined filters

- **WHEN** the user applies multiple active filters simultaneously
- **THEN** the grid shows only products that satisfy ALL active filter criteria

### Requirement: Sorting

The system SHALL provide a sort dropdown to reorder the product grid.

#### Scenario: Sort by relevance

- **WHEN** the user selects "Relevancia"
- **THEN** products are displayed in their default order

#### Scenario: Sort by price ascending

- **WHEN** the user selects "Precio: menor a mayor"
- **THEN** products are ordered from lowest to highest price

#### Scenario: Sort by price descending

- **WHEN** the user selects "Precio: mayor a menor"
- **THEN** products are ordered from highest to lowest price

### Requirement: Results count

The system SHALL display the current results count.

#### Scenario: Count updates with filters

- **WHEN** filters or sorting change
- **THEN** a label reads "Mostrando X de Y resultados" where X is the visible count and Y is the total product count

### Requirement: URL query param synchronization

The system SHALL synchronize active filters and sort selection with URL query parameters.

#### Scenario: Filters update URL

- **WHEN** the user changes any filter or sort selection
- **THEN** the URL query params update to reflect the current state without a full page reload

#### Scenario: URL restores filters

- **WHEN** the user loads `/catalog` with existing filter query params
- **THEN** the sidebar filters and sort dropdown reflect the URL state and the grid is filtered accordingly

#### Scenario: Shareable filtered URL

- **WHEN** a user shares a URL containing filter query params
- **THEN** another user opening that URL sees the same filtered results

### Requirement: Clear all filters

The system SHALL provide a button to clear all active filters at once.

#### Scenario: User clears all filters

- **WHEN** the user clicks the "Limpiar filtros" button
- **THEN** all active brand, material, shape, category, and price filters are reset to their default values
- **AND** the URL query params are updated to reflect the cleared state
- **AND** the product grid shows all products
