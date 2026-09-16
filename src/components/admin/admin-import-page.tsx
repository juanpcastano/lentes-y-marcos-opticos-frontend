import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileSpreadsheet, Loader2, Upload } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { Checkbox } from "#/components/ui/checkbox"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { RadioGroup, RadioGroupItem } from "#/components/ui/radio-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table"
import { toast } from "#/hooks/use-toast"
import {
  ADMIN_BRANDS_QUERY_KEY,
  ADMIN_CATEGORIES_QUERY_KEY,
  ADMIN_PRODUCTS_QUERY_KEY,
} from "#/query-options/admin"
import {
  adminErrorMessage,
  confirmInventory,
  previewInventory,
} from "#/services/admin"
import type {
  InventoryConfirmResult,
  InventoryDecision,
  InventoryPreview,
  InventoryPreviewRow,
  InventoryRowStatus,
} from "#/services/admin"

type StatusFilter = "all" | InventoryRowStatus

type ConflictChoice = "REPLACE" | "UPDATE" | "DISCARD"

const PAGE_SIZE = 200

const statusLabels: Record<InventoryRowStatus, string> = {
  NUEVO: "Nuevo",
  ACTUALIZAR: "Actualizar",
  SIN_CAMBIOS: "Sin cambios",
  CONFLICTO: "Conflicto",
  ERROR: "Error",
}

const statusStyles: Record<InventoryRowStatus, string> = {
  NUEVO:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  ACTUALIZAR:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  SIN_CAMBIOS: "bg-muted text-muted-foreground",
  CONFLICTO: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  ERROR: "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
}

const conflictOptions: { value: ConflictChoice; label: string }[] = [
  { value: "REPLACE", label: "Reemplazar" },
  { value: "UPDATE", label: "Actualizar" },
  { value: "DISCARD", label: "Descartar" },
]

const filters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "NUEVO", label: "Nuevos" },
  { value: "ACTUALIZAR", label: "Actualizar" },
  { value: "CONFLICTO", label: "Conflictos" },
  { value: "ERROR", label: "Errores" },
  { value: "SIN_CAMBIOS", label: "Sin cambios" },
]

function formatPrice(value: number | null): string {
  if (value === null) return "—"
  return `$${new Intl.NumberFormat("es-CO").format(value)}`
}

