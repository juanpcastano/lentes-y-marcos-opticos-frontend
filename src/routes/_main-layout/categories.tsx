import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import createCategoriesQueryOptions from "#/query-options/categories"
import { CategoryCard } from "#/components/categories/category-card"
import { CategoriesSkeleton } from "#/components/categories/categories-skeleton"
import { Input } from "#/components/ui/input"

export const Route = createFileRoute("/_main-layout/categories")({
  component: CategoriesPage,
})

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery(
    createCategoriesQueryOptions(),
  )
  const [search, setSearch] = useState("")

  const visibleCategories = useMemo(() => {
    const sorted = [...categories].sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) ||
        a.name.localeCompare(b.name, "es-CO", { sensitivity: "base" }),
    )
    const needle = normalize(search.trim())
    if (!needle) return sorted
    return sorted.filter((category) =>
      normalize(category.name).includes(needle),
    )
  }, [categories, search])

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Nuestras Categorías
        </h1>
        <p className="text-muted-foreground">
          Encuentra el estilo perfecto para cada momento de tu día.
        </p>
      </div>

      {!isLoading && categories.length > 0 && (
        <div className="mb-6 max-w-md">
          <Input
            placeholder="Buscar categorías..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar categorías"
          />
          {search.trim() !== "" && (
            <p className="mt-2 text-sm text-muted-foreground">
              {visibleCategories.length} de {categories.length} resultados
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <CategoriesSkeleton />
      ) : visibleCategories.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {search.trim() !== ""
            ? "Sin resultados para esta búsqueda."
            : "No hay categorías disponibles en este momento."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleCategories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      )}
    </div>
  )
}
