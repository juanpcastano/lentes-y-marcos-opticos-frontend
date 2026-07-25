import { queryOptions } from "@tanstack/react-query"
import { fetchMe } from "#/services/auth"
import type { User } from "#/services/auth"

export const ME_QUERY_KEY = ["me"] as const

export function createMeQueryOptions() {
  return queryOptions<User | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: Infinity,
  })
}
