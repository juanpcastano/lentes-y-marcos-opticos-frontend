import type { CatalogProduct } from "#/components/catalog/types"

export interface ProductDetail extends CatalogProduct {
  additionalImages: string[]
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  description: string
  variants: ProductVariant[]
  isActive: boolean
}

export interface ProductVariant {
  id: string | null
  variantName: string | null
  sku: string | null
  imageUrl: string | null
  isActive: boolean | null
}
