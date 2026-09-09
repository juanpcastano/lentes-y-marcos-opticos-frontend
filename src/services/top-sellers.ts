import type { TopProduct } from "#/components/top-sellers/types"
import { api } from "#/lib/api"

export async function fetchTopSellers(): Promise<TopProduct[]> {
  return api.get<TopProduct[]>("/products/top-sellers")
}
