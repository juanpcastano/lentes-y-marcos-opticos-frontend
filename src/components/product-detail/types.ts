import type { CatalogProduct } from "#/components/catalog/types"

export interface ProductDetail extends CatalogProduct {
  additionalImages: string[]
  stock: number
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  description: string
}
