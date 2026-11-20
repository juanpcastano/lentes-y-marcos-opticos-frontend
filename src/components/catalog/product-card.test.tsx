// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { ProductCard } from "#/components/catalog/product-card"
import { productTitle } from "#/components/catalog/types"
import type { CatalogProduct } from "#/components/catalog/types"

const product: CatalogProduct = {
  id: "abc-123",
  imageUrl: null,
  name: "M1",
  brand: "RAYBAN",
  reference: "00001",
  color: "Cafe",
  price: 193277.31,
  stock: 5,
  material: "Metálica",
  shape: null,
  categories: ["Mercancia"],
  badge: null,
}

async function renderCard(item: CatalogProduct) {
  const rootRoute = createRootRoute()
  const catalogRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/catalog",
    component: () => <ProductCard product={item} />,
  })
  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/product/$id",
    component: () => null,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([catalogRoute, productRoute]),
    history: createMemoryHistory({ initialEntries: ["/catalog"] }),
  })
  await router.load()
  return render(<RouterProvider router={router} />)
}

describe("ProductCard", () => {
  it("enlaza a /product/<id> y no a undefined", async () => {
    await renderCard(product)
    const link = screen.getByRole("link", { name: "Ver detalle" })
    expect(link.getAttribute("href")).toBe("/product/abc-123")
    expect(link.getAttribute("href")).not.toContain("undefined")
  })

  it("muestra el título con marca, nombre, referencia y color", async () => {
    expect(productTitle(product)).toBe("RAYBAN M1 00001 Cafe")
    await renderCard(product)
    expect(screen.getAllByText("RAYBAN M1 00001 Cafe").length).toBeGreaterThan(
      0,
    )
  })
})
