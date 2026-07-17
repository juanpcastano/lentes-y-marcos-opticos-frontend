import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import createCategoriesQueryOptions from "#/query-options/categories"
import { CategoryCard } from "#/components/categories/category-card"
import { CategoriesSkeleton } from "#/components/categories/categories-skeleton"

export const Route = createFileRoute("/_main-layout/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery(
    createCategoriesQueryOptions(),
  )

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Nuestras Categorías
        </h1>
        <p className="text-muted-foreground">
          Encuentra el estilo perfecto para cada momento de tu día.
        </p>
      </div>

      {isLoading ? (
        <CategoriesSkeleton />
      ) : categories.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No hay categorías disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}
