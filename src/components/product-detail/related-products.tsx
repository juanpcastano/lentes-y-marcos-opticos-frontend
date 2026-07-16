import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel"
import createProductsQueryOptions from "#/query-options/products"
import { Image } from "#/components/ui/image"
import { formatCop } from "#/components/catalog/types"
import type { CatalogProduct } from "#/components/catalog/types"

export function RelatedProducts({
  currentId,
  categories,
}: {
  currentId: string
  categories: string[]
}) {
  const { data: products } = useQuery(createProductsQueryOptions())

  const related = useMemo(() => {
    if (!products) return []
    return products
      .filter((p) => p.id !== currentId)
      .filter((p) => p.categories.some((c) => categories.includes(c)))
      .slice(0, 10)
  }, [products, currentId, categories])

  if (related.length === 0) return null

  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="mb-1 text-2xl font-bold md:text-3xl">
          También te puede interesar
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          Productos similares que podrían gustarte.
        </p>
      </div>

      <div className="px-12">
        <Carousel opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent>
            {related.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <RelatedProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  )
}

function RelatedProductCard({ product }: { product: CatalogProduct }) {
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
