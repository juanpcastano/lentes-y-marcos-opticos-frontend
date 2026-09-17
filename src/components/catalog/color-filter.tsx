import { FilterChecklist } from "#/components/catalog/filter-checklist"

interface ColorFilterProps {
  colors: string[]
  selected: string[]
  onToggle: (color: string) => void
}

export function ColorFilter({ colors, selected, onToggle }: ColorFilterProps) {
  return (
    <FilterChecklist
      items={colors}
      selected={selected}
      onToggle={onToggle}
      idPrefix="color"
      searchPlaceholder="Buscar color..."
    />
  )
}
