import { BrandFilter } from "#/components/catalog/brand-filter"
import { CategoryFilter } from "#/components/catalog/category-filter"
import { ColorFilter } from "#/components/catalog/color-filter"
import { MaterialFilter } from "#/components/catalog/material-filter"
import { PriceFilter } from "#/components/catalog/price-filter"
import { ShapeFilter } from "#/components/catalog/shape-filter"
import { Button } from "#/components/ui/button"
import { Checkbox } from "#/components/ui/checkbox"
import { Label } from "#/components/ui/label"
import { Skeleton } from "#/components/ui/skeleton"
import { FilterSection } from "#/components/catalog/filter-section"

export interface ProductFilterValues {
  brands: string[]
  categories: string[]
  materials: string[]
  shapes: string[]
  colors: string[]
  priceMin?: number
  priceMax?: number
  onSale?: boolean
  isNew?: boolean
}

interface ProductFilterFieldsProps {
  options: {
    brands: string[]
    categories: string[]
    materials: string[]
    shapes: string[]
    colors: string[]
    priceMin: number
    priceMax: number
  }
  values: ProductFilterValues
  onChange: (values: Partial<ProductFilterValues>) => void
  loadingTaxonomies?: boolean
  loadingFacets?: boolean
}

function FilterChecklistSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-label="Cargando opciones...">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-[5px]" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
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
  loadingTaxonomies = false,
  loadingFacets = false,
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
            colors: [],
            priceMin: undefined,
            priceMax: undefined,
            onSale: undefined,
            isNew: undefined,
          })
        }
      >
        Limpiar filtros
      </Button>

      <FilterSection title="Ofertas y novedades">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-on-sale"
              checked={values.onSale ?? false}
              onCheckedChange={(checked) =>
                onChange({ onSale: checked === true ? true : undefined })
              }
            />
            <Label
              htmlFor="filter-on-sale"
              className="cursor-pointer text-sm font-normal"
            >
              En oferta
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="filter-is-new"
              checked={values.isNew ?? false}
              onCheckedChange={(checked) =>
                onChange({ isNew: checked === true ? true : undefined })
              }
            />
            <Label
              htmlFor="filter-is-new"
              className="cursor-pointer text-sm font-normal"
            >
              Novedades
            </Label>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Marca">
        {loadingTaxonomies ? (
          <FilterChecklistSkeleton />
        ) : (
          <BrandFilter
            brands={options.brands}
            selected={values.brands}
            onToggle={(brand) =>
              onChange({ brands: toggleValue(values.brands, brand) })
            }
          />
        )}
      </FilterSection>

      <FilterSection title="Categoría">
        {loadingTaxonomies ? (
          <FilterChecklistSkeleton rows={6} />
        ) : (
          <CategoryFilter
            categories={options.categories}
            selected={values.categories}
            onToggle={(category) =>
              onChange({ categories: toggleValue(values.categories, category) })
            }
          />
        )}
      </FilterSection>

      <FilterSection title="Material">
        {loadingFacets ? (
          <FilterChecklistSkeleton rows={4} />
        ) : (
          <MaterialFilter
            materials={options.materials}
            selected={values.materials}
            onToggle={(material) =>
              onChange({ materials: toggleValue(values.materials, material) })
            }
          />
        )}
      </FilterSection>

      <FilterSection title="Forma">
        {loadingFacets ? (
          <FilterChecklistSkeleton rows={4} />
        ) : (
          <ShapeFilter
            shapes={options.shapes}
            selected={values.shapes}
            onToggle={(shape) =>
              onChange({ shapes: toggleValue(values.shapes, shape) })
            }
          />
        )}
      </FilterSection>

      <FilterSection title="Color">
        {loadingFacets ? (
          <FilterChecklistSkeleton rows={4} />
        ) : (
          <ColorFilter
            colors={options.colors}
            selected={values.colors}
            onToggle={(color) =>
              onChange({ colors: toggleValue(values.colors, color) })
            }
          />
        )}
      </FilterSection>

      <FilterSection title="Precio">
        {loadingFacets ? (
          <div className="space-y-4 px-1" aria-label="Cargando precio...">
            <Skeleton className="h-2 w-full" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ) : (
          <PriceFilter
            min={options.priceMin}
            max={options.priceMax}
            value={[effectivePriceMin, effectivePriceMax]}
            onChange={([priceMin, priceMax]) =>
              onChange({ priceMin, priceMax })
            }
          />
        )}
      </FilterSection>
    </div>
  )
}
