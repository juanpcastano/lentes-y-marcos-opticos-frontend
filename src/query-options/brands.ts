import { queryOptions } from "@tanstack/react-query"
import { fetchBrands } from "#/services/brands"
import type { Brand } from "#/components/brands/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface BrandsParams {
  // Future filter parameters
}

export default function createBrandsQueryOptions<
  TData = Brand[],
  TError = Error,
>(
  params?: BrandsParams,
  options?: Omit<
    UseQueryOptions<Brand[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<Brand[], TError, TData>({
    queryKey: ["brands", params ?? {}],
    queryFn: fetchBrands,
    // Datos de referencia curados por el admin: cambian rara vez, se
    // comparten entre el home y el catálogo sin refetch en cada visita.
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    ...options,
  })
}
