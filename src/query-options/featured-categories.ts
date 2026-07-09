import { queryOptions } from "@tanstack/react-query"
import { fetchFeaturedCategories } from "#/services/featured-categories"
import type { FeaturedCategory } from "#/components/featured-categories/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface FeaturedCategoriesParams {
  // Future filter parameters
}

export default function createFeaturedCategoriesQueryOptions<
  TData = FeaturedCategory[],
  TError = Error,
>(
  params?: FeaturedCategoriesParams,
  options?: Omit<
    UseQueryOptions<FeaturedCategory[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<FeaturedCategory[], TError, TData>({
    queryKey: ["featured-categories", params ?? {}],
    queryFn: fetchFeaturedCategories,
    ...options,
  })
}
