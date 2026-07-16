import { createFileRoute, Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import createProductQueryOptions from "#/query-options/product"
import { Button } from "#/components/ui/button"
import { ProductImageGallery } from "#/components/product-detail/product-image-gallery"
import { ProductPrice } from "#/components/product-detail/product-price"
import { StockIndicator } from "#/components/product-detail/stock-indicator"
import { RelatedProducts } from "#/components/product-detail/related-products"

export const Route = createFileRoute("/_main-layout/product/$id")({
  component: ProductDetailPage,
})

function ProductDetailPage() {
  const { id } = Route.useParams()
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery(createProductQueryOptions(id))

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-8 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-24 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
        <p className="text-muted-foreground">
          El producto que buscas no existe o ya no está disponible.
        </p>
        <Button asChild variant="default">
          <Link to="/catalog">Volver al catálogo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/catalog"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImageGallery
          imageUrl={product.imageUrl}
          additionalImages={product.additionalImages}
          name={product.name}
        />

        <div className="flex flex-col gap-5">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.brand}
          </span>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {product.name}
          </h1>

          <ProductPrice
            originalPrice={product.originalPrice}
            discountedPrice={product.discountedPrice}
            discountPercentage={product.discountPercentage}
          />

          <StockIndicator stock={product.stock} />

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
            <div>
              <dt className="font-medium">Material</dt>
              <dd className="text-muted-foreground">{product.material}</dd>
            </div>
            <div>
              <dt className="font-medium">Forma</dt>
              <dd className="text-muted-foreground">{product.shape}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            {product.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {category}
              </span>
            ))}
          </div>

          <Button size="lg" className="mt-2 w-full sm:w-auto">
            Añadir al carrito
          </Button>
        </div>
      </div>

      <RelatedProducts currentId={product.id} categories={product.categories} />
    </div>
  )
}
