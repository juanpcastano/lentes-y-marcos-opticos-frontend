import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useMemo, useState } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { ChevronDown, X } from "lucide-react"

import { createInfiniteProductsQueryOptions } from "#/query-options/products"
import createCategoriesQueryOptions from "#/query-options/categories"
import createBrandsQueryOptions from "#/query-options/brands"
import { useMediaQuery } from "#/hooks/use-media-query"
import { fetchProductFacets } from "#/services/products"
import { ProductCard } from "#/components/catalog/product-card"
import { ProductFilterFields } from "#/components/catalog/product-filter-fields"
import { SortSelect } from "#/components/catalog/sort-select"
import { ResultsCount } from "#/components/catalog/results-count"
import { Button } from "#/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible"

const catalogSearchSchema = z.object({
  brands: z.array(z.string()).default([]),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  materials: z.array(z.string()).default([]),
  shapes: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  onSale: z.boolean().optional(),
  isNew: z.boolean().optional(),
  q: z.string().optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc"]).default("relevance"),
})

export const Route = createFileRoute("/_main-layout/catalog")({
  validateSearch: catalogSearchSchema,
  component: CatalogPage,
})

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
]

function CatalogPage() {
  const search = useSearch({ from: "/_main-layout/catalog" })
  const navigate = useNavigate({ from: "/catalog" })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  // Una sola copia de los filtros: en escritorio van fijos en el aside, en
  // móvil dentro del colapsable. Montar ambas duplicaba cientos de
  // checkboxes (p. ej. ~400 marcas) y congelaba la apertura.
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const { data: categories = [], isPending: categoriesPending } = useQuery(
    createCategoriesQueryOptions(),
  )
  const { data: brands = [], isPending: brandsPending } = useQuery(
    createBrandsQueryOptions(),
  )
  const { data: facets, isPending: facetsPending } = useQuery({
    queryKey: ["products", "facets"],
    queryFn: fetchProductFacets,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  })

  const productParams = {
    brands: search.brands,
    categories: search.categories,
    materials: search.materials,
    shapes: search.shapes,
    priceMin: search.priceMin,
    priceMax: search.priceMax,
    onSale: search.onSale,
    isNew: search.isNew,
    q: search.q,
    sort: search.sort,
    size: 24,
  }
  const productsQuery = useInfiniteQuery(
    createInfiniteProductsQueryOptions(productParams),
  )
  const products =
    productsQuery.data?.pages.flatMap((page) => page.content) ?? []
  const totalProducts = productsQuery.data?.pages.at(-1)?.totalElements ?? 0

  const allBrands = useMemo(
    () => brands.map((brand) => brand.name).sort(),
    [brands],
  )
  const allMaterials = useMemo(() => facets?.materials ?? [], [facets])
  const allShapes = useMemo(() => facets?.shapes ?? [], [facets])
  const allCategories = useMemo(
    () => categories.map((category) => category.name).sort(),
    [categories],
  )

  const priceMin = facets?.minPrice ?? 0
  const priceMax = facets?.maxPrice ?? 0

  const updateSearch = (partial: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...partial,
      }),
      resetScroll: false,
    })
  }

  function Filters() {
    return (
      <ProductFilterFields
        options={{
          brands: allBrands,
          categories: allCategories,
          materials: allMaterials,
          shapes: allShapes,
          priceMin,
          priceMax,
        }}
        values={search}
        onChange={updateSearch}
        loadingTaxonomies={categoriesPending || brandsPending}
        loadingFacets={facetsPending}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">Catálogo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Encuentra el marco perfecto para tu visión.
              </p>
            </div>

            {isDesktop ? (
              <Filters />
            ) : (
              <Collapsible
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-3 font-medium">
                  Filtros
                  <ChevronDown className="size-4 transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-6 pt-4">
                  <Filters />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {search.q?.trim() ? (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Búsqueda:</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium">
                {search.q.trim()}
                <button
                  type="button"
                  aria-label="Limpiar búsqueda"
                  className="rounded-full p-0.5 hover:bg-background"
                  onClick={() => updateSearch({ q: undefined })}
                >
                  <X className="size-3.5" />
                </button>
              </span>
            </div>
          ) : null}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <ResultsCount visible={products.length} total={totalProducts} />
            <SortSelect
              options={SORT_OPTIONS}
              value={search.sort}
              onChange={(v) => updateSearch({ sort: v as typeof search.sort })}
            />
          </div>

          {productsQuery.isPending ? (
            <p className="text-center text-muted-foreground">
              Cargando productos...
            </p>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {search.q?.trim()
                ? `No se encontraron productos para "${search.q.trim()}".`
                : "No se encontraron productos con los filtros seleccionados."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {productsQuery.hasNextPage ? (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                disabled={productsQuery.isFetchingNextPage}
                onClick={() => productsQuery.fetchNextPage()}
              >
                {productsQuery.isFetchingNextPage
                  ? "Cargando..."
                  : "Cargar más productos"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
