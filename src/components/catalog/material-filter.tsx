import { FilterChecklist } from "#/components/catalog/filter-checklist"

interface MaterialFilterProps {
  materials: string[]
  selected: string[]
  onToggle: (material: string) => void
}

export function MaterialFilter({
  materials,
  selected,
  onToggle,
}: MaterialFilterProps) {
  return (
    <FilterChecklist
      items={materials}
      selected={selected}
      onToggle={onToggle}
      idPrefix="material"
      searchPlaceholder="Buscar material..."
    />
  )
}
