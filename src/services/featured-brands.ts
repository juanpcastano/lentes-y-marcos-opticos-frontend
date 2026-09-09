import type { FeaturedBrand } from "#/components/featured-brands/types"
import { api } from "#/lib/api"

export async function fetchFeaturedBrands(): Promise<FeaturedBrand[]> {
  return api.get<FeaturedBrand[]>("/brands/featured")
}
