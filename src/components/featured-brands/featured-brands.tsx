import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import createFeaturedBrandsQueryOptions from "#/query-options/featured-brands"
import { FeaturedBrandCard } from "./featured-brand-card"
import { FeaturedBrandsSkeleton } from "./featured-brands-skeleton"

export function FeaturedBrands() {
  const { data: brands = [], isLoading } = useQuery(
    createFeaturedBrandsQueryOptions(),
  )

  if (isLoading) {
    return <FeaturedBrandsSkeleton />
  }

  if (brands.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold md:text-3xl">
            Marcas Destacadas
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Las mejores marcas del mercado óptico a tu alcance.
          </p>
        </div>
        <Link
          to="/brands"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline md:text-base"
        >
          Ver todas
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Cards grid - right-side dominant */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 md:h-[28rem]">
        {/* Featured brand (big) - first on mobile, right on desktop */}
        <div className="h-56 md:h-full md:row-span-2 md:order-2">
          <FeaturedBrandCard brand={brands[0]} />
        </div>
        {/* Small brand 1 - left top on desktop */}
        <div className="h-56 md:h-full md:order-1">
          <FeaturedBrandCard brand={brands[1]} />
        </div>
        {/* Small brand 2 - left bottom on desktop */}
        <div className="h-56 md:h-full md:order-3">
          <FeaturedBrandCard brand={brands[2]} />
        </div>
      </div>
    </section>
  )
}
