import { createContext, useCallback, useContext, useRef, useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { toast } from "#/hooks/use-toast"
import { queryClient } from "#/lib/query-client"
import {
  ADMIN_BRANDS_QUERY_KEY,
  ADMIN_CATEGORIES_QUERY_KEY,
  ADMIN_PRODUCTS_QUERY_KEY,
} from "#/query-options/admin"
import {
  adminErrorMessage,
  confirmImportPlan,
  previewInventory,
} from "#/services/admin"
import type {
  ImportPlanRequest,
  InventoryConfirmResult,
  InventoryPreview,
} from "#/services/admin"
import {
  buildWizardState,
  defaultOmittedBrands,
  defaultOmittedCategories,
} from "#/components/admin/import/import-types"
import type {
  OmissionMap,
  WizardState,
} from "#/components/admin/import/import-types"

export type ImportPhase =
  "idle" | "uploading" | "processing" | "ready" | "confirming" | "done"

interface ImportWizardValue {
  file: File | null
  phase: ImportPhase
  /** 0–100 solo durante `uploading`. */
  uploadProgress: number | null
  preview: InventoryPreview | null
  /** Raws del Excel omitidos (marcas, categorías, productos por id de grupo, variantes por rowKey). */
  omittedBrands: OmissionMap
  omittedCategories: OmissionMap
  omittedProducts: OmissionMap
  omittedVariants: OmissionMap
  wizard: WizardState
  step: number
  result: InventoryConfirmResult | null
  error: string | null
  /** Inicia el preview. Vive en el store: cambiar de ruta no lo cancela. */
  startPreview: (file: File) => void
  setOmittedBrands: Dispatch<SetStateAction<OmissionMap>>
  setOmittedCategories: Dispatch<SetStateAction<OmissionMap>>
  setOmittedProducts: Dispatch<SetStateAction<OmissionMap>>
  setOmittedVariants: Dispatch<SetStateAction<OmissionMap>>
  setStep: (step: number) => void
  setError: (message: string | null) => void
  confirm: (plan: ImportPlanRequest) => void
  confirming: boolean
  reset: () => void
}

const ImportWizardContext = createContext<ImportWizardValue | undefined>(
  undefined,
)

const EMPTY_WIZARD: WizardState = { groups: [], variants: {} }

export function ImportWizardProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<ImportPhase>("idle")
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [preview, setPreview] = useState<InventoryPreview | null>(null)
  const [omittedBrands, setOmittedBrands] = useState<OmissionMap>({})
  const [omittedCategories, setOmittedCategories] = useState<OmissionMap>({})
  const [omittedProducts, setOmittedProducts] = useState<OmissionMap>({})
  const [omittedVariants, setOmittedVariants] = useState<OmissionMap>({})
  const [wizard, setWizard] = useState<WizardState>(EMPTY_WIZARD)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<InventoryConfirmResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const requestId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const startPreview = useCallback((selected: File) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const id = requestId.current + 1
    requestId.current = id
    setFile(selected)
    setPreview(null)
    setResult(null)
    setError(null)
    setOmittedBrands({})
    setOmittedCategories({})
    setOmittedProducts({})
    setOmittedVariants({})
    setWizard(EMPTY_WIZARD)
    setStep(0)
    setUploadProgress(0)
    setPhase("uploading")
    const onProgress = (percent: number) => {
      setUploadProgress(percent)
      // 100% subido ≠ listo: el servidor aún parsea y clasifica.
      if (percent >= 100) setPhase("processing")
    }
    void previewInventory(selected, onProgress, controller.signal)
      .then((data) => {
        if (requestId.current !== id) return
        const shape = data as unknown as {
          brands?: unknown
          categories?: unknown
        }
        if (!Array.isArray(shape.brands) || !Array.isArray(shape.categories)) {
          setError(
            "El backend está desactualizado: reinícialo para usar el asistente nuevo.",
          )
          setPhase("idle")
          setUploadProgress(null)
          return
        }
        setPreview(data)
        setOmittedBrands(defaultOmittedBrands(data))
        setOmittedCategories(defaultOmittedCategories(data))
        setWizard(buildWizardState(data.rows))
        // Se queda en el paso de Archivo: el usuario avanza con Continuar.
        setPhase("ready")
        setUploadProgress(null)
      })
      .catch((err: unknown) => {
        if (requestId.current !== id) return
        if (err instanceof DOMException && err.name === "AbortError") return
        setError(adminErrorMessage(err))
        setPhase("idle")
        setUploadProgress(null)
      })
  }, [])

  const confirm = useCallback(
    (plan: ImportPlanRequest) => {
      if (phase !== "ready") return
      setConfirming(true)
      setError(null)
      void confirmImportPlan(plan)
        .then((data) => {
          return Promise.all([
            queryClient.invalidateQueries({
              queryKey: ADMIN_PRODUCTS_QUERY_KEY,
            }),
            queryClient.invalidateQueries({
              queryKey: ADMIN_CATEGORIES_QUERY_KEY,
            }),
            queryClient.invalidateQueries({
              queryKey: ADMIN_BRANDS_QUERY_KEY,
            }),
          ]).then(() => {
            setResult(data)
            setPhase("done")
            toast({
              title: "Importación aplicada",
              description: `${data.created} creados, ${data.updated} actualizados.`,
            })
          })
        })
        .catch((err: unknown) => {
          setError(adminErrorMessage(err))
        })
        .finally(() => {
          setConfirming(false)
        })
    },
    [phase],
  )

  const reset = useCallback(() => {
    requestId.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setOmittedBrands({})
    setOmittedCategories({})
    setOmittedProducts({})
    setOmittedVariants({})
    setWizard(EMPTY_WIZARD)
    setStep(0)
    setPhase("idle")
    setUploadProgress(null)
    setConfirming(false)
  }, [])

  return (
    <ImportWizardContext.Provider
      value={{
        file,
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
        startPreview,
        setOmittedBrands,
        setOmittedCategories,
        setOmittedProducts,
        setOmittedVariants,
        setStep,
        setError,
        confirm,
        confirming,
        reset,
      }}
    >
      {children}
    </ImportWizardContext.Provider>
  )
}

export function useImportWizard(): ImportWizardValue {
  const context = useContext(ImportWizardContext)
  if (!context) {
    throw new Error(
      "useImportWizard must be used within an ImportWizardProvider",
    )
  }
  return context
}
