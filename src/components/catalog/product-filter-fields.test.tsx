// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductFilterFields } from "#/components/catalog/product-filter-fields"

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub

describe("ProductFilterFields", () => {
  it("muestra agotados y ya no muestra la opción En oferta", () => {
    render(
      <ProductFilterFields
        options={{
          brands: ["RAYBAN"],
          categories: ["HOMBRE"],
          materials: [],
          shapes: [],
          colors: ["NEGRO"],
          priceMin: 0,
          priceMax: 100,
        }}
        values={{
          brands: [],
          categories: [],
          materials: [],
          shapes: [],
          colors: [],
        }}
        onChange={() => undefined}
      />,
    )

    expect(screen.getByText("Mostrar agotados")).toBeTruthy()
    expect(screen.queryByText("En oferta")).toBeNull()
    expect(screen.getByText("Novedades")).toBeTruthy()
  })
})
