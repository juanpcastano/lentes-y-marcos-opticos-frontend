import { Checkbox } from "#/components/ui/checkbox"
import { Label } from "#/components/ui/label"

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
    <div className="space-y-2">
      {materials.map((material) => (
        <div key={material} className="flex items-center gap-2">
          <Checkbox
            id={`material-${material}`}
            checked={selected.includes(material)}
            onCheckedChange={() => onToggle(material)}
          />
          <Label
            htmlFor={`material-${material}`}
            className="cursor-pointer text-sm font-normal"
          >
            {material}
          </Label>
        </div>
      ))}
    </div>
  )
}
