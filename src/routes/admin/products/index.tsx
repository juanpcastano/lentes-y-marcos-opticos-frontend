import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { Button } from "#/components/ui/button"
import { AdminProductsTable } from "#/components/admin/admin-products-table"
import { ProductFilterFields } from "#/components/catalog/product-filter-fields"
import { adminProductsSearchSchema } from "#/components/admin/admin-products-search"
import type {
  AdminProductsFilters,
  AdminProductsSort,
} from "#/components/admin/admin-products-table"
import { useDebouncedValue } from "#/hooks/use-debounced-value"
import {
  ADMIN_PRODUCTS_QUERY_KEY,
  createAdminBrandsQueryOptions,
  createAdminCategoriesQueryOptions,
  createAdminProductFacetsQueryOptions,
  createAdminProductsQueryOptions,
} from "#/query-options/admin"
import { adminErrorMessage, deleteAdminProduct } from "#/services/admin"

export const Route = createFileRoute("/admin/products/")({
  validateSearch: adminProductsSearchSchema,
  component: ProductsPage,
})

function ProductsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const committedQuery = search.q ?? ""
  const activeFilter = search.active
  const currentPage = search.page ?? 0
  const currentSort = search.sort
  const { data: categories = [] } = useQuery(
    createAdminCategoriesQueryOptions(),
  )
  const { data: brands = [] } = useQuery(createAdminBrandsQueryOptions())
  const { data: facets } = useQuery({
    ...createAdminProductFacetsQueryOptions(),
  })

  const [input, setInput] = useState(committedQuery)
  const debouncedInput = useDebouncedValue(input, 400)

  useEffect(() => {
    setInput(committedQuery)
  }, [committedQuery])

  useEffect(() => {
    if (debouncedInput !== input) return
    if (debouncedInput === committedQuery) return
    navigate({
      search: (prev) => ({
        ...prev,
        q: debouncedInput || undefined,
        page: undefined,
      }),
      resetScroll: false,
    })
  }, [debouncedInput, input, committedQuery, navigate])

  const { data, isPending, error, isPlaceholderData } = useQuery(
    createAdminProductsQueryOptions({
      q: committedQuery,
      brands: search.brands,
      categories: search.categories,
      materials: search.materials,
      shapes: search.shapes,
      colors: search.colors,
      priceMin: search.priceMin,
      priceMax: search.priceMax,
      onSale: search.onSale,
      isNew: search.isNew,
      active: activeFilter,
      page: currentPage,
      sort: currentSort,
    }),
  )

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    if (currentPage > data.totalPages - 1) {
      navigate({
        search: (prev) => ({ ...prev, page: data.totalPages - 1 }),
        resetScroll: false,
      })
    }
  }, [data, currentPage, navigate])

  const queryClient = useQueryClient()
  const removeProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteAdminProduct(id)))
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY }),
  })

  const handleFiltersChange = (filters: AdminProductsFilters) => {
    setInput(filters.q)
    const activeChanged = filters.active !== activeFilter
    const searchCleared = filters.q === "" && committedQuery !== ""
    if (!activeChanged && !searchCleared) return
    navigate({
      search: (prev) => ({
        ...prev,
        q: filters.q || undefined,
        active: filters.active,
        page: undefined,
      }),
      resetScroll: false,
    })
  }

  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page: page || undefined }),
      resetScroll: false,
    })
  }

  const handleSortChange = (sort: AdminProductsSort | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        sort: sort ? `${sort.field},${sort.direction}` : undefined,
        page: undefined,
      }),
      resetScroll: false,
    })
  }

  const handleProductFiltersChange = (filters: Partial<typeof search>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...filters, page: undefined }
        const hasAdvancedFilters =
          next.brands.length > 0 ||
          next.categories.length > 0 ||
          next.materials.length > 0 ||
          next.shapes.length > 0 ||
          next.colors.length > 0 ||
          next.priceMin !== undefined ||
          next.priceMax !== undefined ||
          next.onSale !== undefined ||
          next.isNew !== undefined

        return {
          ...next,
          active: hasAdvancedFilters ? next.active : undefined,
        }
      },
      resetScroll: false,
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Catálogo</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Productos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Edita precios, descuentos, variantes e imágenes.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new" search={search}>
            <Plus />
            Nuevo producto
          </Link>
        </Button>
      </header>

      {error && (
        <p className="mt-6 text-sm text-destructive">
          {adminErrorMessage(error)}
        </p>
      )}
      {removeProducts.error && (
        <p className="mt-6 text-sm text-destructive">
          {adminErrorMessage(removeProducts.error)}
        </p>
      )}
      <AdminProductsTable
        data={data}
        isPending={isPending}
        isPlaceholderData={isPlaceholderData}
        filters={{ q: input, active: activeFilter }}
        onFiltersChange={handleFiltersChange}
        sort={currentSort}
        onSortChange={handleSortChange}
        page={currentPage}
        onPageChange={handlePageChange}
        onDelete={(ids) => removeProducts.mutate(ids)}
        isDeleting={removeProducts.isPending}
        returnSearch={search}
        filtersContent={
          <ProductFilterFields
            options={{
              brands: brands.map((brand) => brand.name).sort(),
              categories: categories.map((category) => category.name).sort(),
              materials: facets?.materials ?? [],
              shapes: facets?.shapes ?? [],
              colors: facets?.colors ?? [],
              priceMin: facets?.minPrice ?? 0,
              priceMax: facets?.maxPrice ?? 0,
            }}
            values={search}
            onChange={handleProductFiltersChange}
          />
        }
      />
    </div>
  )
}
