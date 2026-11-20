export interface CatalogProduct {
  id: string
  imageUrl: string | null
  name: string
  color: string | null
  brand: string | null
  reference: string | null
  price: number
  stock: number
  material: string | null
  shape: string | null
  categories: string[]
  badge?: "NUEVO" | null
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCop(value: number): string {
  return copFormatter.format(value)
}

/** Título en catálogo y ficha: marca + nombre + referencia + color. */
export function productTitle(product: {
  brand: string | null
  name: string
  reference: string | null
  color: string | null
}): string {
  return [product.brand, product.name, product.reference, product.color]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(" ")
}
