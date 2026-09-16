import { FilterChecklist } from "#/components/catalog/filter-checklist"

interface BrandFilterProps {
  brands: string[]
  selected: string[]
  onToggle: (brand: string) => void
}

export function BrandFilter({ brands, selected, onToggle }: BrandFilterProps) {
  return (
    <FilterChecklist
      items={brands}
      selected={selected}
      onToggle={onToggle}
      idPrefix="brand"
      searchPlaceholder="Buscar marca..."
    />
  )
}
