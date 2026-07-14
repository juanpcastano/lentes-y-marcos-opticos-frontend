import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import createProductsQueryOptions from "#/query-options/products"
import { ProductCard } from "#/components/catalog/product-card"
import { FilterSection } from "#/components/catalog/filter-section"
import { BrandFilter } from "#/components/catalog/brand-filter"
import { PriceFilter } from "#/components/catalog/price-filter"
import { MaterialFilter } from "#/components/catalog/material-filter"
import { ShapeFilter } from "#/components/catalog/shape-filter"
import { CategoryFilter } from "#/components/catalog/category-filter"
import { SortSelect } from "#/components/catalog/sort-select"
import { ResultsCount } from "#/components/catalog/results-count"
import { Button } from "#/components/ui/button"

const catalogSearchSchema = z.object({
  brands: z.array(z.string()).default([]),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  materials: z.array(z.string()).default([]),
  shapes: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  sort: z.enum(["relevance", "price-asc", "price-desc"]).default("relevance"),
})

export const Route = createFileRoute("/_main-layout/catalog")({
  validateSearch: catalogSearchSchema,
  component: CatalogPage,
})

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
]

function CatalogPage() {
  const search = useSearch({ from: "/_main-layout/catalog" })
  const navigate = useNavigate({ from: "/catalog" })

  const { data: products } = useQuery(createProductsQueryOptions())

  const allBrands = useMemo(
    () => Array.from(new Set(products?.map((p) => p.brand) ?? [])).sort(),
    [products],
  )
  const allMaterials = useMemo(
    () => Array.from(new Set(products?.map((p) => p.material) ?? [])).sort(),
    [products],
  )
  const allShapes = useMemo(
    () => Array.from(new Set(products?.map((p) => p.shape) ?? [])).sort(),
    [products],
  )
  const allCategories = useMemo(
    () =>
      Array.from(new Set(products?.flatMap((p) => p.categories) ?? [])).sort(),
    [products],
  )

  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 })

  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map((p) => p.price)
      setPriceBounds({
        min: Math.min(...prices),
        max: Math.max(...prices),
      })
    }
  }, [products])

  const effectivePriceMin = search.priceMin ?? priceBounds.min
  const effectivePriceMax = search.priceMax ?? priceBounds.max

  const filteredProducts = useMemo(() => {
    if (!products) return []

    return products.filter((product) => {
      if (search.brands.length > 0 && !search.brands.includes(product.brand)) {
        return false
      }
      if (
        search.materials.length > 0 &&
        !search.materials.includes(product.material)
      ) {
        return false
      }
      if (search.shapes.length > 0 && !search.shapes.includes(product.shape)) {
        return false
      }
      if (
        search.categories.length > 0 &&
        !search.categories.some((c) => product.categories.includes(c))
      ) {
        return false
      }
      if (
        product.price < effectivePriceMin ||
        product.price > effectivePriceMax
      ) {
        return false
      }
      return true
    })
  }, [products, search, effectivePriceMin, effectivePriceMax])

  const sortedProducts = useMemo(() => {
    if (search.sort === "relevance") return filteredProducts
    return [...filteredProducts].sort((a, b) => {
      if (search.sort === "price-asc") return a.price - b.price
      if (search.sort === "price-desc") return b.price - a.price
      return 0
    })
  }, [filteredProducts, search.sort])

  const updateSearch = (partial: Partial<typeof search>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...partial,
      }),
      resetScroll: false,
    })
  }

  const toggleArray = (
    key: "brands" | "materials" | "shapes" | "categories",
    value: string,
  ) => {
    const current = search[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateSearch({ [key]: next })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">Catálogo</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Encuentra el marco perfecto para tu visión.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                updateSearch({
                  brands: [],
                  priceMin: undefined,
                  priceMax: undefined,
                  materials: [],
                  shapes: [],
                  categories: [],
                })
              }
            >
              Limpiar filtros
            </Button>

            <FilterSection title="Marca">
              <BrandFilter
                brands={allBrands}
                selected={search.brands}
                onToggle={(b) => toggleArray("brands", b)}
              />
            </FilterSection>

            <FilterSection title="Categoría">
              <CategoryFilter
                categories={allCategories}
                selected={search.categories}
                onToggle={(c) => toggleArray("categories", c)}
              />
            </FilterSection>

            <FilterSection title="Material">
              <MaterialFilter
                materials={allMaterials}
                selected={search.materials}
                onToggle={(m) => toggleArray("materials", m)}
              />
            </FilterSection>

            <FilterSection title="Forma">
              <ShapeFilter
                shapes={allShapes}
                selected={search.shapes}
                onToggle={(s) => toggleArray("shapes", s)}
              />
            </FilterSection>

            <FilterSection title="Precio">
              <PriceFilter
                min={priceBounds.min}
                max={priceBounds.max}
                value={[effectivePriceMin, effectivePriceMax]}
                onChange={(v) =>
                  updateSearch({ priceMin: v[0], priceMax: v[1] })
                }
              />
            </FilterSection>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <ResultsCount
              visible={sortedProducts.length}
              total={products?.length ?? 0}
            />
            <SortSelect
              options={SORT_OPTIONS}
              value={search.sort}
              onChange={(v) => updateSearch({ sort: v as typeof search.sort })}
            />
          </div>

          {sortedProducts.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No se encontraron productos con los filtros seleccionados.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
