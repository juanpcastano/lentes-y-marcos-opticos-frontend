import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import createFeaturedCategoriesQueryOptions from "#/query-options/featured-categories"
import { FeaturedCategoryCard } from "./featured-category-card"
import { FeaturedCategoriesSkeleton } from "./featured-categories-skeleton"

export function FeaturedCategories() {
  const { data: categories = [], isLoading } = useQuery(
    createFeaturedCategoriesQueryOptions(),
  )

  if (isLoading) {
    return <FeaturedCategoriesSkeleton />
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="px-4 py-10 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold md:text-3xl">
            Categorías Destacadas
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Seleccionadas cuidadosamente para cada necesidad visual.
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

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:grid-rows-2 md:h-[28rem]">
        <div className="h-56 md:h-full md:row-span-2">
          <FeaturedCategoryCard category={categories[0]} />
        </div>
        <div className="h-56 md:h-full">
          <FeaturedCategoryCard category={categories[1]} />
        </div>
        <div className="h-56 md:h-full">
          <FeaturedCategoryCard category={categories[2]} />
        </div>
      </div>
    </section>
  )
}
