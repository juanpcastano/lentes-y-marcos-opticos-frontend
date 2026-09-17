import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FolderOpen, ImagePlus, Loader2, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Button } from "#/components/ui/button"
import { Label } from "#/components/ui/label"
import {
  adminErrorMessage,
  listAdminMedia,
  uploadAdminMedia,
} from "#/services/admin"
import type { AdminMediaFolder } from "#/services/admin"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MEDIA_QUERY_KEY = ["admin", "media"]

export function AdminMediaPicker({
  folder,
  label,
  value,
  onChange,
  allowUpload = true,
  onFiles,
}: {
  folder: AdminMediaFolder
  label: string
  value: string
  onChange: (url: string) => void
  allowUpload?: boolean
  onFiles?: (files: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"upload" | "existing">(
    allowUpload ? "upload" : "existing",
  )
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const queryKey = [...MEDIA_QUERY_KEY, folder]
  const media = useQuery({
    queryKey,
    queryFn: () => listAdminMedia(folder),
    enabled: open && tab === "existing",
  })
  const upload = useMutation({
    mutationFn: (file: File) =>
      uploadAdminMedia(folder, file, (percent) => setProgress(percent)),
    onSuccess: async (image) => {
      onChange(image.imageUrl)
      await queryClient.invalidateQueries({ queryKey })
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      setFileName(null)
      setProgress(null)
      setOpen(false)
    },
    onError: (uploadError) => setError(uploadError.message),
    onSettled: () => setProgress(null),
  })

  function openPicker(nextTab: "upload" | "existing") {
    setError(null)
    setTab(nextTab)
    setOpen(true)
  }

  function selectFiles(files: File[]) {
    if (files.length === 0) return
    const invalidFile = files.find(
      (file) =>
        !(
          "image/jpeg" === file.type ||
          "image/png" === file.type ||
          "image/webp" === file.type
        ) || file.size > MAX_FILE_SIZE,
    )
    if (invalidFile) {
      setError(
        invalidFile.size > MAX_FILE_SIZE
          ? "Cada imagen no puede superar 10 MB."
          : "Usa imágenes JPG, PNG o WebP.",
      )
      return
    }
    setError(null)
    if (onFiles) {
      onFiles(files)
      setOpen(false)
    } else {
      const file = files[0]
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(file))
      setFileName(file.name)
      setProgress(0)
      upload.mutate(file)
    }
  }

  function closeDialog(nextOpen: boolean) {
    if (!nextOpen && upload.isPending) return
    if (!nextOpen && preview) {
      URL.revokeObjectURL(preview)
      setPreview(null)
      setFileName(null)
      setProgress(null)
    }
    setOpen(nextOpen)
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {allowUpload && (
          <Button
            type="button"
            variant="outline"
            onClick={() => openPicker("upload")}
          >
            <Upload />
            Subir imagen
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => openPicker("existing")}
        >
          <FolderOpen />
          Escoger existente
        </Button>
      </div>
      {value && (
        <div className="flex items-center gap-3 rounded-xl border p-2">
          <img
            src={value}
            alt="Imagen seleccionada"
            className="size-16 rounded-lg object-cover"
          />
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {value}
          </p>
        </div>
      )}
      <Dialog open={open} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="pb-3">
            <DialogTitle>Imagen existente</DialogTitle>
            <DialogDescription>
              {allowUpload
                ? "Sube una imagen nueva o selecciona una que ya exista."
                : "Selecciona una imagen que ya exista en el almacenamiento."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pb-3">
            {allowUpload && (
              <Button
                type="button"
                variant={tab === "upload" ? "secondary" : "ghost"}
                onClick={() => setTab("upload")}
              >
                <ImagePlus />
                Subir imagen
              </Button>
            )}
            <Button
              type="button"
              variant={tab === "existing" ? "secondary" : "ghost"}
              onClick={() => setTab("existing")}
            >
              <FolderOpen />
              Imágenes existentes
            </Button>
          </div>
          {tab === "upload" ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={Boolean(onFiles)}
                className="hidden"
                onChange={(event) => {
                  selectFiles(Array.from(event.target.files ?? []))
                  event.target.value = ""
                }}
              />
              <p className="text-sm text-muted-foreground">
                JPG, PNG o WebP. Máximo 10 MB.
              </p>
              {preview && !onFiles && (
                <div className="w-full max-w-xs space-y-2">
                  <img
                    src={preview}
                    alt={fileName ?? "Vista previa"}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <p className="truncate text-xs text-muted-foreground">
                    {fileName}
                  </p>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress ?? 0}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${progress ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium">
                    {upload.isPending
                      ? `Subiendo... ${progress ?? 0}%`
                      : "Listo para subir"}
                  </p>
                </div>
              )}
              <Button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={upload.isPending}
              >
                {upload.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Upload />
                )}
                {upload.isPending
                  ? "Subiendo..."
                  : onFiles
                    ? "Seleccionar archivos"
                    : "Seleccionar archivo"}
              </Button>
            </div>
          ) : (
            <div className="max-h-[min(60vh,32rem)] overflow-y-auto">
              {media.isPending && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Cargando imágenes...
                </p>
              )}
              {media.isError && (
                <p className="py-10 text-center text-sm text-destructive">
                  {adminErrorMessage(media.error)}
                </p>
              )}
              {!media.isPending &&
                !media.isError &&
                media.data.length === 0 && (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Todavía no hay imágenes en esta carpeta.
                  </p>
                )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {media.data?.map((image) => (
                  <button
                    key={image.key}
                    type="button"
                    className="group overflow-hidden rounded-xl border text-left transition hover:border-primary"
                    onClick={() => {
                      onChange(image.imageUrl)
                      setOpen(false)
                    }}
                  >
                    <img
                      src={image.imageUrl}
                      alt="Imagen disponible"
                      className="aspect-square w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
