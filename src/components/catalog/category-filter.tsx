import { Checkbox } from "#/components/ui/checkbox"
import { Label } from "#/components/ui/label"

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
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category} className="flex items-center gap-2">
          <Checkbox
            id={`category-${category}`}
            checked={selected.includes(category)}
            onCheckedChange={() => onToggle(category)}
          />
          <Label
            htmlFor={`category-${category}`}
            className="cursor-pointer text-sm font-normal"
          >
            {category}
          </Label>
        </div>
      ))}
    </div>
  )
}
