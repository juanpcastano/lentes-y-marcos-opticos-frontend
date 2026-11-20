import type { CatalogProduct } from "#/components/catalog/types"

export type ProductStatus = "ACTIVE" | "INACTIVE" | "HIDDEN"

export interface ProductDetail extends CatalogProduct {
  sku: string
  available: boolean
  status: ProductStatus
  additionalImages: string[]
  description: string | null
  otherColors: OtherColor[]
}

export interface OtherColor {
  id: string
  color: string | null
  imageUrl: string | null
  available: boolean
}
