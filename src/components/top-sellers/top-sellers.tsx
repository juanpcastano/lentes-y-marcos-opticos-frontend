import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "#/components/ui/carousel"
import createTopSellersQueryOptions from "#/query-options/top-sellers"
import { TopProductCard } from "./top-product-card"
import { TopSellersSkeleton } from "./top-sellers-skeleton"

export function TopSellers() {
  const { data: products = [], isLoading } = useQuery(
    createTopSellersQueryOptions(),
  )

  // opts estable: evita reInit de Embla en cada render.
  const opts = useMemo(
    () => ({
      loop: true,
      align: "start" as const,
      containScroll: "trimSnaps" as const,
      skipSnaps: true,
      duration: 25,
    }),
    [],
  )

  if (isLoading) {
    return <TopSellersSkeleton />
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-6 lg:py-10 md:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold md:text-3xl">
            Los Más Vendidos
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Nuestros productos preferidos por los clientes, ordenados por
            ventas.
          </p>
        </div>
        <Link
          to="/catalog"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline md:text-base"
        >
          Ver todas
          <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="px-12">
        <Carousel opts={opts} className="w-full">
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 2xl:basis-1/6"
              >
                <TopProductCard product={product} />
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
