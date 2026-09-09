import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"
import { fetchProducts } from "#/services/products"
import type { ProductsParams, ProductPage } from "#/services/products"
import type { UseQueryOptions } from "@tanstack/react-query"

export default function createProductsQueryOptions<
  TData = ProductPage,
  TError = Error,
>(
  params?: ProductsParams,
  options?: Omit<
    UseQueryOptions<ProductPage, TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<ProductPage, TError, TData>({
    queryKey: ["products", params ?? {}],
    queryFn: () => fetchProducts(params),
    ...options,
  })
}

export function createInfiniteProductsQueryOptions(params: ProductsParams) {
  return infiniteQueryOptions({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam }) => fetchProducts({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  })
}
