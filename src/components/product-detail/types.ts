import type { CatalogProduct } from "#/components/catalog/types"

export interface ProductDetail extends CatalogProduct {
  additionalImages: string[]
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  description: string
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  variantName: string
  variantValue: string
  sku: string
  priceAdjustment: number
  imageUrl: string | null
}
