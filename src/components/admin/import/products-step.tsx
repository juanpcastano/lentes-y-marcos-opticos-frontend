import { memo, useCallback, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent } from "#/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible"
import { Input } from "#/components/ui/input"
import { Switch } from "#/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs"
import type {
  OmissionMap,
  WizardGroup,
  WizardState,
  WizardVariant,
} from "#/components/admin/import/import-types"
import {
  findNearMiss,
  groupLinkedProductId,
  groupLinkedProductName,
  groupVariants,
  importableVariants,
  isCombinedColor,
  isOmitted,
  isUnresolvedColor,
  isVariosColor,
  pricedVariants,
  splitStoreAddedCategories,
} from "#/components/admin/import/import-types"
import type { InventoryRowStatus } from "#/services/admin"

const statusLabels: Record<InventoryRowStatus, string> = {
  NUEVO: "Nueva",
  ACTUALIZAR: "Actualizada",
  SIN_CAMBIOS: "Sin cambios",
  // Legado (el preview ya no lo emite): se muestra como actualizada.
  CONFLICTO: "Actualizada",
  ERROR: "Error",
}

const statusStyles: Record<InventoryRowStatus, string> = {
  NUEVO:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  ACTUALIZAR: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  SIN_CAMBIOS: "bg-muted text-muted-foreground",
  CONFLICTO: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  ERROR: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  marco_optico: "Marco óptico",
  gafa_sol: "Gafa de sol",
  producto_oftalmico: "Producto oftálmico",
  lente_contacto: "Lente de contacto",
  accesorio: "Accesorio",
}

interface ProductsStepProps {
  brandRaws: string[]
  state: WizardState
  omittedProducts: OmissionMap
  omittedVariants: OmissionMap
  onToggleProduct: (groupId: string, omit: boolean) => void
  onToggleVariant: (rowKey: string, omit: boolean) => void
  /** Nombres en tienda (para el aviso de posible coincidencia en nuevos). */
  storeProductNames: string[]
}

