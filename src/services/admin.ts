import { ApiError, api } from "#/lib/api"
import type { ProductFacets } from "#/services/products"

export interface AdminImage {
  id: string
  imageUrl: string
  isPrimary: boolean
  sortOrder: number | null
}

export interface AdminVariant {
  id: string | null
  color: string | null
  sku: string | null
  price: number | null
  discountPercentage: number | null
  discountedPrice: number | null
  isActive: boolean
  images: AdminImage[]
}

export interface AdminProduct {
  id: string
  name: string
  brandId: string | null
  brand: string | null
  material: string | null
  shape: string | null
  description: string | null
  taxRate: number | null
  productType: string
  categories: string[]
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
  material: string
  shape: string
  description: string
  taxRate: number | null
  productType: string
  categories: string[]
  variants: AdminVariantInput[]
}

export interface AdminStagedImage {
  imageUrl: string
}

export interface AdminVariantInput {
  id?: string | null
  color: string
  sku: string
  price: number
  discountPercentage: number | null
  isActive: boolean
  /**
   * URLs ya subidas a `variants/` (staging sin referencias). Solo aplican a
   * variantes nuevas (sin id): al guardar se crean las VariantImage en ese
   * orden (la primera es la principal). En variantes existentes se ignoran
   * (sus imágenes se gestionan por endpoints dedicados).
   */
  images: AdminStagedImage[]
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

export type AdminMediaFolder = "categories" | "brands" | "variants" | "hero"

export interface AdminMediaImage {
  key: string
  imageUrl: string
}

export interface AdminMediaReference {
  type: "brand" | "category" | "product" | "variant" | "hero"
  id: string
  name: string
}

export interface AdminMediaAsset extends AdminMediaImage {
  folder: "variants" | "brands" | "categories" | "hero"
  references: AdminMediaReference[]
}

export async function listAdminProducts(params?: {
  q?: string
  brands?: string[]
  categories?: string[]
  materials?: string[]
  shapes?: string[]
  priceMin?: number
  priceMax?: number
  onSale?: boolean
  isNew?: boolean
  active?: string
  colors?: string[]
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
  if (params?.priceMin !== undefined)
    query.set("priceMin", String(params.priceMin))
  if (params?.priceMax !== undefined)
    query.set("priceMax", String(params.priceMax))
  if (params?.onSale) query.set("onSale", "true")
  if (params?.isNew) query.set("isNew", "true")
  if (params?.active) query.set("active", params.active)
  if (params?.sort) query.set("sort", params.sort)
  query.set("page", String(params?.page ?? 0))
  query.set("size", "100")
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

export function deleteAdminProduct(id: string) {
  return api.delete<void>(`/admin/products/${id}`)
}

export function uploadVariantImage(
  variantId: string,
  file: File,
  primary: boolean,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData()
  body.append("file", file)
  body.append("primary", String(primary))
  return api.post<AdminImage>(`/admin/variants/${variantId}/images`, body, {
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function deleteVariantImage(variantId: string, imageId: string) {
  return api.delete<void>(`/admin/variants/${variantId}/images/${imageId}`)
}

export function setVariantPrimaryImage(variantId: string, imageId: string) {
  return api.put<AdminImage>(
    `/admin/variants/${variantId}/images/${imageId}/primary`,
  )
}

export function reorderVariantImages(variantId: string, imageIds: string[]) {
  return api.put<AdminImage[]>(
    `/admin/variants/${variantId}/images/order`,
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

export function attachExistingVariantImage(
  variantId: string,
  imageUrl: string,
  primary: boolean,
) {
  return api.post<AdminImage>(`/admin/variants/${variantId}/images/existing`, {
    imageUrl,
    primary,
  })
}

export function listAdminGallery() {
  return api.get<AdminMediaAsset[]>("/admin/media/gallery")
}

export function deleteAdminMedia(key: string, force: boolean) {
  const params = new URLSearchParams({ key, force: String(force) })
  return api.delete<void>(`/admin/media/gallery?${params}`)
}

export type InventoryRowStatus =
  "NUEVO" | "ACTUALIZAR" | "SIN_CAMBIOS" | "CONFLICTO" | "ERROR"

export type InventorySuggestedAction =
  "CREATE" | "UPDATE" | "NONE" | "DECIDE" | "SKIP"

export type InventoryDecision = "REPLACE" | "UPDATE" | "DISCARD" | "CREATE"

export interface InventoryExistingSnapshot {
  name: string
  basePrice: number
  brand: string | null
  categories: string[]
  productType: string | null
}

export interface InventoryPreviewRow {
  rowKey: string
  sheet: string
  rowNumber: number
  sku: string
  name: string | null
  brand: string | null
  categories: string[]
  productType: string | null
  basePrice: number | null
  status: InventoryRowStatus
  detail: string | null
  existing: InventoryExistingSnapshot | null
  suggestedAction: InventorySuggestedAction
}

export interface InventoryPreviewSummary {
  total: number
  nuevos: number
  actualizar: number
  sinCambios: number
  conflictos: number
  errores: number
}

export interface InventoryPreview {
  rows: InventoryPreviewRow[]
  summary: InventoryPreviewSummary
}

export interface InventoryConfirmResult {
  created: number
  updated: number
  discarded: number
  unchanged: number
  skipped: string[]
}

export function previewInventory(
  file: File,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData()
  body.append("file", file)
  return api.post<InventoryPreview>("/admin/inventory/preview", body, {
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

export function confirmInventory(
  file: File,
  decisions: Record<string, InventoryDecision>,
  onProgress?: (percent: number) => void,
) {
  const body = new FormData()
  body.append("file", file)
  body.append(
    "decisions",
    new Blob([JSON.stringify(decisions)], { type: "application/json" }),
  )
  return api.post<InventoryConfirmResult>("/admin/inventory/confirm", body, {
    onUploadProgress: (event) => {
      if (event.total)
        onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })
}

/**
 * Mensaje legible para errores del panel admin. Traduce los estados
 * que requieren una acción del usuario (sesión, permisos, storage)
 * y conserva el mensaje del backend para el resto (409, 400, ...).
 * Si el backend envía detalles por campo (validación), se anexan para
 * no tener que abrir la consola.
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
