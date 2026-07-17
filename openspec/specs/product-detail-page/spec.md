# Product Detail Page

## Purpose

TBD

## Requirements

### Requirement: Product detail route renders product information

The system SHALL display a dedicated product detail page at `/product/:id`.

#### Scenario: User navigates to product page

- **WHEN** the user navigates to `/product/:id` with a valid product identifier
- **THEN** the page renders the product name, brand, description, material, shape, and categories

#### Scenario: Product not found

- **WHEN** the user navigates to `/product/:id` with an identifier that does not exist
- **THEN** the page displays a "Producto no encontrado" message

### Requirement: Image gallery with multiple images

The system SHALL display a main product image and a gallery of additional images.

#### Scenario: Product has multiple images

- **WHEN** the product detail page loads for a product that has `additionalImages`
- **THEN** the main image is shown at full size
- **AND** a thumbnail carousel of additional images is rendered below the main image

#### Scenario: User selects a thumbnail

- **WHEN** the user clicks a thumbnail image in the carousel
- **THEN** the selected image replaces the main image

#### Scenario: Zoom on hover

- **WHEN** the user hovers over the main image on a pointer device
- **THEN** the image scales up to provide a zoomed view within the image container

### Requirement: Pricing and discounts displayed correctly

The system SHALL display product pricing with discount context when applicable.

#### Scenario: Product has a discount

- **WHEN** the product has a `discountPercentage` greater than zero
- **THEN** the original price is shown with a strikethrough style
- **AND** the discounted price is shown prominently in bold
- **AND** a discount percentage badge is visible next to the price

#### Scenario: Product has no discount

- **WHEN** the product has a `discountPercentage` of zero
- **THEN** only the regular price is displayed with no strikethrough or badge

### Requirement: Stock availability indicator

The system SHALL display the product's stock status.

#### Scenario: Product is in stock

- **WHEN** the product `stock` is greater than 5
- **THEN** an "En stock" indicator is shown in a success color

#### Scenario: Product has low stock

- **WHEN** the product `stock` is greater than 0 and less than or equal to 5
- **THEN** a "Pocas unidades" indicator is shown in a warning color

#### Scenario: Product is out of stock

- **WHEN** the product `stock` is equal to 0
- **THEN** an "Agotado" indicator is shown in a destructive color

### Requirement: Add to cart button layout

The system SHALL provide an "Add to cart" button on the product detail page.

#### Scenario: Button is visible

- **WHEN** the product detail page renders
- **THEN** an "Añadir al carrito" button is visible below the price and stock information

#### Scenario: Button does not perform cart action

- **WHEN** the user clicks the "Añadir al carrito" button
- **THEN** no cart state is updated

### Requirement: Related products section

The system SHALL display a related products section at the bottom of the product detail page.

#### Scenario: Related products are shown

- **WHEN** the product detail page loads
- **THEN** a section titled "También te puede interesar" is rendered
- **AND** it displays up to four related product cards

#### Scenario: Related products exclude current product

- **WHEN** the related products are computed
- **THEN** the current product is excluded from the list

### Requirement: Navigation from catalog to product detail

The system SHALL allow users to navigate from the catalog to a product detail page.

#### Scenario: Clicking "Ver detalle" on catalog card

- **WHEN** the user clicks the "Ver detalle" button on a product card in the catalog grid
- **THEN** the application navigates to `/product/:id` for that product
