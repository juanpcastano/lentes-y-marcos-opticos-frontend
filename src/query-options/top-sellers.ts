import { queryOptions } from "@tanstack/react-query"
import { fetchTopSellers } from "#/services/top-sellers"
import type { TopProduct } from "#/components/top-sellers/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface TopSellersParams {
  // Future filter parameters
}

export default function createTopSellersQueryOptions<
  TData = TopProduct[],
  TError = Error,
>(
  params?: TopSellersParams,
  options?: Omit<
    UseQueryOptions<TopProduct[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<TopProduct[], TError, TData>({
    queryKey: ["top-sellers", params ?? {}],
    queryFn: fetchTopSellers,
    ...options,
  })
}
