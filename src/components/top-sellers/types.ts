export interface TopProduct {
  imageUrl: string
  name: string
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
