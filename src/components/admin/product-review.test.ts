import { describe, expect, it } from "vitest"
import { productReviewIssues } from "#/components/admin/product-review"
import type { AdminProduct } from "#/services/admin"

function product(overrides: Partial<AdminProduct>): AdminProduct {
  return {
    id: "prod-1",
    name: " Test 123 Negro",
    brandId: "brand-1",
    brand: "Test",
    material: "Acetato",
    shape: "Redondo",
    description: null,
    productType: "marco_optico",
    categories: ["Hombre"],
    variants: [],
    createdAt: "2026-01-01T00:00:00",
    updatedAt: "2026-01-01T00:00:00",
    ...overrides,
  }
}

describe("productReviewIssues", () => {
  it("marca todo lo faltante en un producto vacío", () => {
    const texts = productReviewIssues(
      product({
        productType: "",
        categories: [],
        material: null,
        shape: null,
      }),
    ).map((issue) => issue.text)
    expect(texts).toEqual([
      "Sin tipo",
      "Sin categorías",
      "Sin material",
      "Sin forma",
      "Sin variantes",
    ])
  })

  it("no marca un producto completo con imágenes", () => {
    const issues = productReviewIssues(
      product({
        variants: [
          {
            id: "v1",
            color: "Negro",
            sku: "S1",
            price: 100000,
            discountPercentage: null,
            discountedPrice: 100000,
            isActive: true,
            images: [
              {
                id: "img1",
                imageUrl: "https://x/y.webp",
                isPrimary: true,
                sortOrder: 1,
              },
            ],
          },
        ],
      }),
    )
    expect(issues).toEqual([])
  })

  it("señala VARIOS y variantes sin imágenes por sección", () => {
    const issues = productReviewIssues(
      product({
        variants: [
          {
            id: "v1",
            color: "Varios",
            sku: "S1",
            price: 100000,
            discountPercentage: null,
            discountedPrice: 100000,
            isActive: true,
            images: [],
          },
          {
            id: "v2",
            color: "Negro",
            sku: "S2",
            price: 100000,
            discountPercentage: null,
            discountedPrice: 100000,
            isActive: true,
            images: [
              {
                id: "img1",
                imageUrl: "https://x/y.webp",
                isPrimary: true,
                sortOrder: 1,
              },
            ],
          },
        ],
      }),
    )
    expect(issues).toEqual([
      { text: "Variante VARIOS", section: "variants" },
      { text: "Sin imágenes en: Varios", section: "variants" },
    ])
  })
})
