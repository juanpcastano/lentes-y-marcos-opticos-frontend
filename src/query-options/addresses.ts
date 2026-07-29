import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  addAddress,
  deleteAddress,
  fetchAddresses,
  setDefaultAddress,
  updateAddress,
} from "#/services/addresses"
import type { Address, AddressInput } from "#/services/addresses"

export const ADDRESSES_QUERY_KEY = ["addresses"] as const

export default function createAddressesQueryOptions() {
  return queryOptions<Address[]>({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: fetchAddresses,
  })
}

export function useAddAddress() {
  const queryClient = useQueryClient()
  return useMutation<Address[], Error, AddressInput>({
    mutationFn: (input) => addAddress(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY })
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation<Address[], Error, { id: string; input: AddressInput }>({
    mutationFn: ({ id, input }) => updateAddress(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation<Address[], Error, string>({
    mutationFn: (id) => deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  return useMutation<Address[], Error, string>({
    mutationFn: (id) => setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY })
    },
  })
}
