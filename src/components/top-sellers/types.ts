export interface TopProduct {
  variantId: string
  productId: string
  imageUrl: string
  name: string
  color: string
  brand: string
  price: number
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
})

export function formatCop(value: number): string {
  return copFormatter.format(value)
}
