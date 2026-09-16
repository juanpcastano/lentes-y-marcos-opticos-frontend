import { useMemo, useState } from "react"
import { Checkbox } from "#/components/ui/checkbox"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"

interface FilterChecklistProps {
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  idPrefix: string
  searchPlaceholder: string
}

function compareAlphabetical(a: string, b: string): number {
  return a.localeCompare(b, "es-CO", { sensitivity: "base" })
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function FilterChecklist({
  items,
  selected,
  onToggle,
  idPrefix,
  searchPlaceholder,
}: FilterChecklistProps) {
  const [query, setQuery] = useState("")
  // El scroll solo existe en listas largas: con poquitos items se muestra
  // todo sin scrollbar.
  const scrollable = items.length > 7
  const sorted = useMemo(() => [...items].sort(compareAlphabetical), [items])
  const visible = useMemo(() => {
    const needle = normalize(query.trim())
    if (!needle) return sorted
    return sorted.filter((item) => normalize(item).includes(needle))
  }, [sorted, query])

  return (
    <div className="space-y-2">
      {items.length > 6 && (
        <Input
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={searchPlaceholder}
          className="mb-3"
        />
      )}
      <div
        className={
          scrollable ? "max-h-48 space-y-2 overflow-y-auto pr-1" : "space-y-2"
        }
      >
        {visible.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Checkbox
              id={`${idPrefix}-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={() => onToggle(item)}
            />
            <Label
              htmlFor={`${idPrefix}-${item}`}
              className="cursor-pointer text-sm font-normal"
            >
              {item}
            </Label>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin resultados.</p>
        )}
      </div>
    </div>
  )
}
