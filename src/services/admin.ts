import { api } from "#/lib/api"
import type { ProductFacets } from "#/services/products"

export interface AdminImage {
  id: string
  imageUrl: string
  isPrimary: boolean
  sortOrder: number | null
}

export interface AdminVariant {
  id: string | null
  variantName: string | null
  sku: string | null
  imageUrl: string | null
  isActive: boolean
}

export interface AdminProduct {
  id: string
  name: string
  brandId: string | null
  brand: string | null
  basePrice: number
  discountPercentage: number | null
  material: string | null
  shape: string | null
  description: string | null
  taxRate: number | null
  productType: string
  isActive: boolean
  categories: string[]
  images: AdminImage[]
  variants: AdminVariant[]
  createdAt: string
  updatedAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdminProductInput {
  name: string
  brandId: string | null
  basePrice: number
  discountPercentage: number | null
  material: string
  shape: string
  description: string
  taxRate: number | null
  productType: string
  isActive: boolean
  categories: string[]
  variants: AdminVariantInput[]
}

export interface AdminVariantInput {
  id?: string | null
  variantName: string
  sku: string
  imageUrl: string
  isActive: boolean
}

export interface AdminCategory {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isFeatured: boolean
}

export interface AdminBrand {
  id: string
  name: string
  tagline: string | null
  imageUrl: string | null
  isFeatured: boolean
}

export interface TaxonomyInput {
  name: string
  description?: string
  tagline?: string
  imageUrl?: string
  isFeatured?: boolean
}

export async function listAdminProducts(params?: {
  q?: string
  brands?: string[]
  categories?: string[]
  materials?: string[]
  shapes?: string[]
  priceMin?: number
  priceMax?: number
  active?: string
  page?: number
  sort?: string
}): Promise<PageResponse<AdminProduct>> {
  const query = new URLSearchParams()
  if (params?.q) query.set("q", params.q)
  for (const brand of params?.brands ?? []) query.append("brands", brand)
  for (const category of params?.categories ?? [])
    query.append("categories", category)
  for (const material of params?.materials ?? [])
    query.append("materials", material)
  for (const shape of params?.shapes ?? []) query.append("shapes", shape)
  if (params?.priceMin !== undefined)
    query.set("priceMin", String(params.priceMin))
  if (params?.priceMax !== undefined)
    query.set("priceMax", String(params.priceMax))
  if (params?.active) query.set("active", params.active)
  if (params?.sort) query.set("sort", params.sort)
  query.set("page", String(params?.page ?? 0))
  query.set("size", "20")
  return api.get<PageResponse<AdminProduct>>(`/admin/products?${query}`)
}

export function getAdminProduct(id: string) {
  return api.get<AdminProduct>(`/admin/products/${id}`)
}

export function fetchAdminProductFacets() {
  return api.get<ProductFacets>("/admin/products/facets")
}

export function createAdminProduct(input: AdminProductInput) {
  return api.post<AdminProduct>("/admin/products", input)
}

export function updateAdminProduct(id: string, input: AdminProductInput) {
  return api.put<AdminProduct>(`/admin/products/${id}`, input)
}

export function deactivateAdminProduct(id: string) {
  return api.delete<void>(`/admin/products/${id}`)
}

export function setAdminProductActive(id: string, active: boolean) {
  return api.patch<void>(`/admin/products/${id}/active?active=${active}`)
}

export function uploadAdminImage(
  id: string,
  file: File,
  primary: boolean,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData()
  body.append("file", file)
  body.append("primary", String(primary))
  return api.post<AdminImage>(`/admin/products/${id}/images`, body, {
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function deleteAdminImage(productId: string, imageId: string) {
  return api.delete<void>(`/admin/products/${productId}/images/${imageId}`)
}

export function setAdminPrimaryImage(productId: string, imageId: string) {
  return api.put<AdminImage>(
    `/admin/products/${productId}/images/${imageId}/primary`,
  )
}

export function reorderAdminImages(productId: string, imageIds: string[]) {
  return api.put<AdminImage[]>(
    `/admin/products/${productId}/images/order`,
    imageIds,
  )
}

export function listAdminCategories() {
  return api.get<AdminCategory[]>("/admin/categories")
}

export function createAdminCategory(input: TaxonomyInput) {
  return api.post<AdminCategory>("/admin/categories", input)
}

export function updateAdminCategory(id: string, input: TaxonomyInput) {
  return api.put<AdminCategory>(`/admin/categories/${id}`, input)
}

export function deleteAdminCategory(id: string) {
  return api.delete<void>(`/admin/categories/${id}`)
}

export function listAdminBrands() {
  return api.get<AdminBrand[]>("/admin/brands")
}

export function createAdminBrand(input: TaxonomyInput) {
  return api.post<AdminBrand>("/admin/brands", input)
}

export function updateAdminBrand(id: string, input: TaxonomyInput) {
  return api.put<AdminBrand>(`/admin/brands/${id}`, input)
}

export function deleteAdminBrand(id: string) {
  return api.delete<void>(`/admin/brands/${id}`)
}
