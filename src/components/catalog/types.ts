export interface CatalogProduct {
  variantId: string
  productId: string
  imageUrl: string
  name: string
  color: string
  brand: string
  price: number
  originalPrice: number
  discountPercentage: number
  material: string
  shape: string
  categories: string[]
  badge?: "NUEVO" | "OFERTA" | null
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCop(value: number): string {
  return copFormatter.format(value)
}
