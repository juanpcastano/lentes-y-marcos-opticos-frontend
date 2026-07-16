import { formatCop } from "#/components/catalog/types"

export function ProductPrice({
  originalPrice,
  discountedPrice,
  discountPercentage,
}: {
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
}) {
  const hasDiscount = discountPercentage > 0

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {hasDiscount && (
        <span className="text-2xl text-muted-foreground line-through">
          {formatCop(originalPrice)}
        </span>
      )}
      <span className="text-2xl font-bold text-primary">
        {formatCop(hasDiscount ? discountedPrice : originalPrice)}
      </span>
      {hasDiscount && (
        <span className="rounded bg-destructive/10 px-2 py-0.5 text-sm font-semibold text-destructive">
          -{discountPercentage}%
        </span>
      )}
    </div>
  )
}
