import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Checkbox } from "#/components/ui/checkbox"
import { Input } from "#/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible"
import { toast } from "#/hooks/use-toast"
import {
  ADMIN_PRODUCTS_QUERY_KEY,
  ADMIN_SYNC_RUNS_QUERY_KEY,
} from "#/query-options/admin"
import {
  adminErrorMessage,
  fetchSoftixConnection,
  fetchSoftixImportPreview,
  getSoftixSyncRun,
  ignoreBrand,
  ignoreSku,
  runSoftixImport,
  unignoreBrand,
  unignoreSku,
} from "#/services/admin"
import type { SyncRun } from "#/services/admin"
import {
  SYNC_STATUS_CLASSES,
  SYNC_STATUS_LABELS,
} from "#/components/admin/integration/sync-labels"

const STEPS = ["Conexión", "Marcas", "Productos", "Vista previa", "Resultado"] as const

type Props = {
  onViewLogs: () => void
}

/** Asistente de importación: marcas → productos → vista previa → resultado. */
export function ImportWizard({ onViewLogs }: Props) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [lastRun, setLastRun] = useState<SyncRun | null>(null)
  const [brandSearch, setBrandSearch] = useState("")
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set())
  const [activeBrand, setActiveBrand] = useState<string | null>(null)
  const [maxStep, setMaxStep] = useState(0)

  const connection = useQuery({
    queryKey: ["admin", "integration", "connection"],
    queryFn: fetchSoftixConnection,
    enabled: step === 0,
    retry: false,
  })

  const preview = useQuery({
    queryKey: ["admin", "integration", "import-preview"],
    queryFn: fetchSoftixImportPreview,
    enabled: step >= 1 && step <= 3,
    retry: false,
  })

  const detail = useQuery({
    queryKey: ["admin", "integration", "runs", lastRun?.id],
    queryFn: () => getSoftixSyncRun(lastRun!.id),
    enabled: step === 4 && !!lastRun,
    retry: false,
  })

  const run = useMutation({
    mutationFn: runSoftixImport,
    onSuccess: async (r) => {
      setLastRun(r)
      setStep(4)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_SYNC_RUNS_QUERY_KEY }),
      ])
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({ queryKey: ADMIN_SYNC_RUNS_QUERY_KEY })
      toast({ variant: "destructive", title: adminErrorMessage(error) })
    },
  })

  function restart() {
    setLastRun(null)
    setStep(0)
    setMaxStep(0)
  }

  const data = preview.data

  // included brands = brands present in newSkus that are not ignored as brand
  const includedBrands = Array.from(
    new Set(
      (data?.newSkus ?? [])
        .map((s) => s.brand)
        .filter((b): b is string => !!b && !(data?.ignoredBrands ?? []).includes(b)),
    ),
  ).sort()

  if (activeBrand === null && includedBrands.length > 0) {
    // default active brand
  }

  const currentBrand = activeBrand ?? (includedBrands.length > 0 ? includedBrands[0] : null)

  const filteredBrands = Array.from(
    new Set((data?.newSkus ?? []).map((s) => s.brand).filter(Boolean)),
  )
    .sort()
    .filter((b) =>
      String(b).toLowerCase().includes(brandSearch.trim().toLowerCase()),
    ) as string[]

  const allSelected =
    filteredBrands.length > 0 &&
    filteredBrands.every((b) => selectedBrands.has(b))

  const toggleSelectAll = () => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (allSelected) filteredBrands.forEach((b) => next.delete(b))
      else filteredBrands.forEach((b) => next.add(b))
      return next
    })
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev)
      if (next.has(brand)) next.delete(brand)
      else next.add(brand)
      return next
    })
  }

  const ignoreSelectedBrands = async () => {
    await Promise.all([...selectedBrands].map((b) => ignoreBrand(b)))
    setSelectedBrands(new Set())
    await queryClient.invalidateQueries({
      queryKey: ["admin", "integration", "import-preview"],
    })
  }

  const includeSelectedBrands = async () => {
    await Promise.all([...selectedBrands].map((b) => unignoreBrand(b)))
    setSelectedBrands(new Set())
    await queryClient.invalidateQueries({
      queryKey: ["admin", "integration", "import-preview"],
    })
  }

  const toggleSkuIgnored = async (sku: string, ignored: boolean) => {
    if (ignored) await unignoreSku(sku)
    else await ignoreSku(sku)
    await queryClient.invalidateQueries({
      queryKey: ["admin", "integration", "import-preview"],
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar productos desde Softix</CardTitle>
        <CardDescription>
          Crea los SKUs nuevos de Softix y sincroniza todo el catálogo.
        </CardDescription>
        <ol className="mt-4 flex flex-wrap gap-2 text-sm">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                disabled={index > maxStep || step === STEPS.length - 1}
                onClick={() =>
                  step !== STEPS.length - 1 &&
                  index <= maxStep &&
                  setStep(index)
                }
                className={
                  step === STEPS.length - 1 && index !== STEPS.length - 1
                    ? "rounded-full border px-3 py-1 text-muted-foreground opacity-50"
                    : index === step
                      ? "rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                      : index <= maxStep
                        ? "rounded-full bg-muted px-3 py-1 text-foreground hover:bg-muted/80"
                        : "rounded-full border px-3 py-1 text-muted-foreground opacity-50"
                }
              >
                {index + 1}. {label}
              </button>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2">
          {step === 0 && (
            <>
              <Button
                variant="outline"
                disabled={connection.isFetching}
                onClick={() => connection.refetch()}
              >
                <RefreshCw className="size-4" />
                Verificar de nuevo
              </Button>
              <Button
                disabled={!connection.data?.connected || connection.isFetching}
                onClick={() => {
                  setStep(1)
                  setMaxStep((m) => Math.max(m, 1))
                }}
              >
                Siguiente
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button variant="outline" onClick={() => setStep(0)}>
                Atrás
              </Button>
              <Button
                variant="outline"
                disabled={preview.isFetching}
                onClick={() => preview.refetch()}
              >
                <RefreshCw className="size-4" />
                Actualizar vista previa
              </Button>
              <Button
                disabled={!data || preview.isFetching}
                onClick={() => {
                  setStep(2)
                  setMaxStep((m) => Math.max(m, 2))
                }}
              >
                Siguiente
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Atrás
              </Button>
              <Button
                variant="outline"
                disabled={preview.isFetching}
                onClick={() => preview.refetch()}
              >
                <RefreshCw className="size-4" />
                Actualizar vista previa
              </Button>
              <Button
                disabled={!data || preview.isFetching}
                onClick={() => {
                  setStep(3)
                  setMaxStep((m) => Math.max(m, 3))
                }}
              >
                Siguiente
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>
                Atrás
              </Button>
              <Button
                variant="outline"
                disabled={preview.isFetching}
                onClick={() => preview.refetch()}
              >
                <RefreshCw className="size-4" />
                Actualizar vista previa
              </Button>
              <Button
                disabled={!data || preview.isFetching || run.isPending}
                onClick={() => run.mutate()}
              >
                {run.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Importar y sincronizar
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {step === 0 && (
          <>
            <div className="flex flex-col items-center gap-3 py-6">
              {connection.isFetching ? (
                <Loader2 className="size-12 animate-spin text-muted-foreground" />
              ) : connection.data?.connected ? (
                <CheckCircle2 className="size-12 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="size-12 text-destructive" />
              )}
              <p
                className={`text-sm ${
                  connection.isFetching
                    ? "text-muted-foreground"
                    : connection.data?.connected
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive"
                }`}
              >
                {connection.isFetching
                  ? "Verificando conexión con Softix…"
                  : connection.data?.message ??
                    "No fue posible verificar la conexión con Softix."}
              </p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            {preview.isFetching && !data ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Calculando importación…
              </p>
            ) : preview.isError ? (
              <p className="text-sm text-destructive">
                {adminErrorMessage(preview.error)}
              </p>
            ) : data ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Marcas detectadas en los SKUs nuevos. Selecciona las que quieras
                  ignorar.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Buscar marca…"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                    Seleccionar todo
                  </label>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedBrands.size === 0}
                      onClick={() => ignoreSelectedBrands()}
                    >
                      Ignorar ({selectedBrands.size})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedBrands.size === 0}
                      onClick={() => includeSelectedBrands()}
                    >
                      Incluir ({selectedBrands.size})
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {filteredBrands.map((brand) => {
                    const ignored = (data.ignoredBrands).includes(brand)
                    const count = data.newSkus.filter(
                      (s) => s.brand === brand,
                    ).length
                    return (
                      <label
                        key={brand}
                        className={`flex items-center justify-between gap-3 rounded-md border p-3 ${
                          ignored ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedBrands.has(brand)}
                            onCheckedChange={() => toggleBrand(brand)}
                          />
                          <div>
                            <p className="font-medium">{brand}</p>
                            <p className="text-xs text-muted-foreground">
                              {count} SKUs nuevos
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            ignored
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {ignored ? "Ignorada" : "Incluida"}
                        </span>
                      </label>
                    )
                  })}
                </div>
                {filteredBrands.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No hay marcas que coincidan.
                  </p>
                )}
              </>
            ) : null}
          </>
        )}

        {step === 2 && (
          <>
            {preview.isFetching && !data ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Calculando importación…
              </p>
            ) : preview.isError ? (
              <p className="text-sm text-destructive">
                {adminErrorMessage(preview.error)}
              </p>
            ) : data ? (
              <>
                <p className="text-sm text-muted-foreground">
                  SKUs a importar por marca incluida. Desmarca los que quieras
                  ignorar individualmente.
                </p>
                <div className="flex flex-wrap gap-2">
                  {includedBrands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setActiveBrand(b)}
                      className={`rounded-full border px-3 py-1 text-sm ${
                        currentBrand === b
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {includedBrands.map((b) => {
                  if (b !== currentBrand) return null
                  // show all skus of brand; mark sku-ignored
                  const brandSkus = data.newSkus.filter((s) => s.brand === b)
                  return (
                    <div key={b} className="mt-4 grid gap-2">
                          {brandSkus.map((sku) => {
                            const skuIgnored = (data.ignoredSkus).includes(
                              sku.sku,
                            )
                            const brandIgnored = (data.ignoredBrands).includes(
                              b,
                            )
                            const blocked = sku.blocked
                            return (
                              <label
                                key={sku.sku}
                                className={`flex items-center justify-between gap-3 rounded-md border p-3 ${
                                  blocked
                                    ? "opacity-50"
                                    : skuIgnored || brandIgnored
                                      ? "opacity-60"
                                      : ""
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={
                                      !blocked && !skuIgnored && !brandIgnored
                                    }
                                    disabled={blocked || brandIgnored}
                                    onCheckedChange={() =>
                                      toggleSkuIgnored(sku.sku, skuIgnored)
                                    }
                                  />
                                  <div>
                                    <p className="font-mono text-xs">{sku.sku}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {sku.reference ?? "—"} ·{" "}
                                      {sku.color ?? "—"} · {sku.category ?? "—"}
                                    </p>
                                    {blocked && (
                                      <p className="text-xs text-destructive">
                                        {sku.blockReason}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    blocked
                                      ? "text-destructive"
                                      : skuIgnored
                                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                  }`}
                                >
                                  {blocked
                                    ? "Error"
                                    : skuIgnored
                                      ? "Ignorado"
                                      : "Incluido"}
                                </span>
                              </label>
                            )
                          })}
                          {brandSkus.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No hay SKUs para esta marca.
                            </p>
                          )}
                        </div>
                  )
                })}
              </>
            ) : null}
          </>
        )}

        {step === 3 && (
          <>
            {preview.isFetching && !data ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Calculando importación…
              </p>
            ) : preview.isError ? (
              <p className="text-sm text-destructive">
                {adminErrorMessage(preview.error)}
              </p>
            ) : data ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Resumen de lo que se hará al confirmar.
                </p>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Se crearán" value={data.newCount} />
                  <Metric label="Actualizados" value={data.updated} />
                  <Metric label="Se ocultarán" value={data.hidden} />
                  <Metric
                    label="Con error"
                    value={data.errors + data.blockedCount}
                  />
                </dl>

                {data.toCreate.length > 0 && (
                  <SkuSection
                    title="Se crearán"
                    items={data.toCreate.map((sku) => {
                      const ns = data.newSkus.find((n) => n.sku === sku)
                      return {
                        sku,
                        detail: ns
                          ? `${ns.brand ?? "—"} · ${ns.reference ?? "—"} · ${ns.color ?? "—"} · ${ns.category ?? "—"}`
                          : undefined,
                      }
                    })}
                  />
                )}
                {data.toUpdate.length > 0 && (
                  <SkuSection
                    title="Se actualizarán"
                    items={data.toUpdate.map((sku) => {
                      const issues = data.issues.filter((i) => i.sku === sku)
                      return {
                        sku,
                        detail: issues
                          .map((i) =>
                            i.field
                              ? `${i.message} (${i.field}: ${i.oldValue ?? "—"} → ${i.newValue ?? "—"})`
                              : i.message,
                          )
                          .join("; "),
                      }
                    })}
                  />
                )}
                {data.toHide.length > 0 && (
                  <SkuSection
                    title="Se ocultarán"
                    items={data.toHide.map((sku) => {
                      const issues = data.issues.filter((i) => i.sku === sku)
                      return {
                        sku,
                        detail: issues
                          .map((i) =>
                            i.field
                              ? `${i.message} (${i.field}: ${i.oldValue ?? "—"} → ${i.newValue ?? "—"})`
                              : i.message,
                          )
                          .join("; "),
                      }
                    })}
                  />
                )}
                {data.withError.length > 0 && (
                  <SkuSection
                    title="Con error"
                    items={data.withError.map((sku) => {
                      const ns = data.newSkus.find((n) => n.sku === sku)
                      return {
                        sku,
                        detail: ns?.blockReason ?? data.issues.find((i) => i.sku === sku)?.message,
                      }
                    })}
                  />
                )}

                {data.ignoredBrands.length > 0 && (
                  <SkuSection
                    title="Marcas ignoradas"
                    items={data.ignoredBrands.map((b) => ({ sku: b }))}
                  />
                )}

                {data.ignoredSkus.length > 0 && (
                  <SkuSection
                    title="SKUs ignorados explícitamente"
                    items={data.ignoredSkus.map((sku) => {
                      const ns = data.newSkus.find((n) => n.sku === sku)
                      return {
                        sku,
                        detail: ns
                          ? `${ns.brand ?? "—"} · ${ns.reference ?? "—"} · ${ns.color ?? "—"} · ${ns.category ?? "—"}`
                          : undefined,
                      }
                    })}
                  />
                )}

              </>
            ) : null}
          </>
        )}

        {step === 4 && lastRun && (
          <>
            <p className="flex items-center gap-2 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${SYNC_STATUS_CLASSES[lastRun.status]}`}
              >
                {SYNC_STATUS_LABELS[lastRun.status]}
              </span>
              Importación terminada
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric
                label="Se crearon"
                value={
                  detail.data
                    ? new Set(
                        detail.data.logs
                          .filter((l) => l.field === "creación")
                          .map((l) => l.sku)
                          .filter((s): s is string => !!s),
                      ).size
                    : 0
                }
              />
              <Metric label="Actualizados" value={lastRun.updated} />
              <Metric label="Ocultos" value={lastRun.hidden} />
              <Metric label="Con error" value={lastRun.errors} />
            </dl>

            {detail.data && (
              <>
                {(() => {
                  const logs = detail.data.logs
                  const created = Array.from(
                    new Set(
                      logs
                        .filter((l) => l.field === "creación")
                        .map((l) => l.sku)
                        .filter((s): s is string => !!s),
                    ),
                  )
                  const updated = Array.from(
                    new Set(
                      logs
                        .filter(
                          (l) =>
                            l.level !== "ERROR" &&
                            l.field !== null &&
                            l.field !== "creación" &&
                            !(l.field === "estado" && l.newValue === "HIDDEN"),
                        )
                        .map((l) => l.sku)
                        .filter((s): s is string => !!s),
                    ),
                  )
                  const hidden = Array.from(
                    new Set(
                      logs
                        .filter(
                          (l) =>
                            l.field === "estado" && l.newValue === "HIDDEN",
                        )
                        .map((l) => l.sku)
                        .filter((s): s is string => !!s),
                    ),
                  )
                  const errors = Array.from(
                    new Set(
                      logs
                        .filter((l) => l.level === "ERROR")
                        .map((l) => l.sku)
                        .filter((s): s is string => !!s),
                    ),
                  )
                  return (
                    <>
                      {created.length > 0 && (
                        <SkuSection
                          title="Se crearon"
                          items={created.map((sku) => ({
                            sku,
                            detail: "Producto nuevo importado",
                          }))}
                        />
                      )}
                      {updated.length > 0 && (
                        <SkuSection
                          title="Se actualizaron"
                          items={updated.map((sku) => {
                            const items = logs.filter((l) => l.sku === sku)
                            return {
                              sku,
                              detail: items
                                .map((l) =>
                                  l.field
                                    ? `${l.message} (${l.field}: ${l.oldValue ?? "—"} → ${l.newValue ?? "—"})`
                                    : l.message,
                                )
                                .join("; "),
                            }
                          })}
                        />
                      )}
                      {hidden.length > 0 && (
                        <SkuSection
                          title="Se ocultaron"
                          items={hidden.map((sku) => ({
                            sku,
                            detail: logs.find((l) => l.sku === sku)?.message,
                          }))}
                        />
                      )}
                      {errors.length > 0 && (
                        <SkuSection
                          title="Con error"
                          items={errors.map((sku) => ({
                            sku,
                            detail: logs.find((l) => l.sku === sku)?.message,
                          }))}
                        />
                      )}
                    </>
                  )
                })()}
              </>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onViewLogs}>
                Ver registros
              </Button>
              <Button onClick={restart}>Nueva importación</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}


function SkuSection({
  title,
  items,
}: {
  title: string
  items: { sku: string; detail?: string }[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border p-3 text-sm">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between font-medium"
          >
            <span>
              {title} ({items.length})
            </span>
            <span className="text-muted-foreground">{open ? "▲" : "▼"}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <ul className="mt-2 divide-y text-xs">
            {items.map((item, index) => (
              <li key={`${item.sku}-${index}`} className="py-1">
                <span className="font-mono">{item.sku}</span>
                {item.detail && (
                  <div className="ml-2 mt-1 space-y-0.5 text-muted-foreground">
                    {item.detail.split("; ").map((part, i) => (
                      <div key={i}>{part}</div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  )
}
