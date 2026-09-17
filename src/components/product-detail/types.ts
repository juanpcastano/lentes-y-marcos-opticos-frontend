import type { CatalogProduct } from "#/components/catalog/types"

export interface ProductDetail extends CatalogProduct {
  variantId: string
  additionalImages: string[]
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  description: string
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
}

export interface ProductVariant {
  id: string | null
  color: string | null
  sku: string | null
  price: number | null
  discountPercentage: number | null
  discountedPrice: number | null
  isActive: boolean | null
}
