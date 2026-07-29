import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cancelAppointment } from "#/services/user-appointments"

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation<void, Error>({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-appointments"] })
    },
  })
}
