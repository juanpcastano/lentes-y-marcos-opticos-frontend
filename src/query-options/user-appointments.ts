import { queryOptions } from "@tanstack/react-query"
import { fetchUserAppointments } from "#/services/user-appointments"
import type { UserAppointment } from "#/services/user-appointments"
import type { UseQueryOptions } from "@tanstack/react-query"

export interface UserAppointmentsParams {
  // Future filter parameters
}

export default function createUserAppointmentsQueryOptions<
  TData = UserAppointment[],
  TError = Error,
>(
  params?: UserAppointmentsParams,
  options?: Omit<
    UseQueryOptions<UserAppointment[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<UserAppointment[], TError, TData>({
    queryKey: ["user-appointments", params ?? {}],
    queryFn: fetchUserAppointments,
    ...options,
  })
}
