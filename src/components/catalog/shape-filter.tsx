import { FilterChecklist } from "#/components/catalog/filter-checklist"

interface ShapeFilterProps {
  shapes: string[]
  selected: string[]
  onToggle: (shape: string) => void
}

export function ShapeFilter({ shapes, selected, onToggle }: ShapeFilterProps) {
  return (
    <FilterChecklist
      items={shapes}
      selected={selected}
      onToggle={onToggle}
      idPrefix="shape"
      searchPlaceholder="Buscar forma..."
    />
  )
}
