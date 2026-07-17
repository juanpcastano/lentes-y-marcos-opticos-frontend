import { queryOptions } from "@tanstack/react-query"
import { fetchCategories } from "#/services/categories"
import type { Category } from "#/components/categories/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface CategoriesParams {
  // Future filter parameters
}

export default function createCategoriesQueryOptions<
  TData = Category[],
  TError = Error,
>(
  params?: CategoriesParams,
  options?: Omit<
    UseQueryOptions<Category[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<Category[], TError, TData>({
    queryKey: ["categories", params ?? {}],
    queryFn: fetchCategories,
    ...options,
  })
}
