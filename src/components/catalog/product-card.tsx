import { Link } from "@tanstack/react-router"
import { Image } from "#/components/ui/image"
import { Button } from "#/components/ui/button"
import { formatCop, productTitle } from "./types"
import type { CatalogProduct } from "./types"

export function ProductCard({ product }: { product: CatalogProduct }) {
  const title = productTitle(product)
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={title}
            containerClassName="aspect-[4/3] w-full"
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-muted" aria-hidden />
        )}
        {product.badge && (
          <span className="absolute top-2 left-2 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </span>
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
          {title}
        </h3>
        <span className="text-sm font-bold text-primary">
          {formatCop(product.price)}
        </span>
        <span className="text-xs text-muted-foreground">
          {product.stock > 0 ? "Disponible" : "Agotado"}
        </span>
        <Button asChild className="mt-2 w-full" variant="default">
          <Link to="/product/$id" params={{ id: product.id }}>
            Ver detalle
          </Link>
        </Button>
      </div>
    </article>
  )
}
