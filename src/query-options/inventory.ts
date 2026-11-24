import { queryOptions } from "@tanstack/react-query"
import { fetchInventoryAvailability } from "#/services/products"
import type { InventoryAvailability } from "#/services/products"

export default function createInventoryAvailabilityQueryOptions(
  sku: string | undefined,
) {
  return queryOptions<InventoryAvailability>({
    queryKey: ["inventory-availability", sku],
    queryFn: () => fetchInventoryAvailability(sku as string),
    enabled: Boolean(sku),
    staleTime: 0,
  })
}
