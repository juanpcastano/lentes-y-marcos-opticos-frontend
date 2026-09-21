import type { AdminProduct } from "#/services/admin"

export interface ReviewIssue {
  text: string
  /** Sección del formulario donde se corrige. */
  section: "info" | "variants"
}

/**
 * Puntos pendientes de revisión de un producto ya en tienda. Se usa en la
 * tabla de `/admin/products` (insignia) y en la ficha del producto (tarjeta
 * con el detalle por sección).
 */
export function productReviewIssues(product: AdminProduct): ReviewIssue[] {
  const issues: ReviewIssue[] = []
  if (!product.productType) issues.push({ text: "Sin tipo", section: "info" })
  if (product.categories.length === 0)
    issues.push({ text: "Sin categorías", section: "info" })
  if (!product.material) issues.push({ text: "Sin material", section: "info" })
  if (!product.shape) issues.push({ text: "Sin forma", section: "info" })
  if (product.variants.length === 0) {
    issues.push({ text: "Sin variantes", section: "variants" })
    return issues
  }
  if (
    product.variants.some(
      (variant) => (variant.color ?? "").trim().toLowerCase() === "varios",
    )
  ) {
    issues.push({ text: "Variante VARIOS", section: "variants" })
  }
  const withoutImages = product.variants.filter(
    (variant) => variant.images.length === 0,
  )
  if (withoutImages.length === product.variants.length) {
    issues.push({ text: "Sin imágenes", section: "variants" })
  } else if (withoutImages.length > 0) {
    const names = withoutImages
      .map((variant) => variant.color || "sin color")
      .slice(0, 3)
      .join(", ")
    issues.push({
      text: `Sin imágenes en: ${names}${withoutImages.length > 3 ? "…" : ""}`,
      section: "variants",
    })
  }
  return issues
}
