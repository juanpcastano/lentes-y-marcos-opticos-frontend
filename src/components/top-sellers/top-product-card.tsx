import { Link } from "@tanstack/react-router"
import { Image } from "#/components/ui/image"
import { formatCop } from "./types"
import type { TopProduct } from "./types"

export function TopProductCard({ product }: { product: TopProduct }) {
  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-transform hover:scale-[1.02] hover:shadow-md"
    >
      <Image
        src={product.imageUrl}
        alt={product.name}
        containerClassName="aspect-[4/3] w-full"
        className="size-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
          {product.name}
        </h3>
        <span className="text-xs text-muted-foreground">{product.brand}</span>
        <span className="mt-1 text-sm font-bold text-primary">
          {formatCop(product.price)}
        </span>
      </div>
    </Link>
  )
}
