export interface CatalogProduct {
  id: string
  isActive?: boolean
  imageUrl: string
  name: string
  brand: string
  price: number
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
