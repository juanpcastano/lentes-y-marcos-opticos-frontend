import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import createBrandsQueryOptions from "#/query-options/brands"
import { BrandCard } from "#/components/brands/brand-card"
import { BrandsSkeleton } from "#/components/brands/brands-skeleton"
import { Input } from "#/components/ui/input"

export const Route = createFileRoute("/_main-layout/brands")({
  component: BrandsPage,
})

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function BrandsPage() {
  const { data: brands = [], isLoading } = useQuery(createBrandsQueryOptions())
  const [search, setSearch] = useState("")

  const visibleBrands = useMemo(() => {
    const sorted = [...brands].sort(
      (a, b) =>
        Number(b.isFeatured) - Number(a.isFeatured) ||
        a.name.localeCompare(b.name, "es-CO", { sensitivity: "base" }),
    )
    const needle = normalize(search.trim())
    if (!needle) return sorted
    return sorted.filter((brand) => normalize(brand.name).includes(needle))
  }, [brands, search])

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Nuestras Marcas
        </h1>
        <p className="text-muted-foreground">
          Descubre las mejores marcas del mercado óptico a tu alcance.
        </p>
      </div>

      {!isLoading && brands.length > 0 && (
        <div className="mb-6 max-w-md">
          <Input
            placeholder="Buscar marcas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Buscar marcas"
          />
          {search.trim() !== "" && (
            <p className="mt-2 text-sm text-muted-foreground">
              {visibleBrands.length} de {brands.length} resultados
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <BrandsSkeleton />
      ) : visibleBrands.length === 0 ? (
        <p className="text-center text-muted-foreground">
          {search.trim() !== ""
            ? "Sin resultados para esta búsqueda."
            : "No hay marcas disponibles en este momento."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visibleBrands.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </div>
      )}
    </div>
  )
}
