import { Image } from "#/components/ui/image"
import { Button } from "#/components/ui/button"
import { formatCop } from "./types"
import type { CatalogProduct } from "./types"

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          containerClassName="aspect-[4/3] w-full"
          className="size-full object-cover"
          loading="lazy"
        />
        {product.badge && (
          <span
            className={
              "absolute top-2 left-2 rounded px-2 py-0.5 text-xs font-semibold " +
              (product.badge === "NUEVO"
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground")
            }
          >
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </span>
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">
          {product.name}
        </h3>
        <span className="mt-1 text-sm font-bold text-primary">
          {formatCop(product.price)}
        </span>
        <Button className="mt-auto w-full" variant="default">
          Ver detalle
        </Button>
      </div>
    </article>
  )
}