export function ProductsStep({
  brandRaws,
  state,
  omittedProducts,
  omittedVariants,
  onToggleProduct,
  onToggleVariant,
  storeProductNames,
}: ProductsStepProps) {
  const [activeBrand, setActiveBrand] = useState(brandRaws[0] ?? "")
  const [search, setSearch] = useState("")
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const currentBrand = brandRaws.includes(activeBrand)
    ? activeBrand
    : (brandRaws[0] ?? "")

  const brandGroups = useMemo(() => {
    const query = search.trim().toLowerCase()
    return state.groups
      .filter((group) => {
        if (group.brandRaw !== currentBrand) return false
        if (query.length === 0) return true
        if (group.name.toLowerCase().includes(query)) return true
        return groupVariants(group, state.variants).some(
          (variant) =>
            variant.sku.toLowerCase().includes(query) ||
            variant.color.toLowerCase().includes(query),
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name, "es"))
  }, [state.groups, state.variants, currentBrand, search])

  const newGroups = useMemo(
    () =>
      brandGroups.filter(
        (group) => !groupLinkedProductId(group, state.variants),
      ),
    [brandGroups, state.variants],
  )
  const updateGroups = useMemo(
    () =>
      brandGroups.filter((group) =>
        groupLinkedProductId(group, state.variants),
      ),
    [brandGroups, state.variants],
  )

  const toggleOpen = useCallback((id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const tabCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const group of state.groups) {
      counts.set(
        group.brandRaw,
        (counts.get(group.brandRaw) ?? 0) + group.variantKeys.length,
      )
    }
    return counts
  }, [state.groups, state.variants])

  const allOpen =
    brandGroups.length > 0 && brandGroups.every((group) => openGroups[group.id])

  function renderGroup(group: WizardGroup, nearMiss: boolean) {
    return (
      <GroupCard
        key={group.id}
        group={group}
        variants={state.variants}
        open={!!openGroups[group.id]}
        omitted={isOmitted(omittedProducts, group.id)}
        omittedVariants={omittedVariants}
        nearMissName={
          nearMiss ? findNearMiss(group.name, storeProductNames) : null
        }
        onToggleOpen={toggleOpen}
        onToggleProduct={onToggleProduct}
        onToggleVariant={onToggleVariant}
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Esto es lo que se va a subir, tal cual viene en el Excel: no se puede
        corregir nada aquí. Revisa las advertencias y omite lo que no deba
        entrar. «Nueva» se crea; «Actualizada» aplica los datos del Excel sobre
        la tienda (las categorías se suman, nunca se quitan).
      </p>
      <Tabs value={currentBrand} onValueChange={setActiveBrand}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 group-data-horizontal/tabs:h-auto">
          {brandRaws.map((raw) => (
            <TabsTrigger
              key={raw}
              value={raw}
              className="h-8 flex-none bg-muted data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              {raw} ({tabCounts.get(raw) ?? 0})
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            placeholder="Buscar producto o SKU…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="sm:ml-auto"
            onClick={() => {
              if (allOpen) {
                setOpenGroups({})
              } else {
                setOpenGroups(
                  Object.fromEntries(
                    brandGroups.map((group) => [group.id, true]),
                  ),
                )
              }
            }}
          >
            {allOpen ? "Colapsar todo" : "Expandir todo"}
          </Button>
        </div>
        <TabsContent value={currentBrand} className="mt-4 space-y-3">
          {newGroups.length > 0 && (
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Nuevos ({newGroups.length})
            </p>
          )}
          {newGroups.map((group) => renderGroup(group, true))}
          {updateGroups.length > 0 && (
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              A actualizar ({updateGroups.length})
            </p>
          )}
          {updateGroups.map((group) => renderGroup(group, false))}
          {brandGroups.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sin productos para este filtro en {currentBrand}.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

const GroupCard = memo(function GroupCard({
  group,
  variants,
  open,
  omitted,
  omittedVariants,
  nearMissName,
  onToggleOpen,
  onToggleProduct,
  onToggleVariant,
}: {
  group: WizardGroup
  variants: Record<string, WizardVariant>
  open: boolean
  omitted: boolean
  omittedVariants: OmissionMap
  nearMissName: string | null
  onToggleOpen: (id: string) => void
  onToggleProduct: (groupId: string, omit: boolean) => void
  onToggleVariant: (rowKey: string, omit: boolean) => void
}) {
  const allVariants = useMemo(
    () =>
      groupVariants(group, variants).sort((a, b) =>
        a.sku.localeCompare(b.sku, "es"),
      ),
    [group, variants],
  )
  const priced = useMemo(
    () => pricedVariants(group, variants),
    [group, variants],
  )
  const importable = useMemo(
    () => importableVariants(group, variants, omittedVariants),
    [group, variants, omittedVariants],
  )
  const noPrice = allVariants.length - priced.length
  const linked = groupLinkedProductId(group, variants)
  const linkedName = groupLinkedProductName(group, variants)
  const storeCategories = useMemo(() => {
    for (const variant of allVariants) {
      if (variant.existingCategories) return variant.existingCategories
    }
    return null
  }, [allVariants])
  const categorySplit =
    linked && storeCategories !== null
      ? splitStoreAddedCategories(storeCategories, group.categoryRaws)
      : null
  const needsReview = allVariants.some((variant) => variant.needsColorReview)
  const newCount = importable.filter(
    (variant) => variant.status === "NUEVO",
  ).length
  const updateCount = importable.filter(
    (variant) => variant.status !== "NUEVO" && variant.status !== "SIN_CAMBIOS",
  ).length

  return (
    <div id={`wizard-group-${group.id}`} className="scroll-mt-24">
      <Card className={omitted ? "opacity-70" : undefined}>
        <Collapsible open={open} onOpenChange={() => onToggleOpen(group.id)}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-3 text-left">
            <ChevronDown
              className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            />
            <span className="min-w-0 flex-1 truncate font-medium">
              {group.name || "Sin nombre"}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">
              {allVariants.length}{" "}
              {allVariants.length === 1 ? "variante" : "variantes"}
            </span>
            {newCount > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs whitespace-nowrap text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {newCount} nueva{newCount === 1 ? "" : "s"}
              </span>
            )}
            {updateCount > 0 && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs whitespace-nowrap text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {updateCount} actualizada{updateCount === 1 ? "" : "s"}
              </span>
            )}
            {needsReview && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs whitespace-nowrap text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Revisar color
              </span>
            )}
            {linked && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs whitespace-nowrap text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                En tienda
              </span>
            )}
            {(omitted || importable.length === 0) && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">
                Se omitirá
              </span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 border-t pt-4">
              <div className="flex flex-wrap gap-2 items-center text-sm">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  Marca: {group.brandRaw || "Sin marca"}
                </span>
                {group.productType && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {PRODUCT_TYPE_LABELS[group.productType] ??
                      group.productType}
                  </span>
                )}
                {categorySplit && categorySplit.added.length > 0 ? (
                  <span className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      En tienda:{" "}
                      {categorySplit.store.length === 0 ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          Sin categorías
                        </span>
                      ) : (
                        categorySplit.store.map((raw) => (
                          <span
                            key={raw}
                            className="mr-1 rounded-full bg-muted px-2 py-0.5 text-xs"
                          >
                            {raw}
                          </span>
                        ))
                      )}
                    </span>
                    {categorySplit.added.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Se agregará:{" "}
                        {categorySplit.added.map((raw) => (
                          <span
                            key={raw}
                            className="mr-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            {raw}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                ) : (
                  <>
                    {group.categoryRaws.map((raw) => (
                      <span
                        key={raw}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs"
                      >
                        {raw}
                      </span>
                    ))}
                    {group.categoryRaws.length === 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Sin categoría
                      </span>
                    )}
                  </>
                )}
              </div>
              {linked &&
                linkedName &&
                linkedName.trim() !== group.name.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Registrado en tienda: {linkedName}
                  </p>
                )}
              {!linked && nearMissName && (
                <p className="rounded-md border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Este producto nuevo parece coincidir con «{nearMissName}», ya
                  registrado en el sistema: si continúas se importará como un
                  producto diferente.
                </p>
              )}
              {noPrice > 0 && (
                <p className="rounded-md border border-amber-400/40 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {noPrice} {noPrice === 1 ? "variante" : "variantes"} sin
                  precio en el Excel:{" "}
                  {noPrice === 1 ? "se omitirá" : "se omitirán"}.
                </p>
              )}
              <div className="space-y-2">
                {allVariants.map((variant) => (
                  <VariantRow
                    key={variant.rowKey}
                    variant={variant}
                    omitted={
                      omitted || isOmitted(omittedVariants, variant.rowKey)
                    }
                    onToggleVariant={onToggleVariant}
                  />
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={!omitted}
                  onCheckedChange={(value) => onToggleProduct(group.id, !value)}
                />
                {omitted ? "Omitido" : "Incluir"}
              </label>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
})

/** Líneas de qué cambia en la tienda, una por aspecto (";" las separa). */
export function formatChangeLines(detail: string): string[] {
  const marker = "Se actualizará:"
  const index = detail.indexOf(marker)
  const list = index >= 0 ? detail.slice(index + marker.length) : detail
  return list
    .split(";")
    .map((part) => formatPriceNumbers(part.trim()))
    .filter((part) => part.length > 0)
}

function formatPriceNumbers(text: string): string {
  return text.replace(/precio \(?(\d+) → (\d+)\)?/g, (_match, a, b) => {
    const fmt = (n: string) => Number(n).toLocaleString("es-CO")
    return `precio $${fmt(a)} → $${fmt(b)}`
  })
}

function colorNote(color: string): string | null {
  if (isUnresolvedColor(color)) return "Se importará como «Único»."
  if (isVariosColor(color))
    return "VARIOS: se importará tal cual como «Varios»."
  if (isCombinedColor(color))
    return `Color combinado: se importará tal cual como «${color.trim()}».`
  return null
}

const VariantRow = memo(function VariantRow({
  variant,
  omitted,
  onToggleVariant,
}: {
  variant: WizardVariant
  omitted: boolean
  onToggleVariant: (rowKey: string, omit: boolean) => void
}) {
  const note = colorNote(variant.color)
  const noPrice = !Number.isFinite(variant.basePrice) || variant.basePrice <= 0
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs">{variant.sku}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[variant.status]}`}
        >
          {statusLabels[variant.status]}
        </span>
        {noPrice && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Sin precio — se omitirá
          </span>
        )}
        {omitted && !noPrice && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Se omitirá
          </span>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-xs">
          <Switch
            checked={!omitted}
            onCheckedChange={(value) => onToggleVariant(variant.rowKey, !value)}
          />
          {omitted ? "Omitida" : "Incluir"}
        </label>
      </div>
      <span className="block truncate text-xs text-muted-foreground">
        {variant.excelName} · {variant.sheet} fila {variant.rowNumber}
      </span>
      <span className="block text-xs">
        Color: {variant.color || "—"}
        {variant.excelColor !== variant.color && (
          <span className="text-muted-foreground">
            {" "}
            (Excel: {variant.excelColor})
          </span>
        )}
        {" · "}
        Precio:{" "}
        {noPrice
          ? "sin precio"
          : `$${variant.basePrice.toLocaleString("es-CO")}`}
      </span>
      {note && (
        <span className="block text-xs text-amber-700 dark:text-amber-300">
          {note}
        </span>
      )}
      {variant.status === "ACTUALIZAR" && variant.detail && (
        <div className="text-xs">
          <span className="font-medium">Se actualizará:</span>
          <ul className="mt-0.5 space-y-0.5 list-none pl-0">
            {formatChangeLines(variant.detail).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})
