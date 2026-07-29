import { useMutation, useQueryClient } from "@tanstack/react-query"
import { bookAppointment } from "#/services/user-appointments"
import type { UserAppointment } from "#/services/user-appointments"

export function useBookAppointment() {
  const queryClient = useQueryClient()
  return useMutation<UserAppointment, Error, { date: string; time: string }>({
    mutationFn: ({ date, time }) => bookAppointment(date, time),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] })
    },
  })
}
