import { useEffect, useMemo, useRef, useState } from "react"
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

// Cuántos se renderizan de entrada: montar cientos de checkboxes de golpe
// (p. ej. ~400 marcas) congela el hilo principal en gama baja. El resto se
// carga solo al scrollear hasta el final de la lista.
const PAGE_SIZE = 12
const PAGE_STEP = 25

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
  const [shown, setShown] = useState(PAGE_SIZE)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShown(PAGE_SIZE)
  }, [query, items])

  // Las seleccionadas siempre van primero para que nunca queden ocultas
  // tras el corte de paginación.
  const sorted = useMemo(() => {
    const selectedSet = new Set(selected)
    return [...items].sort((a, b) => {
      const rankA = selectedSet.has(a) ? 0 : 1
      const rankB = selectedSet.has(b) ? 0 : 1
      if (rankA !== rankB) return rankA - rankB
      return compareAlphabetical(a, b)
    })
  }, [items, selected])

  const filtered = useMemo(() => {
    const needle = normalize(query.trim())
    if (!needle) return sorted
    return sorted.filter((item) => normalize(item).includes(needle))
  }, [sorted, query])

  const visible = filtered.slice(0, shown)
  const remaining = filtered.length - visible.length

  // Al llegar al final del scroll se revelan más opciones automáticamente.
  useEffect(() => {
    const sentinel = sentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root || remaining <= 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown((count) => count + PAGE_STEP)
        }
      },
      { root, rootMargin: "100px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [remaining, visible.length])

  // El scroll solo existe en listas largas: con poquitos items se muestra
  // todo sin scrollbar.
  const scrollable = filtered.length > 7

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
        ref={scrollRef}
        className={
          scrollable ? "max-h-48 space-y-2 overflow-y-auto pr-1" : "space-y-2"
        }
      >
        {visible.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 [content-visibility:auto] [contain-intrinsic-size:auto_28px]"
          >
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
        {remaining > 0 && <div ref={sentinelRef} aria-hidden="true" />}
      </div>
    </div>
  )
}
