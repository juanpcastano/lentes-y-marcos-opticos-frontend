import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react"
import { Button } from "#/components/ui/button"
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
  fetchSoftixSyncPreview,
  getSoftixSyncRun,
  syncSoftixCatalog,
} from "#/services/admin"
import type { SyncRun } from "#/services/admin"
import {
  SYNC_STATUS_CLASSES,
  SYNC_STATUS_LABELS,
} from "#/components/admin/integration/sync-labels"

const STEPS = ["Conexión", "Vista previa", "Resultado"] as const
const MAX_ISSUES_SHOWN = 50

type Props = {
  onViewLogs: () => void
}

/** Asistente de sincronización: verifica Softix, muestra qué cambiaría, ejecuta y reporta. */
export function SyncWizard({ onViewLogs }: Props) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [lastRun, setLastRun] = useState<SyncRun | null>(null)
  const [maxStep, setMaxStep] = useState(0)

  const connection = useQuery({
    queryKey: ["admin", "integration", "connection"],
    queryFn: fetchSoftixConnection,
    enabled: step === 0,
    retry: false,
  })

  const preview = useQuery({
    queryKey: ["admin", "integration", "preview"],
    queryFn: fetchSoftixSyncPreview,
    enabled: step === 1,
    retry: false,
  })

  const sync = useMutation({
    mutationFn: syncSoftixCatalog,
    onSuccess: async (run) => {
      setLastRun(run)
      setStep(2)
      setMaxStep((m) => Math.max(m, 2))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: ADMIN_SYNC_RUNS_QUERY_KEY }),
      ])
    },
    onError: async (error) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_SYNC_RUNS_QUERY_KEY,
      })
      toast({ variant: "destructive", title: adminErrorMessage(error) })
    },
  })

  function restart() {
    setLastRun(null)
    setStep(0)
    setMaxStep(0)
  }

  const data = preview.data
  const shownIssues = data?.issues.slice(0, MAX_ISSUES_SHOWN) ?? []
  const hiddenIssues = (data?.issues.length ?? 0) - shownIssues.length

  const detail = useQuery({
    queryKey: ["admin", "integration", "runs", lastRun?.id],
    queryFn: () => getSoftixSyncRun(lastRun!.id),
    enabled: step === 2 && !!lastRun,
    retry: false,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincronizar con Softix</CardTitle>
        <CardDescription>
          Revisa la conexión y qué cambiaría antes de aplicar la sincronización.
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
                disabled={!data || preview.isFetching || sync.isPending}
                onClick={() => sync.mutate()}
              >
                {sync.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Sincronizar ahora
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {step === 0 && (
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
        )}

        {step === 1 && (
          <>
            {preview.isFetching && !data ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Calculando cambios…
              </p>
            ) : preview.isError ? (
              <p className="text-sm text-destructive">
                {adminErrorMessage(preview.error)}
              </p>
            ) : data ? (
              <>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Metric label="Actualizados" value={data.updated} />
                  <Metric label="Se ocultarán" value={data.hidden} />
                  <Metric label="Con error" value={data.errors} />
                  <Metric label="Cambios de stock" value={data.stockChanged} />
                  <Metric label="Cambios de precio" value={data.priceChanged} />
                </dl>
                {data.hidden > 0 && (
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {data.hidden} productos dejarán de mostrarse porque ya no
                    aparecen en Softix.
                  </p>
                )}
                {data.issues.length > 0 && (
                  <div className="grid gap-3">
                    {(() => {
                      const updatedSkus = Array.from(
                        new Set(
                          shownIssues
                            .filter(
                              (i) =>
                                i.level !== "ERROR" &&
                                i.field !== null &&
                                !(i.field === "estado" && i.newValue === "HIDDEN"),
                            )
                            .map((i) => i.sku)
                            .filter((s): s is string => !!s),
                        ),
                      )
                      const hiddenSkus = Array.from(
                        new Set(
                          shownIssues
                            .filter(
                              (i) =>
                                i.field === "estado" && i.newValue === "HIDDEN",
                            )
                            .map((i) => i.sku)
                            .filter((s): s is string => !!s),
                        ),
                      )
                      const errorSkus = Array.from(
                        new Set(
                          shownIssues
                            .filter((i) => i.level === "ERROR")
                            .map((i) => i.sku)
                            .filter((s): s is string => !!s),
                        ),
                      )
                      return (
                        <>
                          {updatedSkus.length > 0 && (
                            <SkuSection
                              title="Se actualizarán"
                              items={updatedSkus.map((sku) => {
                                const items = shownIssues.filter(
                                  (i) => i.sku === sku,
                                )
                                return {
                                  sku,
                                  detail: items
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
                          {hiddenSkus.length > 0 && (
                            <SkuSection
                              title="Se ocultarán"
                              items={hiddenSkus.map((sku) => ({
                                sku,
                                detail: shownIssues.find((i) => i.sku === sku)
                                  ?.message,
                              }))}
                            />
                          )}
                          {errorSkus.length > 0 && (
                            <SkuSection
                              title="Con error"
                              items={errorSkus.map((sku) => ({
                                sku,
                                detail: shownIssues.find((i) => i.sku === sku)
                                  ?.message,
                              }))}
                            />
                          )}
                        </>
                      )
                    })()}
                    {hiddenIssues > 0 && (
                      <p className="text-xs text-muted-foreground">
                        y {hiddenIssues} más.
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Si Softix no responde, la sincronización se detiene, se conservan
              los datos anteriores y el intento queda registrado.
            </p>
          </>
        )}

        {step === 2 && lastRun && (
          <>
            <p className="flex items-center gap-2 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${SYNC_STATUS_CLASSES[lastRun.status]}`}
              >
                {SYNC_STATUS_LABELS[lastRun.status]}
              </span>
              Sincronización terminada
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Actualizados" value={lastRun.updated} />
              <Metric label="Ocultos" value={lastRun.hidden} />
              <Metric label="Con error" value={lastRun.errors} />
            </dl>

            {detail.data && (
              <>
                {(() => {
                  const logs = detail.data.logs
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
              <Button onClick={restart}>Nueva sincronización</Button>
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
