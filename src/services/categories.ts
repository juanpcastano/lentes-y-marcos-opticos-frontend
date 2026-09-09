import type { Category } from "#/components/categories/types"
import { api } from "#/lib/api"

export async function fetchCategories(): Promise<Category[]> {
  return api.get<Category[]>("/categories")
}

export async function fetchFeaturedCategories(): Promise<Category[]> {
  return api.get<Category[]>("/categories/featured")
}
