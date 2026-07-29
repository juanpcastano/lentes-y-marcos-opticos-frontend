import { useMutation, useQueryClient } from "@tanstack/react-query"
import { rescheduleAppointment } from "#/services/user-appointments"
import type { UserAppointment } from "#/services/user-appointments"

export function useRescheduleAppointment() {
  const queryClient = useQueryClient()
  return useMutation<UserAppointment, Error, { date: string; time: string }>({
    mutationFn: ({ date, time }) => rescheduleAppointment(date, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] })
    },
  })
}
