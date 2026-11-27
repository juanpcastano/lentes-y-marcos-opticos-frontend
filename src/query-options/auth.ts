import { queryOptions } from "@tanstack/react-query"
import { fetchMe } from "#/services/auth"
import type { User } from "#/services/auth"
import { fetchSoftixProfile } from "#/services/softix"
import type { SoftixProfile } from "#/services/softix"

export const ME_QUERY_KEY = ["me"] as const

export function createMeQueryOptions() {
  return queryOptions<User | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: Infinity,
  })
}

export const SOFTIX_PROFILE_QUERY_KEY = ["softix-profile"] as const

export function createSoftixProfileQueryOptions() {
  return queryOptions<SoftixProfile>({
    queryKey: SOFTIX_PROFILE_QUERY_KEY,
    queryFn: fetchSoftixProfile,
  })
}
