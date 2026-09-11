import { BrandFilter } from "#/components/catalog/brand-filter"
import { CategoryFilter } from "#/components/catalog/category-filter"
import { MaterialFilter } from "#/components/catalog/material-filter"
import { PriceFilter } from "#/components/catalog/price-filter"
import { ShapeFilter } from "#/components/catalog/shape-filter"
import { Button } from "#/components/ui/button"
import { FilterSection } from "#/components/catalog/filter-section"

export interface ProductFilterValues {
  brands: string[]
  categories: string[]
  materials: string[]
  shapes: string[]
  priceMin?: number
  priceMax?: number
}

interface ProductFilterFieldsProps {
  options: {
    brands: string[]
    categories: string[]
    materials: string[]
    shapes: string[]
    priceMin: number
    priceMax: number
  }
  values: ProductFilterValues
  onChange: (values: Partial<ProductFilterValues>) => void
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function ProductFilterFields({
  options,
  values,
  onChange,
}: ProductFilterFieldsProps) {
  const effectivePriceMin = values.priceMin ?? options.priceMin
  const effectivePriceMax = values.priceMax ?? options.priceMax

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          onChange({
            brands: [],
            categories: [],
            materials: [],
            shapes: [],
            priceMin: undefined,
            priceMax: undefined,
          })
        }
      >
        Limpiar filtros
      </Button>

      <FilterSection title="Marca">
        <BrandFilter
          brands={options.brands}
          selected={values.brands}
          onToggle={(brand) =>
            onChange({ brands: toggleValue(values.brands, brand) })
          }
        />
      </FilterSection>

      <FilterSection title="Categoría">
        <CategoryFilter
          categories={options.categories}
          selected={values.categories}
          onToggle={(category) =>
            onChange({ categories: toggleValue(values.categories, category) })
          }
        />
      </FilterSection>

      <FilterSection title="Material">
        <MaterialFilter
          materials={options.materials}
          selected={values.materials}
          onToggle={(material) =>
            onChange({ materials: toggleValue(values.materials, material) })
          }
        />
      </FilterSection>

      <FilterSection title="Forma">
        <ShapeFilter
          shapes={options.shapes}
          selected={values.shapes}
          onToggle={(shape) =>
            onChange({ shapes: toggleValue(values.shapes, shape) })
          }
        />
      </FilterSection>

      <FilterSection title="Precio">
        <PriceFilter
          min={options.priceMin}
          max={options.priceMax}
          value={[effectivePriceMin, effectivePriceMax]}
          onChange={([priceMin, priceMax]) => onChange({ priceMin, priceMax })}
        />
      </FilterSection>
    </div>
  )
}
