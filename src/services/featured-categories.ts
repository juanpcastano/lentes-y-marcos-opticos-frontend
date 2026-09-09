import type { FeaturedCategory } from "#/components/featured-categories/types"
import { api } from "#/lib/api"

export async function fetchFeaturedCategories(): Promise<FeaturedCategory[]> {
  return api.get<FeaturedCategory[]>("/categories/featured")
}
