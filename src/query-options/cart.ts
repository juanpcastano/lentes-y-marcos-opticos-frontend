import { queryOptions } from "@tanstack/react-query"
import { fetchCart } from "#/services/cart"
import type { Cart } from "#/services/cart"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface CartParams {
  // Future filter parameters
}

export const CART_QUERY_KEY = ["cart"] as const

export default function createCartQueryOptions<TData = Cart, TError = Error>(
  _params?: CartParams,
  options?: Omit<UseQueryOptions<Cart, TError, TData>, "queryKey" | "queryFn">,
) {
  return queryOptions<Cart, TError, TData>({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    ...options,
  })
}
