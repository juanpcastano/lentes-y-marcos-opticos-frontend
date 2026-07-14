import { Checkbox } from "#/components/ui/checkbox"
import { Label } from "#/components/ui/label"

interface ShapeFilterProps {
  shapes: string[]
  selected: string[]
  onToggle: (shape: string) => void
}

export function ShapeFilter({ shapes, selected, onToggle }: ShapeFilterProps) {
  return (
    <div className="space-y-2">
      {shapes.map((shape) => (
        <div key={shape} className="flex items-center gap-2">
          <Checkbox
            id={`shape-${shape}`}
            checked={selected.includes(shape)}
            onCheckedChange={() => onToggle(shape)}
          />
          <Label
            htmlFor={`shape-${shape}`}
            className="cursor-pointer text-sm font-normal"
          >
            {shape}
          </Label>
        </div>
      ))}
    </div>
  )
}
