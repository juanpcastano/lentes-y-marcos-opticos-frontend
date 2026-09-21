import { useEffect, useMemo, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { Label } from "#/components/ui/label"
import type {
  ImportPlanRequest,
  InventoryConfirmResult,
  InventoryPreview,
} from "#/services/admin"
import {
  buildPlan,
  computeStats,
  importableVariants,
  isOmitted,
  toggleProductOmissions,
  toggleVariantOmission,
  validatePreviewBlocking,
  validatePreviewWarnings,
} from "#/components/admin/import/import-types"
import type { PlanStats } from "#/components/admin/import/import-types"
import { OmitStep } from "#/components/admin/import/taxonomy-step"
import { ProductsStep } from "#/components/admin/import/products-step"
import { useImportWizard } from "#/components/admin/import/import-store"

const STEPS = [
  "Archivo",
  "Marcas",
  "Categorías",
  "Productos",
  "Resumen",
] as const

export function AdminImportPage() {
  const store = useImportWizard()
  const {
    phase,
    uploadProgress,
    preview,
    omittedBrands,
    omittedCategories,
    omittedProducts,
    omittedVariants,
    wizard,
    step,
    result,
    error,
  } = store
  const [confirmFile, setConfirmFile] = useState<File | null>(null)

  const toggleOmitted = (
    setter: Dispatch<SetStateAction<Record<string, true>>>,
    key: string,
    omit: boolean,
  ) => {
    setter((prev) => {
      if (omit) return { ...prev, [key]: true as const }
      const kept = { ...prev }
      delete kept[key]
      return kept
    })
  }

  const brandCandidates = useMemo(
    () =>
      (preview ? preview.brands : []).map((brand) => ({
        rawName: brand.rawName,
        count: brand.count,
        suggestedName: brand.suggestedBrandName,
      })),
    [preview],
  )

  const categoryCandidates = useMemo(
    () =>
      (preview ? preview.categories : []).map((category) => ({
        rawName: category.rawName,
        count: category.count,
        suggestedName: category.suggestedCategoryName,
      })),
    [preview],
  )

  const existingBrandNames = useMemo(
    () => (preview ? preview.existingBrands : []).map((brand) => brand.name),
    [preview],
  )

  const existingCategoryNames = useMemo(
    () =>
      (preview ? preview.existingCategories : []).map(
        (category) => category.name,
      ),
    [preview],
  )

  /** Nombres en tienda (fotos del preview) para avisos de coincidencia. */
  const storeProductNames = useMemo(() => {
    const names = new Set<string>()
    for (const row of preview ? preview.rows : []) {
      const name = row.existing?.name.trim()
      if (name) names.add(name)
    }
    return [...names]
  }, [preview])

  const includedBrands = useMemo(
    () =>
      (preview ? preview.brands : [])
        .filter((brand) => !isOmitted(omittedBrands, brand.rawName))
        .map((brand) => brand.rawName)
        .sort((a, b) => a.localeCompare(b, "es")),
    [preview, omittedBrands],
  )

  /** Avisos no bloqueantes del paso 1. */
  const previewWarnings = useMemo(
    () => (preview ? validatePreviewWarnings(preview.rows) : []),
    [preview],
  )

  /** Conflictos del Excel que no tienen arreglo en el wizard (frenan en paso 1). */
  const previewBlockers = useMemo(
    () => (preview ? validatePreviewBlocking(preview.rows) : []),
    [preview],
  )

  const stats = useMemo(
    () =>
      preview
        ? computeStats(
            preview,
            omittedBrands,
            omittedCategories,
            omittedProducts,
            omittedVariants,
            wizard,
          )
        : null,
    [
      preview,
      omittedBrands,
      omittedCategories,
      omittedProducts,
      omittedVariants,
      wizard,
    ],
  )

  const plan = useMemo(
    () =>
      preview
        ? buildPlan(
            preview,
            omittedBrands,
            omittedCategories,
            omittedProducts,
            omittedVariants,
            wizard,
          )
        : null,
    [
      preview,
      omittedBrands,
      omittedCategories,
      omittedProducts,
      omittedVariants,
      wizard,
    ],
  )

  /** Productos que no se importarán, con el motivo. */
  const omittedProductsList = useMemo(() => {
    if (!preview) return []
    const list: { name: string; brand: string; reason: string }[] = []
    for (const group of wizard.groups) {
      const brand = group.brandRaw || "Sin marca"
      if (isOmitted(omittedBrands, group.brandRaw)) {
        list.push({
          name: group.name || group.excelName,
          brand,
          reason: "marca omitida",
        })
        continue
      }
      if (isOmitted(omittedProducts, group.id)) {
        list.push({
          name: group.name || group.excelName,
          brand,
          reason: "omitido por decisión",
        })
        continue
      }
      if (
        importableVariants(group, wizard.variants, omittedVariants).length === 0
      ) {
        const allOmitted = group.variantKeys.every(
          (key) =>
            isOmitted(omittedVariants, key) ||
            isOmitted(omittedProducts, group.id),
        )
        list.push({
          name: group.name || group.excelName,
          brand,
          reason: allOmitted
            ? "omitido por decisión"
            : "sin precio en el Excel",
        })
      }
    }
    return list.sort(
      (a, b) =>
        a.brand.localeCompare(b.brand, "es") ||
        a.name.localeCompare(b.name, "es"),
    )
  }, [preview, wizard, omittedBrands, omittedProducts, omittedVariants])

  const busy = phase === "uploading" || phase === "processing"

  /** Paso más alto alcanzado: los steppers visitados son navegables. */
  const [maxVisited, setMaxVisited] = useState(0)
  useEffect(() => {
    setMaxVisited((visited) => Math.max(visited, step))
  }, [step])
  useEffect(() => {
    if (preview === null) setMaxVisited(0)
  }, [preview])

  function goToStep(target: number) {
    if (target === step || busy) return
    if (preview === null && target !== 0) return
    if (target < 0 || target > maxVisited) return
    if (target > step) {
      // Saltar adelante exige lo mismo que Continuar.
      if (previewBlockers.length > 0) {
        store.setError(previewBlockers[0])
        return
      }
      if (target >= 2 && includedBrands.length === 0) {
        store.setError("Incluye al menos una marca para continuar.")
        return
      }
    }
    store.setError(null)
    store.setStep(target)
  }

  function next() {
    if (step === 0) {
      // La subida es inmediata al elegir el archivo; Continuar solo avanza
      // cuando el preview ya está listo y sin bloqueos del Excel.
      if (previewBlockers.length > 0) {
        store.setError(previewBlockers[0])
        return
      }
      if (preview) store.setStep(1)
      return
    }
    if (step === 1 && includedBrands.length === 0) {
      store.setError("Incluye al menos una marca para continuar.")
      return
    }
    store.setError(null)
    store.setStep(Math.min(step + 1, STEPS.length - 1))
  }

  function back() {
    store.setError(null)
    store.setStep(Math.max(step - 1, 0))
  }

  function handleFile(file: File | null) {
    if (!file || busy) return
    // Con una importación en curso, subir otro archivo la descarta.
    if (preview) {
      setConfirmFile(file)
      return
    }
    store.startPreview(file)
  }

  const canContinue =
    (step === 0 && preview !== null && previewBlockers.length === 0) ||
    (step === 1 && includedBrands.length > 0) ||
    step === 2 ||
    step === 3

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Inventario Softix</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Importar Excel
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Sube el export de Softix, revisa marcas, categorías y productos, y
          confirma antes de importar. Lo que ves es lo que se va a subir.
        </p>
      </header>

      {!result && (
        <ol className="mb-4 flex flex-wrap gap-2" aria-label="Etapas">
          {STEPS.map((label, index) => {
            const done = preview !== null && index < step
            const current =
              (preview === null && index === 0) ||
              (preview !== null && index === step)
            const reachable = !busy && preview !== null && index <= maxVisited
            return (
              <li key={label} className="flex items-center gap-2">
                {reachable && !current ? (
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    title={`Ir al paso ${index + 1}: ${label}`}
                    className={`cursor-pointer rounded-full px-3 py-1 text-sm font-medium transition-colors hover:ring-1 hover:ring-primary/40 ${
                      done
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {index + 1}. {label}
                  </button>
                ) : (
                  <span
                    aria-current={current ? "step" : undefined}
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      current
                        ? "bg-primary text-primary-foreground"
                        : done
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {index + 1}. {label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {!result && (preview !== null || step === 0) && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={back} disabled={step <= 0}>
              <ArrowLeft className="size-4" />
              Atrás
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next} disabled={!canContinue}>
                Continuar
                <ArrowRight className="size-4" />
              </Button>
            ) : null}
            {(preview !== null || store.file !== null) && (
              <Button variant="outline" onClick={store.reset}>
                <X className="size-4" />
                Cancelar importación
              </Button>
            )}
          </div>
          {step === 1 && includedBrands.length === 0 && (
            <p className="mt-4 text-sm text-destructive">
              Omitiste todas las marcas: incluye al menos una para continuar.
            </p>
          )}
          {step >= 1 && (
            <p className="mt-4 rounded-md border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Si encuentras errores en los datos, corrígelos en Softix y vuelve
              a importar el Excel.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {result && phase === "done" ? (
        <ResultCard result={result} onReset={store.reset} />
      ) : step === 0 || !preview || phase === "idle" ? (
        <div className="space-y-4">
          {preview && stats && (
            <SkuSummary preview={preview} stats={stats} step={step} />
          )}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle>Archivo de inventario</CardTitle>
              <CardDescription>
                Formato esperado: Código, Identificador, Descripción,
                tipoproducto, Marca, Categoria, Tipo, Cant, precioventa, Sede.
                El precio de venta se divide por la cantidad; la cantidad no se
                guarda. La última palabra de la descripción se toma como color
                de la variante (sin color → «Único», VARIOS y combinados se
                importan tal cual). Las filas sin precio o repetidas frenan la
                importación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="inventory-file">Excel de Softix (.xlsx)</Label>
                <Input
                  id="inventory-file"
                  type="file"
                  accept=".xlsx,.xls"
                  disabled={busy}
                  onChange={(event) => {
                    handleFile(event.target.files?.[0] ?? null)
                    // Permite volver a elegir el mismo archivo.
                    event.currentTarget.value = ""
                  }}
                  className="mt-2"
                />
              </div>
              {store.file && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="size-4" />
                  {store.file.name} — {(store.file.size / 1024).toFixed(0)} KB
                </p>
              )}
              {phase === "uploading" && (
                <UploadProgress
                  label={`Subiendo… ${uploadProgress ?? 0}%`}
                  value={uploadProgress}
                />
              )}
              {phase === "processing" && (
                <UploadProgress
                  label="Leyendo y clasificando en el servidor…"
                  value={null}
                />
              )}
              {preview && previewBlockers.length > 0 && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  <p className="font-medium">
                    Este Excel no se puede importar: hay{" "}
                    {previewBlockers.length}{" "}
                    {previewBlockers.length === 1 ? "conflicto" : "conflictos"}{" "}
                    que solo se arregla
                    {previewBlockers.length > 1 && "n"} en el archivo.
                  </p>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-3">
                    {previewBlockers.map((blocker) => (
                      <li key={blocker} className="list-disc pl-5">
                        {blocker}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2">
                    Corrige el Excel y vuelve a subirlo para continuar.
                  </p>
                </div>
              )}
              {preview && previewWarnings.length > 0 && (
                <div
                  role="status"
                  className="rounded-md border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                >
                  <p className="font-medium">
                    Advertencias: no frenan, pero revísalas antes de importar.
                  </p>
                  <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-3">
                    {previewWarnings.map((warning) => (
                      <li key={warning} className="list-disc pl-5">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <SkuSummary preview={preview} stats={stats} step={step} />

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Marcas del Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <OmitStep
                  itemLabel="marca"
                  itemsLabel="marcas"
                  unitLabel="productos"
                  candidates={brandCandidates}
                  existingNames={existingBrandNames}
                  omitted={omittedBrands}
                  onToggle={(rawName, omit) =>
                    toggleOmitted(store.setOmittedBrands, rawName, omit)
                  }
                  onIncludeAll={() => store.setOmittedBrands({})}
                  onOmitAll={() =>
                    store.setOmittedBrands(
                      Object.fromEntries(
                        brandCandidates.map((candidate) => [
                          candidate.rawName,
                          true as const,
                        ]),
                      ),
                    )
                  }
                  nearMissHint={(existingName) =>
                    `Esta marca parece coincidir con «${existingName}», ya registrada en el sistema: si continúas se importará como una marca diferente.`
                  }
                />
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Categorías del Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <OmitStep
                  itemLabel="categoría"
                  itemsLabel="categorías"
                  unitLabel="productos"
                  candidates={categoryCandidates}
                  existingNames={existingCategoryNames}
                  omitted={omittedCategories}
                  onToggle={(rawName, omit) =>
                    toggleOmitted(store.setOmittedCategories, rawName, omit)
                  }
                  onIncludeAll={() => store.setOmittedCategories({})}
                  onOmitAll={() =>
                    store.setOmittedCategories(
                      Object.fromEntries(
                        categoryCandidates.map((candidate) => [
                          candidate.rawName,
                          true as const,
                        ]),
                      ),
                    )
                  }
                  nearMissHint={(existingName) =>
                    `Esta categoría parece coincidir con «${existingName}», ya registrada en el sistema: si continúas se importará como una categoría diferente.`
                  }
                />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Productos por marca</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsStep
                  brandRaws={includedBrands}
                  state={wizard}
                  omittedProducts={omittedProducts}
                  omittedVariants={omittedVariants}
                  onToggleProduct={(groupId, omit) => {
                    const group = wizard.groups.find(
                      (item) => item.id === groupId,
                    )
                    if (!group) return
                    const synced = toggleProductOmissions(
                      omittedProducts,
                      omittedVariants,
                      group,
                      omit,
                    )
                    store.setOmittedProducts(synced.omittedProducts)
                    store.setOmittedVariants(synced.omittedVariants)
                  }}
                  onToggleVariant={(rowKey, omit) => {
                    const group = wizard.groups.find((item) =>
                      item.variantKeys.includes(rowKey),
                    )
                    if (!group) return
                    const synced = toggleVariantOmission(
                      omittedProducts,
                      omittedVariants,
                      group,
                      rowKey,
                      omit,
                    )
                    store.setOmittedProducts(synced.omittedProducts)
                    store.setOmittedVariants(synced.omittedVariants)
                  }}
                  storeProductNames={storeProductNames}
                />
              </CardContent>
            </Card>
          )}

          {step === 4 && stats && plan && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen de importación</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewStep
                  stats={stats}
                  plan={plan}
                  omitted={omittedProductsList}
                  warnings={previewWarnings}
                  pending={store.confirming}
                  onConfirm={() => store.confirm(plan)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
      <AlertDialog
        open={confirmFile !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmFile(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar el avance actual?</AlertDialogTitle>
            <AlertDialogDescription>
              Subir otro archivo descartará las omisiones ya marcadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmFile) store.startPreview(confirmFile)
                setConfirmFile(null)
              }}
            >
              Descartar y continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function SkuSummary({
  preview,
  stats,
  step,
}: {
  preview: InventoryPreview
  stats: PlanStats | null
  step: number
}) {
  const summary = preview.summary
  // A partir de Marcas las omisiones ya permiten contar omitidos y listos.
  const extra =
    stats !== null && step >= 1
      ? ` ${stats.variantsOmitted + stats.variantsNoPrice + stats.errorRows} omitidos · ${stats.variantsCreate + stats.variantsUpdate} listos para importar.`
      : ""
  return (
    <p className="text-sm text-muted-foreground">
      {summary.total} SKUs detectados en el archivo: {summary.nuevos} nuevos,{" "}
      {summary.actualizar} por actualizar, {summary.conflictos} conflictos,{" "}
      {summary.errores} con error y {summary.sinCambios} sin cambios.{extra}
    </p>
  )
}

function UploadProgress({
  label,
  value,
}: {
  label: string
  /** 0–100 determinate; null = indeterminado. */
  value: number | null
}) {
  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        {value === null ? (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        ) : (
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          />
        )}
      </div>
    </div>
  )
}

function ReviewStep({
  stats,
  plan,
  omitted,
  warnings,
  pending,
  onConfirm,
}: {
  stats: PlanStats
  plan: ImportPlanRequest
  omitted: { name: string; brand: string; reason: string }[]
  warnings: string[]
  pending: boolean
  onConfirm: () => void
}) {
  const brandsToImport = [...plan.brands]
    .filter((brand) => brand.action !== "OMIT")
    .sort((a, b) => a.rawName.localeCompare(b.rawName, "es"))
  const categoriesToImport = [...plan.categories]
    .filter((category) => category.action !== "OMIT")
    .sort((a, b) => a.rawName.localeCompare(b.rawName, "es"))
  const productsByBrand = new Map<string, typeof plan.products>()
  for (const product of plan.products) {
    const list = productsByBrand.get(product.brandRaw) ?? []
    list.push(product)
    productsByBrand.set(product.brandRaw, list)
  }
  const brandGroups = [...productsByBrand.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "es"),
  )
  for (const [, list] of brandGroups) {
    list.sort((a, b) => a.name.localeCompare(b.name, "es"))
  }
  const summaryRows = [
    {
      label: "Marcas",
      fresh: stats.brandsNew,
      existing: stats.brandsExisting,
      omitted: stats.brandsOmitted,
    },
    {
      label: "Categorías",
      fresh: stats.categoriesNew,
      existing: stats.categoriesExisting,
      omitted: stats.categoriesOmitted,
    },
    {
      label: "Productos",
      fresh: stats.productsNew,
      existing: stats.productsExisting,
      omitted: stats.productsOmitted,
    },
    {
      label: "Variantes",
      fresh: stats.variantsCreate,
      existing: stats.variantsUpdate,
      omitted: stats.variantsOmitted,
    },
  ]
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>
            {plan.products.length} productos · {stats.variantsNoPrice} sin
            precio · {stats.errorRows} filas con error (no se importan).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Nuevas/os</TableHead>
                <TableHead>A actualizar</TableHead>
                <TableHead>Omitidas/os</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryRows.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>{row.fresh}</TableCell>
                  <TableCell>{row.existing}</TableCell>
                  <TableCell>{row.omitted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {warnings.length > 0 && (
        <div
          role="status"
          className="rounded-md border border-amber-400/40 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <p className="font-medium">
            Advertencias ({warnings.length}): no frenan la importación, pero
            revísalas antes de confirmar.
          </p>
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto pr-3">
            {warnings.map((warning) => (
              <li key={warning} className="list-disc pl-5">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4  ">
        <Card>
          <CardHeader>
            <CardTitle>Marcas a importar ({brandsToImport.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {brandsToImport.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ninguna: todas se omitieron.
              </p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto pr-3 text-sm">
                {brandsToImport.map((brand) => (
                  <li
                    key={brand.rawName}
                    className="flex justify-between gap-4"
                  >
                    <span>{brand.finalName ?? brand.rawName}</span>
                    <span className="text-muted-foreground">
                      {brand.action === "CREATE" ? "nueva" : "registrada"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Categorías a importar ({categoriesToImport.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesToImport.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ninguna: todas se omitieron.
              </p>
            ) : (
              <ul className="max-h-64 space-y-1 overflow-y-auto pr-3 text-sm">
                {categoriesToImport.map((category) => (
                  <li
                    key={category.rawName}
                    className="flex justify-between gap-4"
                  >
                    <span>{category.finalName ?? category.rawName}</span>
                    <span className="text-muted-foreground">
                      {category.action === "CREATE" ? "nueva" : "registrada"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      {omitted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos que se omitirán ({omitted.length})</CardTitle>
            <CardDescription>
              No se importan. Revísalos antes de confirmar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-3 text-sm">
              {omitted.map((item) => (
                <li
                  key={`${item.brand}|${item.name}`}
                  className="flex justify-between gap-4"
                >
                  <span>
                    {item.name}{" "}
                    <span className="text-muted-foreground">
                      · {item.brand}
                    </span>
                  </span>
                  <span className="text-muted-foreground">{item.reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Productos a importar ({plan.products.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {brandGroups.map(([brandRaw, list]) => (
            <section key={brandRaw} className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {brandRaw} ({list.length})
              </h3>
              <ul className="space-y-1 text-sm">
                {list.map((product) => (
                  <li
                    key={`${product.brandRaw}|${product.name}`}
                    className="flex justify-between gap-4"
                  >
                    <span>{product.name}</span>
                    <span className="text-muted-foreground">
                      {product.existingProductId ? "actualizar" : "nuevo"} ·{" "}
                      {product.variants.length}{" "}
                      {product.variants.length === 1 ? "variante" : "variantes"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </CardContent>
      </Card>
      <div>
        <Button
          onClick={onConfirm}
          disabled={pending || plan.products.length === 0}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Importando…
            </>
          ) : (
            "Confirmar importación"
          )}
        </Button>
        {plan.products.length === 0 && (
          <p className="mt-4 text-sm text-destructive">
            No queda nada por importar con las decisiones actuales.
          </p>
        )}
      </div>
    </div>
  )
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
