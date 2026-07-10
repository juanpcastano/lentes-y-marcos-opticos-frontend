# Top Sellers

## Purpose

TBD

## Requirements

### Requirement: Top Sellers section renders on the homepage after the hero

The system SHALL render a "Top Sellers" section on the homepage immediately after the hero carousel and before the featured categories section.

#### Scenario: Section ordering

- **WHEN** the homepage (`/_main-layout/`) is rendered
- **THEN** the Top Sellers section appears directly below the hero carousel
- **AND** appears above the featured categories section

### Requirement: Top Sellers displays up to ten best-selling products in a carousel

The system SHALL fetch an ordered list of up to ten best-selling products and display each one as a card inside a horizontally scrollable carousel built on the shadcn/ui `Carousel` primitive.

#### Scenario: Cards rendered from data

- **WHEN** the section mounts and the top sellers query resolves with N products (1 ≤ N ≤ 10)
- **THEN** the carousel renders N product cards
- **AND** the cards appear in the order returned by the service

#### Scenario: Exactly ten products

- **WHEN** the service returns ten products
- **THEN** the carousel renders ten cards
- **AND** the section displays a "Top Sellers" heading

### Requirement: Each product card shows name, brand, and COP price in order

Each product card SHALL display, in order from top to bottom: a product image, the product name (title), the product brand name, and the price formatted as Colombian pesos (COP).

#### Scenario: Card contents and ordering

- **WHEN** a product card is rendered
- **THEN** the image is displayed at the top of the card
- **AND** the product name is rendered as the card title below the image
- **AND** the brand name is rendered immediately after the product name
- **AND** the price is rendered below the brand name, formatted in COP using `es-CO` locale

#### Scenario: COP formatting

- **WHEN** a product has price `199900`
- **THEN** the rendered price is formatted as Colombian pesos via `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" })`
- **AND** the formatted value is not a raw number string

### Requirement: Top Sellers auto-scrolls and pauses on hover

The carousel SHALL automatically advance to the next card at a fixed interval when idle. The auto-scroll SHALL pause while the user hovers the carousel and resume when the pointer leaves. Auto-scroll SHALL also pause when the browser tab is hidden and when the user has `prefers-reduced-motion: reduce` enabled.

#### Scenario: Auto-scroll advances and loops

- **WHEN** the carousel is visible and not paused
- **THEN** after the configured interval the carousel advances to the next card
- **AND** after the last card the carousel loops back to the first card

#### Scenario: Pause on hover

- **WHEN** the user hovers over the carousel
- **THEN** auto-scroll SHALL pause
- **AND** when the pointer leaves the carousel auto-scroll SHALL resume

#### Scenario: Manual navigation does not permanently stop auto-scroll

- **WHEN** the user clicks the previous or next arrow
- **THEN** the carousel moves in the requested direction
- **AND** auto-scroll continues afterwards (the auto-play timer is not permanently disabled by the interaction)

#### Scenario: Pause on tab hidden

- **WHEN** the browser tab becomes hidden
- **THEN** auto-scroll SHALL pause
- **AND** when the tab becomes visible again auto-scroll SHALL resume

#### Scenario: Reduced motion disables auto-scroll

- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** auto-scroll SHALL be disabled
- **AND** the carousel remains manually navigable via arrows and keyboard

#### Scenario: Single product disables auto-scroll

- **WHEN** the service returns exactly one product
- **THEN** the carousel renders that single card
- **AND** auto-scroll SHALL be disabled (no advancement to perform)

### Requirement: Top Sellers exposes loading and empty states

The section SHALL show a skeleton placeholder while fetching and SHALL not render at all when the query resolves to an empty list.

#### Scenario: Loading state

- **WHEN** the homepage mounts and top sellers are still loading
- **THEN** the system SHALL display a skeleton placeholder matching the carousel dimensions and the section heading area

#### Scenario: Empty state

- **WHEN** the top sellers query resolves with zero products
- **THEN** the system SHALL not render the Top Sellers section

### Requirement: Top Sellers data follows the service + query-options pattern

Top sellers data SHALL be provided by an in-memory service in `src/services/top-sellers.ts` returning a Promise of an ordered product list, and consumed via a `queryOptions` wrapper in `src/query-options/top-sellers.ts`.

#### Scenario: Service returns a Promise of products

- **WHEN** `fetchTopSellers()` is called
- **THEN** it returns a `Promise<TopProduct[]>`
- **AND** the returned array contains at most 10 products, each with an image URL, name, brand, and numeric COP price

#### Scenario: Query options wrapper

- **WHEN** the section needs top sellers data
- **THEN** it consumes the data via a `queryOptions` wrapper exported from `src/query-options/top-sellers.ts`
- **AND** the query key includes a stable identifier for the top sellers query
