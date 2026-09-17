import { queryOptions } from "@tanstack/react-query"
import { fetchProductById } from "#/services/products"
import type { ProductDetail } from "#/components/product-detail/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export default function createProductQueryOptions<
  TData = ProductDetail,
  TError = Error,
>(
  id: string,
  variantId?: string,
  options?: Omit<
    UseQueryOptions<ProductDetail, TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<ProductDetail, TError, TData>({
    queryKey: ["product", id, variantId ?? null],
    queryFn: () => fetchProductById(id, variantId),
    retry: false,
    ...options,
  })
}
