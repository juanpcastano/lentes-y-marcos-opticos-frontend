import { useEffect, useState } from "react"

import { Slider } from "#/components/ui/slider"
import { formatCop } from "./types"

interface PriceFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceFilter({ min, max, value, onChange }: PriceFilterProps) {
  const [draftValue, setDraftValue] = useState(value)

  useEffect(() => {
    setDraftValue(value)
  }, [value[0], value[1]])

  return (
    <div className="space-y-4 px-1">
      <Slider
        min={min}
        max={max}
        step={10000}
        value={draftValue}
        onValueChange={(v) => setDraftValue(v as [number, number])}
        onValueCommit={(v) => onChange(v as [number, number])}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatCop(draftValue[0])}</span>
        <span>{formatCop(draftValue[1])}</span>
      </div>
    </div>
  )
}