export function AdminImportPage() {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [preview, setPreview] = useState<InventoryPreview | null>(null)
  const [result, setResult] = useState<InventoryConfirmResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [decisions, setDecisions] = useState<
    Partial<Record<string, ConflictChoice>>
  >({})
  const [omitted, setOmitted] = useState<Record<string, boolean>>({})
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const previewMutation = useMutation({
    mutationFn: (selected: File) => previewInventory(selected, setProgress),
    onSuccess: (data) => {
      setPreview(data)
      setResult(null)
      setError(null)
      setDecisions({})
      setOmitted({})
      setFilter(data.summary.conflictos > 0 ? "CONFLICTO" : "all")
      setSearch("")
      setVisibleCount(PAGE_SIZE)
      setProgress(null)
    },
    onError: (err) => {
      setError(adminErrorMessage(err))
      setProgress(null)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: ({
      selected,
      choices,
    }: {
      selected: File
      choices: Record<string, InventoryDecision>
    }) => confirmInventory(selected, choices, setProgress),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      await queryClient.invalidateQueries({
        queryKey: ADMIN_CATEGORIES_QUERY_KEY,
      })
      await queryClient.invalidateQueries({ queryKey: ADMIN_BRANDS_QUERY_KEY })
      setResult(data)
      setError(null)
      setProgress(null)
      toast({
        title: "Importación aplicada",
        description: `${data.created} creados, ${data.updated} actualizados.`,
      })
    },
    onError: (err) => {
      setError(adminErrorMessage(err))
      setProgress(null)
    },
  })

  function reset() {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setDecisions({})
    setOmitted({})
    setFilter("all")
    setSearch("")
    setVisibleCount(PAGE_SIZE)
    setProgress(null)
  }

  const rows = preview?.rows ?? []
  const conflicts = rows.filter((row) => row.status === "CONFLICTO")
  const unresolved = conflicts.filter((row) => !decisions[row.rowKey])

  const visible = rows.filter((row) => {
    const matchesFilter = filter === "all" || row.status === filter
    const query = search.trim().toLowerCase()
    const matchesSearch =
      query.length === 0 ||
      row.sku.toLowerCase().includes(query) ||
      (row.name ?? "").toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  function handleConfirm() {
    if (!file || unresolved.length > 0) return
    const choices: Record<string, InventoryDecision> = {}
    for (const row of rows) {
      if (row.status === "CONFLICTO") {
        const choice = decisions[row.rowKey]
        if (choice) choices[row.rowKey] = choice
      } else if (
        (row.status === "NUEVO" || row.status === "ACTUALIZAR") &&
        omitted[row.rowKey]
      ) {
        choices[row.rowKey] = "DISCARD"
      }
    }
    confirmMutation.mutate({ selected: file, choices })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10">
        <p className="text-sm font-medium text-primary">Inventario Softix</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Importar Excel
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sube el export mensual de Softix, revisa qué se va a crear o
          actualizar y resuelve los conflictos antes de importar. Los SKUs
          nuevos aparecen como “Nuevo” y ningún conflicto queda sin decisión.
        </p>
      </header>

      {error && (
        <p className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {result ? (
        <ResultCard result={result} onReset={reset} />
      ) : !preview ? (
        <Card className="gap-3">
          <CardHeader>
            <CardTitle>Archivo de inventario</CardTitle>
            <CardDescription>
              Formato esperado: Código, Identificador, Descripción,
              tipoproducto, Marca, Categoria, Tipo, Cant, precioventa, Sede. El
              precio de venta se divide por la cantidad; la cantidad no se
              guarda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inventory-file">Excel de Softix (.xlsx)</Label>
              <Input
                id="inventory-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mt-2"
              />
            </div>
            {file && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="size-4" />
                {file.name} — {(file.size / 1024).toFixed(0)} KB
                {progress !== null && ` — subiendo ${progress}%`}
              </p>
            )}
            <Button
              disabled={!file || previewMutation.isPending}
              onClick={() => file && previewMutation.mutate(file)}
            >
              {previewMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Leyendo Excel…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Previsualizar importación
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>
                {preview.summary.total} SKUs en el archivo:{" "}
                {preview.summary.nuevos} nuevos, {preview.summary.actualizar}{" "}
                por actualizar, {preview.summary.conflictos} conflictos,{" "}
                {preview.summary.errores} con error y{" "}
                {preview.summary.sinCambios} sin cambios.
                {unresolved.length > 0
                  ? ` Quedan ${unresolved.length} conflictos sin resolver.`
                  : " No hay conflictos pendientes."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-wrap gap-2">
                  {filters.map((option) => (
                    <Button
                      key={option.value}
                      variant={filter === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilter(option.value)
                        setVisibleCount(PAGE_SIZE)
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <Input
                  className="lg:ml-auto lg:max-w-xs"
                  placeholder="Buscar por SKU o nombre…"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setVisibleCount(PAGE_SIZE)
                  }}
                />
              </div>

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Decisión</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visible.slice(0, visibleCount).map((row) => (
                      <TableRow key={row.rowKey}>
                        <TableCell className="font-mono text-xs">
                          {row.sku}
                          <span className="block text-muted-foreground">
                            {row.sheet} · fila {row.rowNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block max-w-xs truncate font-medium">
                            {row.name ?? "—"}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {[row.brand, ...row.categories]
                              .filter(Boolean)
                              .join(" · ") || "Sin marca ni categorías"}
                          </span>
                          {row.detail && (
                            <span className="block max-w-xs text-xs text-muted-foreground">
                              {row.detail}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatPrice(row.basePrice)}
                          {row.existing &&
                            row.existing.basePrice !== row.basePrice && (
                              <span className="block text-xs text-muted-foreground">
                                Antes: {formatPrice(row.existing.basePrice)}
                              </span>
                            )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}
                          >
                            {statusLabels[row.status]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DecisionCell
                            row={row}
                            choice={decisions[row.rowKey]}
                            omitted={!!omitted[row.rowKey]}
                            onChoose={(choice) =>
                              setDecisions((prev) => ({
                                ...prev,
                                [row.rowKey]: choice,
                              }))
                            }
                            onOmit={(value) =>
                              setOmitted((prev) => ({
                                ...prev,
                                [row.rowKey]: value,
                              }))
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-muted-foreground">
                Mostrando {Math.min(visibleCount, visible.length)} de{" "}
                {visible.length} filas.
              </p>
              {visible.length > visibleCount && (
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Mostrar más
                </Button>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={unresolved.length > 0 || confirmMutation.isPending}
                  onClick={handleConfirm}
                >
                  {confirmMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Importando…
                    </>
                  ) : (
                    "Confirmar importación"
                  )}
                </Button>
                <Button variant="outline" onClick={reset}>
                  Elegir otro archivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function DecisionCell({
  row,
  choice,
  omitted,
  onChoose,
  onOmit,
}: {
  row: InventoryPreviewRow
  choice: ConflictChoice | undefined
  omitted: boolean
  onChoose: (choice: ConflictChoice) => void
  onOmit: (value: boolean) => void
}) {
  if (row.status === "CONFLICTO") {
    return (
      <RadioGroup
        value={choice ?? ""}
        onValueChange={(value) => onChoose(value as ConflictChoice)}
      >
        {conflictOptions.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem
              id={`${row.rowKey}-${option.value}`}
              value={option.value}
            />
            <Label htmlFor={`${row.rowKey}-${option.value}`}>
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    )
  }
  if (row.status === "NUEVO" || row.status === "ACTUALIZAR") {
    const id = `${row.rowKey}-omit`
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={omitted}
          onCheckedChange={(value) => onOmit(value === true)}
        />
        <Label htmlFor={id}>Omitir</Label>
      </div>
    )
  }
  return <span className="text-xs text-muted-foreground">—</span>
}

function ResultCard({
  result,
  onReset,
}: {
  result: InventoryConfirmResult
  onReset: () => void
}) {
  const stats = [
    { label: "Creados", value: result.created },
    { label: "Actualizados", value: result.updated },
    { label: "Descartados", value: result.discarded },
    { label: "Sin cambios", value: result.unchanged },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      {result.skipped.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Omitidos con error ({result.skipped.length})</CardTitle>
            <CardDescription>
              Estas filas no se importaron. Corrige el Excel y vuelve a importar
              si es necesario.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {result.skipped.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/admin/products">Ver productos</Link>
        </Button>
        <Button variant="outline" onClick={onReset}>
          Nueva importación
        </Button>
      </div>
    </div>
  )
}
