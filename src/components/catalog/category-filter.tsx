import { FilterChecklist } from "#/components/catalog/filter-checklist"

interface CategoryFilterProps {
  categories: string[]
  selected: string[]
  onToggle: (category: string) => void
}

export function CategoryFilter({
  categories,
  selected,
  onToggle,
}: CategoryFilterProps) {
  return (
    <FilterChecklist
      items={categories}
      selected={selected}
      onToggle={onToggle}
      idPrefix="category"
      searchPlaceholder="Buscar categoría..."
    />
  )
}
