import type { Brand } from "#/components/brands/types"
import { api } from "#/lib/api"

export async function fetchBrands(): Promise<Brand[]> {
  return api.get<Brand[]>("/brands")
}

export async function fetchFeaturedBrands(): Promise<Brand[]> {
  return api.get<Brand[]>("/brands/featured")
}
