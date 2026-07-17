import { queryOptions } from "@tanstack/react-query"
import { fetchFeaturedBrands } from "#/services/featured-brands"
import type { FeaturedBrand } from "#/components/featured-brands/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface FeaturedBrandsParams {
  // Future filter parameters
}

export default function createFeaturedBrandsQueryOptions<
  TData = FeaturedBrand[],
  TError = Error,
>(
  params?: FeaturedBrandsParams,
  options?: Omit<
    UseQueryOptions<FeaturedBrand[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<FeaturedBrand[], TError, TData>({
    queryKey: ["featured-brands", params ?? {}],
    queryFn: fetchFeaturedBrands,
    ...options,
  })
}
