import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import {
  getAdminProduct,
  fetchAdminProductFacets,
  listAdminBrands,
  listAdminCategories,
  listAdminHeroSlides,
  listAdminProducts,
} from "#/services/admin"

export const ADMIN_PRODUCTS_QUERY_KEY = ["admin", "products"] as const
export const ADMIN_CATEGORIES_QUERY_KEY = ["admin", "categories"] as const
export const ADMIN_BRANDS_QUERY_KEY = ["admin", "brands"] as const
export const ADMIN_HERO_SLIDES_QUERY_KEY = ["admin", "hero-slides"] as const

export function createAdminProductsQueryOptions(params?: {
  q?: string
  brands?: string[]
  categories?: string[]
  materials?: string[]
  shapes?: string[]
  colors?: string[]
  priceMin?: number
  priceMax?: number
  onSale?: boolean
  isNew?: boolean
  active?: string
  page?: number
  sort?: string
}) {
  return queryOptions({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, params],
    queryFn: () => listAdminProducts(params),
    placeholderData: keepPreviousData,
  })
}

export function createAdminProductQueryOptions(id: string) {
  return queryOptions({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, id],
    queryFn: () => getAdminProduct(id),
  })
}

export function createAdminProductFacetsQueryOptions() {
  return queryOptions({
    queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, "facets"],
    queryFn: fetchAdminProductFacets,
  })
}

export function createAdminCategoriesQueryOptions() {
  return queryOptions({
    queryKey: ADMIN_CATEGORIES_QUERY_KEY,
    queryFn: listAdminCategories,
  })
}

export function createAdminBrandsQueryOptions() {
  return queryOptions({
    queryKey: ADMIN_BRANDS_QUERY_KEY,
    queryFn: listAdminBrands,
  })
}

export function createAdminHeroSlidesQueryOptions() {
  return queryOptions({
    queryKey: ADMIN_HERO_SLIDES_QUERY_KEY,
    queryFn: listAdminHeroSlides,
  })
}
