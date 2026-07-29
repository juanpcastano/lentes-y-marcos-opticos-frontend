import { queryOptions } from "@tanstack/react-query"
import { fetchShippingDates } from "#/services/shipping-dates"
import type { UseQueryOptions } from "@tanstack/react-query"

export default function createShippingDatesQueryOptions<
  TData = string[],
  TError = Error,
>(
  options?: Omit<
    UseQueryOptions<string[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<string[], TError, TData>({
    queryKey: ["shipping-dates"],
    queryFn: fetchShippingDates,
    ...options,
  })
}
