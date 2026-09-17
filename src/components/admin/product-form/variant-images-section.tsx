import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "#/components/ui/button"
import { AdminMediaPicker } from "#/components/admin/admin-media-picker"
import { adminErrorMessage } from "#/services/admin"
import type { AdminImage } from "#/services/admin"
import type { DndSensors, PendingImage, UploadProgress } from "./types"

/** Miniatura reordenable (dnd-kit) de una imagen ya guardada. */
function SortableImageCard({
  image,
  onDelete,
}: {
  image: AdminImage
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      title="Arrastra o usa espacio y flechas para reordenar"
      className={`cursor-grab touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing ${
        isDragging ? "relative z-10 opacity-0" : ""
      }`}
    >
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative">
          <img
            className="aspect-square w-full object-cover"
            src={image.imageUrl}
            alt=""
          />
          <div className="absolute right-2 top-2 rounded-full bg-background/90 p-2 text-muted-foreground shadow-sm">
            <GripVertical className="size-4" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 p-2 text-xs">
          <span className="font-medium text-muted-foreground">
            {image.isPrimary ? "Principal" : "Galería"}
          </span>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Eliminar imagen"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ImageDragOverlay({
  image,
  width,
}: {
  image: AdminImage
  width?: number
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-card shadow-2xl"
      style={width ? { width } : undefined}
    >
      <img
        className="aspect-square w-full object-cover"
        src={image.imageUrl}
        alt=""
      />
    </div>
  )
}

/**
 * Imágenes de una variante guardada: picker, pendientes con progreso de
 * subida y galería reordenable. La primera imagen es la principal.
 */
export function VariantImagesSection({
  images,
  sensors,
  activeImage,
  pendingImages,
  isUploading,
  uploadProgress,
  imageError,
  uploadError,
  isAttaching,
  attachError,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onFiles,
  onSelectExisting,
  onUpload,
  onRemovePending,
  onDeleteImage,
}: {
  images: AdminImage[]
  sensors: DndSensors
  activeImage: AdminImage | undefined
  pendingImages: PendingImage[]
  isUploading: boolean
  uploadProgress: UploadProgress | null
  imageError: string
  uploadError: Error | null
  isAttaching: boolean
  attachError: Error | null
  onDragStart: (event: DragStartEvent) => void
  onDragEnd: (event: DragEndEvent) => void
  onDragCancel: () => void
  onFiles: (files: File[]) => void
  onSelectExisting: (imageUrl: string) => void
  onUpload: () => void
  onRemovePending: (index: number) => void
  onDeleteImage: (image: AdminImage) => void
}) {
  const overallPercent =
    uploadProgress && uploadProgress.total > 0
      ? Math.round(
          ((uploadProgress.completed + uploadProgress.percent / 100) /
            uploadProgress.total) *
            100,
        )
      : 0
  return (
    <div className="space-y-3 rounded-2xl bg-muted/30 p-4">
      <AdminMediaPicker
        folder="variants"
        label={`Imágenes del color (${images.length})`}
        value=""
        onChange={onSelectExisting}
        onFiles={onFiles}
      />
      {isAttaching && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Añadiendo imagen existente...
        </p>
      )}
      {pendingImages.length > 0 && (
        <div className="space-y-3 rounded-2xl border bg-card p-3">
          <p className="text-sm font-medium">
            {isUploading
              ? `Subiendo ${uploadProgress?.completed ?? 0} de ${uploadProgress?.total ?? pendingImages.length}...`
              : `${pendingImages.length} imagen(es) listas para subir`}
          </p>
          {isUploading && (
            <div className="space-y-1">
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={overallPercent}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {uploadProgress?.fileName} — {overallPercent}%
              </p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {pendingImages.map(({ file, preview }, index) => {
              const isCurrent =
                isUploading && uploadProgress?.fileName === file.name
              return (
                <div
                  key={`${file.name}-${file.lastModified}`}
                  className="relative"
                >
                  <img
                    className={`aspect-square w-full rounded-lg object-cover ${isUploading ? "opacity-70" : ""}`}
                    src={preview}
                    alt={`Vista previa de ${file.name}`}
                  />
                  {isCurrent ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-white drop-shadow" />
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="destructive"
                      aria-label={`Quitar ${file.name}`}
                      className="absolute top-1 right-1"
                      disabled={isUploading}
                      onClick={() => onRemovePending(index)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
          <Button type="button" onClick={onUpload} disabled={isUploading}>
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {isUploading ? "Subiendo..." : "Subir imágenes"}
          </Button>
        </div>
      )}
      {imageError && <p className="text-sm text-destructive">{imageError}</p>}
      {uploadError && (
        <p className="text-sm text-destructive">
          {adminErrorMessage(uploadError)}
        </p>
      )}
      {attachError && (
        <p className="text-sm text-destructive">
          {adminErrorMessage(attachError)}
        </p>
      )}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext
            items={images.map((image) => image.id)}
            strategy={rectSortingStrategy}
          >
            <div className="mb-0 grid gap-3 sm:grid-cols-3">
              {images.map((image) => (
                <SortableImageCard
                  key={image.id}
                  image={image}
                  onDelete={() => onDeleteImage(image)}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay
            modifiers={[snapCenterToCursor]}
            dropAnimation={{ duration: 250, easing: "ease" }}
          >
            {activeImage ? <ImageDragOverlay image={activeImage} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
