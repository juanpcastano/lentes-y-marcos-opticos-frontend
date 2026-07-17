import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import createBrandsQueryOptions from "#/query-options/brands"
import { BrandCard } from "#/components/brands/brand-card"
import { BrandsSkeleton } from "#/components/brands/brands-skeleton"

export const Route = createFileRoute("/_main-layout/brands")({
  component: BrandsPage,
})

function BrandsPage() {
  const { data: brands = [], isLoading } = useQuery(createBrandsQueryOptions())

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-primary md:text-4xl">
          Nuestras Marcas
        </h1>
        <p className="text-muted-foreground">
          Descubre las mejores marcas del mercado óptico a tu alcance.
        </p>
      </div>

      {isLoading ? (
        <BrandsSkeleton />
      ) : brands.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No hay marcas disponibles en este momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {brands.map((brand) => (
            <BrandCard key={brand.name} brand={brand} />
          ))}
        </div>
      )}
    </div>
  )
}
