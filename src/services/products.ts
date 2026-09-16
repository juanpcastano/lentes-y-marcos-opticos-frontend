import { api } from "#/lib/api"
import type { CatalogProduct } from "#/components/catalog/types"
import type { ProductDetail } from "#/components/product-detail/types"

export interface ProductPage {
  content: CatalogProduct[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ProductsParams {
  categories?: string[]
  brands?: string[]
  materials?: string[]
  shapes?: string[]
  priceMin?: number
  priceMax?: number
  onSale?: boolean
  isNew?: boolean
  sort?: "relevance" | "price-asc" | "price-desc"
  page?: number
  size?: number
}

export interface ProductFacets {
  materials: string[]
  shapes: string[]
  minPrice: number | null
  maxPrice: number | null
}

export async function fetchProducts(
  params: ProductsParams = {},
): Promise<ProductPage> {
  const search = new URLSearchParams()

  for (const category of params.categories ?? []) {
    search.append("categories", category)
  }
  for (const brand of params.brands ?? []) {
    search.append("brands", brand)
  }
  for (const material of params.materials ?? []) {
    search.append("materials", material)
  }
  for (const shape of params.shapes ?? []) {
    search.append("shapes", shape)
  }

  if (params.priceMin !== undefined)
    search.set("priceMin", String(params.priceMin))
  if (params.priceMax !== undefined)
    search.set("priceMax", String(params.priceMax))
  if (params.onSale) search.set("onSale", "true")
  if (params.isNew) search.set("isNew", "true")
  if (params.sort !== undefined) search.set("sort", params.sort)
  search.set("page", String(params.page ?? 0))
  search.set("size", String(params.size ?? 24))

  return api.get<ProductPage>(`/products?${search.toString()}`)
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  return api.get<ProductDetail>(`/products/${id}`)
}

export async function fetchProductFacets(): Promise<ProductFacets> {
  return api.get<ProductFacets>("/products/facets")
}
