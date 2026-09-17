import type { useSensors } from "@dnd-kit/core"
import type {
  AdminImage,
  AdminProductInput,
  AdminStagedImage,
  AdminVariantInput,
} from "#/services/admin"

/** Sensores de dnd-kit para reordenar imágenes (se crean una vez en el hook). */
export type DndSensors = ReturnType<typeof useSensors>

/** Imagen elegida con el picker pero aún no subida a S3. */
export interface PendingImage {
  file: File
  preview: string
}

/**
 * Imagen local de una variante aún no guardada: vive solo en el navegador
 * hasta que se guarda el producto. `file` = foto recién elegida (preview es
 * un object URL); `imageUrl` = reutilizada desde la galería.
 */
export interface StagedLocalImage {
  key: string
  preview: string
  file?: File
  imageUrl?: string
}

/** Variante del formulario: campos backend + imágenes locales (no se envían). */
export interface VariantFormInput extends Omit<AdminVariantInput, "images"> {
  images: AdminStagedImage[]
  localImages: StagedLocalImage[]
}

/** Input del formulario: igual al backend pero con imágenes locales. */
export type ProductFormInput = Omit<AdminProductInput, "variants"> & {
  variants: VariantFormInput[]
}

/** Progreso de la subida secuencial de pendientes a una variante. */
export interface UploadProgress {
  completed: number
  total: number
  percent: number
  fileName: string
}

/** Imagen guardada pendiente de confirmación de borrado. */
export interface ImageToDelete {
  variantId: string
  image: AdminImage
}

export const emptyInput: ProductFormInput = {
  name: "",
  brandId: null,
  material: "",
  shape: "",
  description: "",
  taxRate: null,
  productType: "marco_optico",
  categories: [],
  variants: [],
}

export const PRODUCT_TYPES = [
  { value: "marco_optico", label: "Marco óptico" },
  { value: "gafa_sol", label: "Gafa de sol" },
  { value: "producto_oftalmico", label: "Producto oftálmico" },
  { value: "lente_contacto", label: "Lente de contacto" },
  { value: "accesorio", label: "Accesorio" },
]
