import { queryOptions } from "@tanstack/react-query"
import { fetchProducts } from "#/services/products"
import type { CatalogProduct } from "#/components/catalog/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface ProductsParams {
  // Future filter parameters
}

export default function createProductsQueryOptions<
  TData = CatalogProduct[],
  TError = Error,
>(
  params?: ProductsParams,
  options?: Omit<
    UseQueryOptions<CatalogProduct[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<CatalogProduct[], TError, TData>({
    queryKey: ["products", params ?? {}],
    queryFn: fetchProducts,
    ...options,
  })
}
