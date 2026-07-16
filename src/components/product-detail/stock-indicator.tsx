import { cn } from "#/lib/utils"

export function StockIndicator({ stock }: { stock: number }) {
  const { label, dotClass, textClass } = resolveStock(stock)

  return (
    <div className="flex items-center gap-2">
      <span className={cn("size-2 rounded-full", dotClass)} />
      <span className={cn("text-sm font-medium", textClass)}>{label}</span>
    </div>
  )
}

function resolveStock(stock: number): {
  label: string
  dotClass: string
  textClass: string
} {
  if (stock === 0) {
    return {
      label: "Agotado",
      dotClass: "bg-destructive",
      textClass: "text-destructive",
    }
  }
  if (stock <= 5) {
    return {
      label: "Pocas unidades",
      dotClass: "bg-yellow-500",
      textClass: "text-yellow-600 dark:text-yellow-500",
    }
  }
  return {
    label: "En stock",
    dotClass: "bg-green-600",
    textClass: "text-green-700 dark:text-green-500",
  }
}
