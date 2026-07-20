import { queryOptions } from "@tanstack/react-query"
import { fetchAppointmentAvailability } from "#/services/appointments"
import type { AppointmentDay } from "#/components/appointments/types"
import type { UseQueryOptions } from "@tanstack/react-query"

export default function createAppointmentAvailabilityQueryOptions<
  TData = AppointmentDay[],
  TError = Error,
>(
  options?: Omit<
    UseQueryOptions<AppointmentDay[], TError, TData>,
    "queryKey" | "queryFn"
  >,
) {
  return queryOptions<AppointmentDay[], TError, TData>({
    queryKey: ["appointment-availability"],
    queryFn: fetchAppointmentAvailability,
    ...options,
  })
}
