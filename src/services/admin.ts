import { ApiError, api } from "#/lib/api"
import type { ProductFacets } from "#/services/products"

export interface AdminImage {
  id: string
  imageUrl: string
  isPrimary: boolean
  sortOrder: number | null
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "HIDDEN"

/**
 * Un SKU de Softix es un producto. Todos los datos que vienen de Softix son de
 * solo lectura; solo se editan estado, material, forma y descripción.
 */
export interface AdminProduct {
  id: string
  sku: string
  name: string
  brand: string | null
  reference: string | null
  color: string | null
  categories: string[]
  price: number
  saleVat: boolean
  stock: number
  status: ProductStatus
  softixMissing: boolean
  syncedAt: string | null
  material: string | null
  shape: string | null
  description: string | null
  imageUrl: string | null
  images: AdminImage[]
}

export interface AdminProductUpdate {
  status?: ProductStatus
  material?: string
  shape?: string
  description?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
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

export interface AdminHeroAction {
  label: string
  to: string
}

export interface AdminHeroSlide {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  actions: AdminHeroAction[]
  sortOrder: number
  isActive: boolean
}

export interface AdminHeroSlideInput {
  title: string
  description?: string
  imageUrl: string
  ctaLabel?: string
  ctaTo?: string
  cta2Label?: string
  cta2To?: string
  sortOrder?: number
  isActive?: boolean
}

export type AdminMediaFolder = "categories" | "brands" | "products" | "hero"

export interface AdminMediaImage {
  key: string
  imageUrl: string
}

export interface AdminMediaReference {
  type: "brand" | "category" | "product" | "hero"
  id: string
  name: string
}

export interface AdminMediaAsset extends AdminMediaImage {
  folder: "products" | "brands" | "categories" | "hero"
  references: AdminMediaReference[]
}

export interface SyncResult {
  created: number
  updated: number
  hidden: number
  skipped: number
}

export async function listAdminProducts(params?: {
  q?: string
  brands?: string[]
  categories?: string[]
  materials?: string[]
  shapes?: string[]
  colors?: string[]
  statuses?: ProductStatus[]
  priceMin?: number
  priceMax?: number
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
  for (const color of params?.colors ?? []) query.append("colors", color)
  for (const status of params?.statuses ?? []) query.append("statuses", status)
  if (params?.priceMin !== undefined)
    query.set("priceMin", String(params.priceMin))
  if (params?.priceMax !== undefined)
    query.set("priceMax", String(params.priceMax))
  if (params?.sort) query.set("sort", params.sort)
  query.set("page", String(params?.page ?? 0))
  query.set("size", "100")
  return api.get<PageResponse<AdminProduct>>(`/admin/products?${query}`)
}

export function getAdminProduct(id: string) {
  return api.get<AdminProduct>(`/admin/products/${id}`)
}

export function fetchAdminProductFacets() {
  return api.get<ProductFacets>("/products/facets")
}

export function updateAdminProduct(id: string, input: AdminProductUpdate) {
  return api.put<AdminProduct>(`/admin/products/${id}`, input)
}

export function bulkSetProductsStatus(ids: string[], status: ProductStatus) {
  return api.put<{ updated: number; status: ProductStatus }>(
    "/admin/products/bulk-status",
    { ids, status },
  )
}

export function syncSoftixCatalog() {
  return api.post<SyncResult>("/admin/softix/sync")
}

export function uploadProductImage(
  productId: string,
  file: File,
  primary: boolean,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData()
  body.append("file", file)
  body.append("primary", String(primary))
  return api.post<AdminImage>(`/admin/products/${productId}/images`, body, {
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function attachExistingProductImage(
  productId: string,
  imageUrl: string,
  primary: boolean,
) {
  return api.post<AdminImage>(`/admin/products/${productId}/images/existing`, {
    imageUrl,
    primary,
  })
}

export function deleteProductImage(productId: string, imageId: string) {
  return api.delete<void>(`/admin/products/${productId}/images/${imageId}`)
}

export function setProductPrimaryImage(productId: string, imageId: string) {
  return api.put<AdminImage>(
    `/admin/products/${productId}/images/${imageId}/primary`,
  )
}

export function reorderProductImages(productId: string, imageIds: string[]) {
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

export function listAdminHeroSlides() {
  return api.get<AdminHeroSlide[]>("/admin/hero-slides")
}

export function createAdminHeroSlide(input: AdminHeroSlideInput) {
  return api.post<AdminHeroSlide>("/admin/hero-slides", input)
}

export function updateAdminHeroSlide(id: string, input: AdminHeroSlideInput) {
  return api.put<AdminHeroSlide>(`/admin/hero-slides/${id}`, input)
}

export function deleteAdminHeroSlide(id: string) {
  return api.delete<void>(`/admin/hero-slides/${id}`)
}

export function reorderAdminHeroSlides(ids: string[]) {
  return api.put<AdminHeroSlide[]>("/admin/hero-slides/reorder", { ids })
}

export function listAdminMedia(folder: AdminMediaFolder) {
  return api.get<AdminMediaImage[]>(`/admin/media/${folder}`)
}

export function uploadAdminMedia(
  folder: AdminMediaFolder,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData()
  body.append("file", file)
  return api.post<AdminMediaImage>(`/admin/media/${folder}`, body, {
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function listAdminGallery() {
  return api.get<AdminMediaAsset[]>("/admin/media/gallery")
}

export function deleteAdminMedia(key: string, force: boolean) {
  const params = new URLSearchParams({ key, force: String(force) })
  return api.delete<void>(`/admin/media/gallery?${params}`)
}

/**
 * Mensaje legible para errores del panel admin.
 */
export function adminErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error inesperado. Inténtalo de nuevo.",
): string {
  if (error instanceof ApiError) {
    if (error.status === 503)
      return "El almacenamiento de imágenes no está configurado en el servidor (S3). Contacta al administrador del sistema."
    if (error.status === 403)
      return "No tienes permiso para realizar esta acción."
    if (error.status === 401)
      return "Tu sesión expiró. Vuelve a iniciar sesión."
    const base = error.message || fallback
    if (error.details) {
      const fields = Object.entries(error.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ")
      return `${base} — ${fields}`
    }
    if (error.message) return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
