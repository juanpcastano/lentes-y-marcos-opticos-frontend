import { queryOptions } from "@tanstack/react-query"
import { fetchWhyChooseUs } from "#/services/why-choose-us"
import type { WhyChooseUsData } from "#/components/why-choose-us/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface WhyChooseUsParams {
  // Future filter parameters
}

export default function createWhyChooseUsQueryOptions<
  TData = WhyChooseUsData,
  TError = Error,
>(
  params?: WhyChooseUsParams,
  options?: Omit<
    UseQueryOptions<WhyChooseUsData, TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<WhyChooseUsData, TError, TData>({
    queryKey: ["why-choose-us", params ?? {}],
    queryFn: fetchWhyChooseUs,
    ...options,
  })
}
