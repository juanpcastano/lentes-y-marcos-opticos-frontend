import { Checkbox } from "#/components/ui/checkbox"
import { Label } from "#/components/ui/label"

interface BrandFilterProps {
  brands: string[]
  selected: string[]
  onToggle: (brand: string) => void
}

export function BrandFilter({ brands, selected, onToggle }: BrandFilterProps) {
  return (
    <div className="space-y-2">
      {brands.map((brand) => (
        <div key={brand} className="flex items-center gap-2">
          <Checkbox
            id={`brand-${brand}`}
            checked={selected.includes(brand)}
            onCheckedChange={() => onToggle(brand)}
          />
          <Label
            htmlFor={`brand-${brand}`}
            className="cursor-pointer text-sm font-normal"
          >
            {brand}
          </Label>
        </div>
      ))}
    </div>
  )
}
