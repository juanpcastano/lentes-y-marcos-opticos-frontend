import type { AdminProduct } from "#/services/admin"

export interface ReviewIssue {
  text: string
  section: "info" | "images"
}

/** Puntos pendientes de revisión de un SKU en el panel admin. */
export function productReviewIssues(product: AdminProduct): ReviewIssue[] {
  const issues: ReviewIssue[] = []
  if (product.categories.length === 0) {
    issues.push({ text: "Sin categorías", section: "info" })
  }
  if (!product.material?.trim()) {
    issues.push({ text: "Sin material", section: "info" })
  }
  if (!product.shape?.trim()) {
    issues.push({ text: "Sin forma", section: "info" })
  }
  if (!product.description?.trim()) {
    issues.push({ text: "Sin descripción", section: "info" })
  }
  if (product.images.length === 0) {
    issues.push({ text: "Sin imágenes", section: "images" })
  }
  if (product.stock <= 0) {
    issues.push({ text: "Sin stock", section: "info" })
  }
  if (product.softixMissing) {
    issues.push({ text: "Ya no está en Softix", section: "info" })
  }
  return issues
}

export function hasReviewIssues(product: AdminProduct): boolean {
  return productReviewIssues(product).length > 0
}
