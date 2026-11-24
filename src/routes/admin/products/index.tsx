import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "#/components/ui/button"
import { AdminProductsTable } from "#/components/admin/admin-products-table"
import { AdminProductFilterFields } from "#/components/admin/admin-product-filter-fields"
import { adminProductsSearchSchema } from "#/components/admin/admin-products-search"
import { useDebouncedValue } from "#/hooks/use-debounced-value"
import {
  ADMIN_PRODUCTS_QUERY_KEY,
  createAdminBrandsQueryOptions,
  createAdminCategoriesQueryOptions,
  createAdminProductFacetsQueryOptions,
  createAdminProductsQueryOptions,
} from "#/query-options/admin"
import {
  adminErrorMessage,
  bulkSetProductsStatus,
  deleteAdminProduct,
  syncSoftixCatalog,
} from "#/services/admin"
import type { ProductStatus } from "#/services/admin"
import { toast } from "#/hooks/use-toast"

export const Route = createFileRoute("/admin/products/")({
  validateSearch: adminProductsSearchSchema,
  component: ProductsPage,
})

function ProductsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()

  const committedQuery = search.q ?? ""
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

  const { data: brands = [] } = useQuery(createAdminBrandsQueryOptions())
  const { data: categories = [] } = useQuery(
    createAdminCategoriesQueryOptions(),
  )
  const { data: facets, isPending: facetsPending } = useQuery(
    createAdminProductFacetsQueryOptions(),
  )

  const { data, isPending, error, isPlaceholderData } = useQuery(
    createAdminProductsQueryOptions({
      q: committedQuery,
      brands: search.brands,
      categories: search.categories,
      materials: search.materials,
      shapes: search.shapes,
      colors: search.colors,
      statuses: search.statuses,
      priceMin: search.priceMin,
      priceMax: search.priceMax,
      page: search.page,
      sort: search.sort,
    }),
  )

  useEffect(() => {
    if (!data || data.totalPages === 0) return
    const currentPage = search.page ?? 0
    if (currentPage > data.totalPages - 1) {
      navigate({
        search: (prev) => ({ ...prev, page: data.totalPages - 1 }),
        resetScroll: false,
      })
    }
  }, [data, navigate, search.page])

  const sync = useMutation({
    mutationFn: syncSoftixCatalog,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({
        title: "Sincronización terminada",
        description: `${result.updated} actualizados, ${result.hidden} ocultos, ${result.errors} con error.`,
      })
    },
    onError: (mutationError) =>
      toast({
        variant: "destructive",
        title: adminErrorMessage(mutationError),
      }),
  })

  const removeProducts = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map(deleteAdminProduct))
      const failed = results.filter((result) => result.status === "rejected")
      return { deleted: ids.length - failed.length, failed: failed.length }
    },
    onSuccess: async ({ deleted, failed }) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      if (failed > 0) {
        toast({
          variant: "destructive",
          title: `No se pudieron eliminar ${failed} producto(s)`,
          description: `${deleted} eliminado(s).`,
        })
        return
      }
      toast({ title: `${deleted} producto(s) eliminado(s)` })
    },
    onError: (mutationError) =>
      toast({
        variant: "destructive",
        title: adminErrorMessage(mutationError),
      }),
  })

  const bulkStatus = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ProductStatus }) =>
      bulkSetProductsStatus(ids, status),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({
        title: `Estado actualizado (${variables.ids.length})`,
      })
    },
    onError: (mutationError) =>
      toast({
        variant: "destructive",
        title: adminErrorMessage(mutationError),
      }),
  })

  function update(partial: Partial<typeof search>) {
    navigate({
      search: (prev) => ({ ...prev, ...partial, page: undefined }),
      resetScroll: false,
    })
  }

  const allBrands = useMemo(() => {
    const names = brands.map((brand) => brand.name)
    return names.length > 0 ? names.sort() : (facets?.brands ?? [])
  }, [brands, facets?.brands])

  const allCategories = useMemo(() => {
    const names = categories.map((category) => category.name)
    return names.length > 0 ? names.sort() : (facets?.categories ?? [])
  }, [categories, facets?.categories])

  const filterOptions = {
    brands: allBrands,
    categories: allCategories,
    materials: facets?.materials ?? [],
    shapes: facets?.shapes ?? [],
    colors: facets?.colors ?? [],
    priceMin: facets?.minPrice ?? 0,
    priceMax: facets?.maxPrice ?? 0,
  }

  const filterValues = {
    brands: search.brands,
    categories: search.categories,
    materials: search.materials,
    shapes: search.shapes,
    colors: search.colors,
    needsReview: search.needsReview,
    priceMin: search.priceMin,
    priceMax: search.priceMax,
  }

  const Filters = () => (
    <AdminProductFilterFields
      options={filterOptions}
      values={filterValues}
      onChange={update}
      loadingFacets={facetsPending}
      orientation="horizontal"
    />
  )

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Catálogo</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Productos
          </h1>
          <p className="mt-2 text-muted-foreground">
            {data?.totalElements ?? 0} SKU de Softix.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={sync.isPending}
          onClick={() => sync.mutate()}
        >
          {sync.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sincronizar ahora
        </Button>
      </header>

      {error && (
        <p className="mb-4 text-sm text-destructive">{error.message}</p>
      )}

      <AdminProductsTable
        data={data}
        isPending={isPending}
        isPlaceholderData={isPlaceholderData}
        filters={{ q: input, needsReview: search.needsReview ?? false }}
        onFiltersChange={(next) => {
          setInput(next.q)
          if (next.needsReview !== (search.needsReview ?? false)) {
            update({ needsReview: next.needsReview || undefined })
          }
        }}
        sort={search.sort}
        onSortChange={(sort) => update({ sort: sort || undefined })}
        page={search.page ?? 0}
        onPageChange={(page) => update({ page })}
        onBulkStatus={(ids, status) => bulkStatus.mutate({ ids, status })}
        isUpdatingStatus={bulkStatus.isPending}
        onDelete={(ids) => removeProducts.mutate(ids)}
        isDeleting={removeProducts.isPending}
        returnSearch={search}
        filtersContent={<Filters />}
        statuses={search.statuses}
        onStatusesChange={(statuses) =>
          update({ statuses: statuses.length > 0 ? statuses : undefined })
        }
      />
    </div>
  )
}
