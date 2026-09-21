import { memo, useMemo, useState } from "react"
import { Card, CardContent } from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import { Switch } from "#/components/ui/switch"
import { Button } from "#/components/ui/button"
import { findNearMiss, isOmitted } from "#/components/admin/import/import-types"
import type { OmissionMap } from "#/components/admin/import/import-types"

export interface OmitCandidate {
  rawName: string
  count: number
  /** Nombre registrado cuando coincide exacto (se reutiliza). */
  suggestedName: string | null
}

interface OmitStepProps {
  itemLabel: string
  itemsLabel: string
  unitLabel: string
  candidates: OmitCandidate[]
  /** Nombres ya registrados (para el aviso de posible coincidencia). */
  existingNames: string[]
  omitted: OmissionMap
  onToggle: (rawName: string, omit: boolean) => void
  onIncludeAll: () => void
  onOmitAll: () => void
  nearMissHint: (existingName: string) => string
}

const PAGE_SIZE = 60

export function OmitStep({
  itemLabel,
  itemsLabel,
  unitLabel,
  candidates,
  existingNames,
  omitted,
  onToggle,
  onIncludeAll,
  onOmitAll,
  nearMissHint,
}: OmitStepProps) {
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const registered = useMemo(
    () => candidates.filter((candidate) => candidate.suggestedName),
    [candidates],
  )
  const fresh = useMemo(
    () => candidates.filter((candidate) => !candidate.suggestedName),
    [candidates],
  )

  const included = candidates.filter(
    (candidate) => !isOmitted(omitted, candidate.rawName),
  ).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <p className="text-sm text-muted-foreground">
          {candidates.length} {itemsLabel} en el Excel · {included} incluidas ·
          lo registrado se reutiliza, lo nuevo se crea con el nombre del Excel
        </p>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <Button variant="outline" size="sm" onClick={onOmitAll}>
            Omitir todas
          </Button>
          <Button variant="outline" size="sm" onClick={onIncludeAll}>
            Incluir todas
          </Button>
        </div>
      </div>
      <Input
        placeholder={`Buscar ${itemLabel}…`}
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setVisibleCount(PAGE_SIZE)
        }}
        className="max-w-sm"
      />
      <OmitSection
        title={`Ya registradas (${registered.length})`}
        empty="Ninguna coincide con el catálogo."
        candidates={registered}
        existingNames={existingNames}
        omitted={omitted}
        search={search}
        visibleCount={visibleCount}
        unitLabel={unitLabel}
        onToggle={onToggle}
        nearMissHint={nearMissHint}
      />
      <OmitSection
        title={`Nuevas — se crearán (${fresh.length})`}
        empty="Nada nuevo: todo coincide con el catálogo."
        candidates={fresh}
        existingNames={existingNames}
        omitted={omitted}
        search={search}
        visibleCount={visibleCount}
        unitLabel={unitLabel}
        onToggle={onToggle}
        nearMissHint={nearMissHint}
      />
      {(() => {
        const query = search.trim().toLowerCase()
        const total = candidates.filter(
          (candidate) =>
            query.length === 0 ||
            candidate.rawName.toLowerCase().includes(query),
        ).length
        return (
          total > visibleCount && (
            <Button
              variant="outline"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Mostrar más ({total - visibleCount} restantes)
            </Button>
          )
        )
      })()}
    </div>
  )
}

const OmitSection = memo(function OmitSection({
  title,
  empty,
  candidates,
  existingNames,
  omitted,
  search,
  visibleCount,
  unitLabel,
  onToggle,
  nearMissHint,
}: {
  title: string
  empty: string
  candidates: OmitCandidate[]
  existingNames: string[]
  omitted: OmissionMap
  search: string
  visibleCount: number
  unitLabel: string
  onToggle: (rawName: string, omit: boolean) => void
  nearMissHint: (existingName: string) => string
}) {
  const query = search.trim().toLowerCase()
  const filtered = candidates.filter(
    (candidate) =>
      query.length === 0 || candidate.rawName.toLowerCase().includes(query),
  )
  const visible = filtered.slice(0, visibleCount)
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((candidate) => (
            <OmitCard
              key={candidate.rawName}
              candidate={candidate}
              nearMiss={
                candidate.suggestedName
                  ? null
                  : findNearMiss(candidate.rawName, existingNames)
              }
              omitted={isOmitted(omitted, candidate.rawName)}
              unitLabel={unitLabel}
              onToggle={onToggle}
              nearMissHint={nearMissHint}
            />
          ))}
        </div>
      )}
    </section>
  )
})

const OmitCard = memo(function OmitCard({
  candidate,
  nearMiss,
  omitted,
  unitLabel,
  onToggle,
  nearMissHint,
}: {
  candidate: OmitCandidate
  nearMiss: string | null
  omitted: boolean
  unitLabel: string
  onToggle: (rawName: string, omit: boolean) => void
  nearMissHint: (existingName: string) => string
}) {
  return (
    <Card className={omitted ? "opacity-70" : ""}>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{candidate.rawName}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {candidate.count} {unitLabel}
          </span>
          {candidate.suggestedName ? (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              Registrada: {candidate.suggestedName}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Nueva
            </span>
          )}
          {omitted && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Se omitirá
            </span>
          )}
        </div>
        {!candidate.suggestedName && nearMiss && (
          <p className="rounded-md border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {nearMissHint(nearMiss)}
          </p>
        )}
        <label className="flex items-center gap-2 text-sm">
          <Switch
            checked={!omitted}
            onCheckedChange={(value) => onToggle(candidate.rawName, !value)}
          />
          {omitted ? "Omitida" : "Incluir"}
        </label>
      </CardContent>
    </Card>
  )
})
