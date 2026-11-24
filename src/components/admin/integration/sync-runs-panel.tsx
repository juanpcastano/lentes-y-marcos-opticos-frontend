import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import * as TanStackTable from "@tanstack/react-table"
import { useLegacyTable } from "@tanstack/react-table/legacy"
import type { LegacyColumnDef } from "@tanstack/react-table/legacy"
import { Button } from "#/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table"
import {
  createAdminSyncRunQueryOptions,
  createAdminSyncRunsQueryOptions,
} from "#/query-options/admin"
import { adminErrorMessage } from "#/services/admin"
import type { SyncLog, SyncRun } from "#/services/admin"
import {
  formatSyncChange,
  formatSyncDateTime,
  SYNC_LEVEL_CLASSES,
  SYNC_STATUS_CLASSES,
  SYNC_STATUS_LABELS,
  SYNC_TRIGGER_LABELS,
} from "#/components/admin/integration/sync-labels"

/** Historial de sincronizaciones y detalle de sus registros, con tabla TanStack. */
export function SyncRunsPanel() {
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const runs = useQuery(createAdminSyncRunsQueryOptions(page))

  const columns = useMemo<LegacyColumnDef<SyncRun>[]>(
    () => [
      {
        accessorKey: "startedAt",
        header: () => "Inicio",
        cell: ({ row }) => formatSyncDateTime(row.original.startedAt),
      },
      {
        accessorKey: "trigger",
        header: () => "Disparo",
        cell: ({ row }) => SYNC_TRIGGER_LABELS[row.original.trigger],
      },
      {
        accessorKey: "status",
        header: () => "Estado",
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${SYNC_STATUS_CLASSES[row.original.status]}`}
          >
            {SYNC_STATUS_LABELS[row.original.status]}
          </span>
        ),
      },
      {
        accessorKey: "updated",
        header: () => <span className="block text-right">Actualizados</span>,
        cell: ({ row }) => (
          <span className="block text-right">{row.original.updated}</span>
        ),
      },
      {
        accessorKey: "hidden",
        header: () => <span className="block text-right">Ocultos</span>,
        cell: ({ row }) => (
          <span className="block text-right">{row.original.hidden}</span>
        ),
      },
      {
        accessorKey: "errors",
        header: () => <span className="block text-right">Con error</span>,
        cell: ({ row }) => (
          <span className="block text-right">{row.original.errors}</span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedId(row.original.id)}
          >
            Ver detalle
          </Button>
        ),
      },
    ],
    [],
  )

  const table = useLegacyTable({
    data: runs.data?.content ?? [],
    columns,
  })

  const totalPages = runs.data?.totalPages ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registros de sincronización</CardTitle>
        <CardDescription>
          Cada intento queda registrado, sea manual o programado, con su
          resultado y los avisos por SKU.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {runs.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando registros…
          </p>
        ) : runs.isError ? (
          <p className="text-sm text-destructive">
            {adminErrorMessage(runs.error)}
          </p>
        ) : runs.data.content.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay sincronizaciones registradas.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : TanStackTable.flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {TanStackTable.flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || runs.isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground">
                Página {runs.data.page + 1} de {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages || runs.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Siguiente
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <SyncRunDialog runId={selectedId} onClose={() => setSelectedId(null)} />
    </Card>
  )
}

function SyncRunDialog({
  runId,
  onClose,
}: {
  runId: string | null
  onClose: () => void
}) {
  const detail = useQuery({
    ...createAdminSyncRunQueryOptions(runId ?? ""),
    enabled: runId !== null,
  })

  return (
    <Dialog open={runId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalle de sincronización</DialogTitle>
          <DialogDescription>
            {detail.data
              ? `${formatSyncDateTime(detail.data.run.startedAt)} · ${SYNC_TRIGGER_LABELS[detail.data.run.trigger]}`
              : "Cargando…"}
          </DialogDescription>
        </DialogHeader>

        {detail.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando registros…
          </p>
        ) : detail.isError ? (
          <p className="text-sm text-destructive">
            {adminErrorMessage(detail.error)}
          </p>
        ) : (
          <div className="grid gap-3">
            <p className="text-sm">
              <span
                className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium ${SYNC_STATUS_CLASSES[detail.data.run.status]}`}
              >
                {SYNC_STATUS_LABELS[detail.data.run.status]}
              </span>
              {detail.data.run.created} creados, {detail.data.run.updated}{" "}
              actualizados, {detail.data.run.hidden} ocultos,{" "}
              {detail.data.run.restored} restaurados, {detail.data.run.errors}{" "}
              con error, {detail.data.run.newBrands} marcas nuevas y{" "}
              {detail.data.run.newCategories} categorías nuevas.
            </p>
            {detail.data.run.errorMessage && (
              <p className="text-sm text-destructive">
                {detail.data.run.errorMessage}
              </p>
            )}
            <ol className="max-h-[60vh] divide-y overflow-y-auto rounded-md border text-sm">
              {Object.entries(
                detail.data.logs.reduce<Record<string, SyncLog[]>>(
                  (groups, entry) => {
                    const label =
                      entry.entityType === "PRODUCT"
                        ? "Productos"
                        : entry.entityType === "BRAND"
                          ? "Marcas nuevas"
                          : entry.entityType === "CATEGORY"
                            ? "Categorías nuevas"
                            : "Resumen y errores"
                    ;(groups[label] ??= []).push(entry)
                    return groups
                  },
                  {},
                ),
              ).map(([group, entries]) => (
                <li key={group} className="list-none">
                  <h3 className="border-b bg-muted/40 px-2 py-1 text-xs font-semibold">
                    {group}
                  </h3>
                  <ol className="divide-y">
                    {entries.map((entry) => (
                      <li
                        key={entry.id}
                        className="grid gap-1 p-2 sm:grid-cols-[auto_auto_1fr] sm:gap-3"
                      >
                        <span className="text-xs text-muted-foreground">
                          {formatSyncDateTime(entry.createdAt)}
                        </span>
                        <span
                          className={`font-mono text-xs ${SYNC_LEVEL_CLASSES[entry.level]}`}
                        >
                          {entry.action} · {entry.level}
                          {entry.entityKey ? ` · ${entry.entityKey}` : ""}
                          {formatSyncChange(
                            entry.field,
                            entry.oldValue,
                            entry.newValue,
                          ) && (
                            <span className="block text-[11px] text-muted-foreground">
                              {formatSyncChange(
                                entry.field,
                                entry.oldValue,
                                entry.newValue,
                              )}
                            </span>
                          )}
                        </span>
                        <span>{entry.message}</span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
