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
import { toast } from "#/hooks/use-toast"
import {
  ADMIN_PRODUCTS_QUERY_KEY,
  ADMIN_SYNC_RUNS_QUERY_KEY,
} from "#/query-options/admin"
import {
  adminErrorMessage,
  fetchSoftixConnection,
  fetchSoftixSyncPreview,
  syncSoftixCatalog,
} from "#/services/admin"
import type { SyncIssue, SyncRun } from "#/services/admin"
import {
  formatSyncChange,
  SYNC_LEVEL_CLASSES,
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
  }

  const data = preview.data
  const shownIssues = data?.issues.slice(0, MAX_ISSUES_SHOWN) ?? []
  const hiddenIssues = (data?.issues.length ?? 0) - shownIssues.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sincronizar con Softix</CardTitle>
        <CardDescription>
          Revisa la conexión y qué cambiaría antes de aplicar la sincronización.
        </CardDescription>
        <ol className="mt-4 flex flex-wrap gap-2 text-sm">
          {STEPS.map((label, index) => (
            <li
              key={label}
              className={
                index === step
                  ? "rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground"
                  : index < step
                    ? "rounded-full bg-muted px-3 py-1 text-foreground"
                    : "rounded-full border px-3 py-1 text-muted-foreground"
              }
            >
              {index + 1}. {label}
            </li>
          ))}
        </ol>
      </CardHeader>

      <CardContent className="grid gap-4">
        {step === 0 && (
          <>
            {connection.isFetching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Verificando conexión con Softix…
              </p>
            ) : connection.data?.connected ? (
              <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                {connection.data.message}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <XCircle className="size-4" />
                {connection.data?.message ??
                  "No fue posible verificar la conexión con Softix."}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
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
                onClick={() => setStep(1)}
              >
                Siguiente
              </Button>
            </div>
          </>
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
                  <IssueList issues={shownIssues} hidden={hiddenIssues} />
                )}
              </>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
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
            </div>
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold">{value}</dd>
    </div>
  )
}

function IssueList({
  issues,
  hidden,
}: {
  issues: SyncIssue[]
  hidden: number
}) {
  return (
    <div className="max-h-64 overflow-y-auto rounded-md border text-sm">
      <ul className="divide-y">
        {issues.map((issue, index) => (
          <li key={`${issue.sku}-${index}`} className="flex gap-3 p-2">
            <span className="w-14 shrink-0 font-mono text-xs">
              {issue.sku ?? "—"}
            </span>
            <span className={SYNC_LEVEL_CLASSES[issue.level]}>
              {issue.message}
              {formatSyncChange(
                issue.field,
                issue.oldValue,
                issue.newValue,
              ) && (
                <span className="block text-xs text-muted-foreground">
                  {formatSyncChange(
                    issue.field,
                    issue.oldValue,
                    issue.newValue,
                  )}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="border-t p-2 text-xs text-muted-foreground">
          y {hidden} más.
        </p>
      )}
    </div>
  )
}
