import { Slider } from "#/components/ui/slider"
import { formatCop } from "./types"

interface PriceFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceFilter({ min, max, value, onChange }: PriceFilterProps) {
  return (
    <div className="space-y-4 px-1">
      <Slider
        min={min}
        max={max}
        step={10000}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatCop(value[0])}</span>
        <span>{formatCop(value[1])}</span>
      </div>
    </div>
  )
}
