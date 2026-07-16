## Why

The application currently displays products in a catalog grid with no way for users to view detailed product information, see additional images, check stock availability, or understand pricing discounts. A dedicated product detail page is essential to convert browsing into purchasing by giving customers the confidence to add items to their cart.

## What Changes

- Add a new `/product/:id` route with a full product detail page.
- Create a `ProductDetail` type extending the existing product model with `additionalImages`, `stock`, `originalPrice`, `discountedPrice`, and `discountPercentage`.
- Build an image gallery component using a shadcn/ui carousel with zoom-on-hover for the main image and thumbnail navigation.
- Display pricing with strikethrough original price, discounted price, and a discount percentage badge.
- Show real-time stock availability indicator.
- Add an "Add to cart" button (layout only — no cart functionality wired yet).
- Include a related-products section at the bottom of the page.
- Update the existing catalog product card "Ver detalle" button to navigate to the new product detail page.

## Capabilities

### New Capabilities

- `product-detail-page`: Dedicated page for viewing full product details, multi-image gallery, pricing, stock, and related products.

### Modified Capabilities

- _None_ — existing catalog-page requirements do not change; only the product card navigation behavior is updated as an implementation detail.

## Impact

- New route file under `src/routes/_main-layout/`.
- New/updated service and query-options for fetching a single product by ID.
- New components: image gallery, stock indicator, price display, related-products list.
- Updates to `CatalogProduct` type or introduction of a new `ProductDetail` type.
- Minor update to `ProductCard` to link to `/product/$id`.
