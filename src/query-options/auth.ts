import { queryOptions } from "@tanstack/react-query"
import { fetchMe, getPasswordCodeStatus } from "#/services/auth"
import type { PasswordCodeStatus, User } from "#/services/auth"

export const ME_QUERY_KEY = ["me"] as const

export function createMeQueryOptions() {
  return queryOptions<User | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    staleTime: Infinity,
  })
}

export const PASSWORD_CODE_STATUS_QUERY_KEY = ["password-code-status"] as const

export function createPasswordCodeStatusQueryOptions() {
  return queryOptions<PasswordCodeStatus>({
    queryKey: PASSWORD_CODE_STATUS_QUERY_KEY,
    queryFn: getPasswordCodeStatus,
  })
}
