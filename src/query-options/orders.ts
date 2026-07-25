import { queryOptions } from "@tanstack/react-query"
import { fetchOrders } from "#/services/orders"
import type { Order } from "#/services/orders"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface OrdersParams {
  // Future filter parameters
}

export default function createOrdersQueryOptions<
  TData = Order[],
  TError = Error,
>(
  params?: OrdersParams,
  options?: Omit<
    UseQueryOptions<Order[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<Order[], TError, TData>({
    queryKey: ["orders", params ?? {}],
    queryFn: fetchOrders,
    ...options,
  })
}
