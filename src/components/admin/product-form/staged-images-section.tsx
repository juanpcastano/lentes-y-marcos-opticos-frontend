import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "#/components/ui/button"
import { AdminMediaPicker } from "#/components/admin/admin-media-picker"
import type { StagedLocalImage } from "./types"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_FILE_SIZE = 10 * 1024 * 1024

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Tarjeta reordenable local (mismo look que variantes guardadas). */
function SortableLocalCard({
  item,
  index,
  onDelete,
}: {
  item: StagedLocalImage
  index: number
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      title="Arrastra o usa espacio y flechas para reordenar"
      className={`cursor-grab touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing ${
        isDragging ? "relative z-10 opacity-0" : ""
      }`}
    >
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="relative">
          <img
            className="aspect-square w-full object-cover"
            src={item.preview}
            alt={`Vista previa ${index + 1} de la variante`}
          />
          <div className="absolute right-2 top-2 rounded-full bg-background/90 p-2 text-muted-foreground shadow-sm">
            <GripVertical className="size-4" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-4 p-2 text-xs">
          <span className="font-medium text-muted-foreground">
            {index === 0 ? "Principal" : "Galería"}
          </span>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Quitar imagen"
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

/**
 * Imágenes de una variante aún no guardada: preview 100% local (object URLs
 * +URLs de galería), reordenable con drag & drop igual que en variantes
 * guardadas. Nada se sube a S3 hasta que se guarda el producto: ahí se crean
 * las variantes y se suben/adjuntan en el orden mostrado (la primera es la
 * principal). Quitar una imagen solo la saca de la lista (revoca el object
 * URL), sin borrar nada del bucket.
 */
export function StagedImagesSection({
  label,
  images,
  onImagesChange,
}: {
  label: string
  images: StagedLocalImage[]
  onImagesChange: (images: StagedLocalImage[]) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleFiles(files: File[]) {
    if (files.length === 0) return
    const invalid = files.find(
      (file) =>
        !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE,
    )
    if (invalid) {
      setError(
        invalid.size > MAX_FILE_SIZE
          ? "Cada imagen no puede superar 10 MB."
          : "Usa imágenes JPG, PNG o WebP.",
      )
      return
    }
    setError(null)
    onImagesChange([
      ...images,
      ...files.map((file) => ({
        key: newKey(),
        preview: URL.createObjectURL(file),
        file,
      })),
    ])
  }

  function addExisting(imageUrl: string) {
    setError(null)
    if (images.some((item) => item.imageUrl === imageUrl)) return
    onImagesChange([...images, { key: newKey(), preview: imageUrl, imageUrl }])
  }

  function removeByKey(key: string) {
    const target = images.find((item) => item.key === key)
    if (target?.file) URL.revokeObjectURL(target.preview)
    onImagesChange(images.filter((item) => item.key !== key))
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveKey(String(active.id))
  }

  function handleDragCancel() {
    setActiveKey(null)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      window.setTimeout(() => setActiveKey(null), 250)
      return
    }
    const from = images.findIndex((item) => item.key === String(active.id))
    const to = images.findIndex((item) => item.key === String(over.id))
    if (from >= 0 && to >= 0) {
      const next = [...images]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      onImagesChange(next)
    }
    window.setTimeout(() => setActiveKey(null), 250)
  }

  const activeItem = activeKey
    ? images.find((item) => item.key === activeKey)
    : undefined

  return (
    <div className="space-y-3 rounded-2xl bg-muted/30 p-4">
      <AdminMediaPicker
        folder="variants"
        label={label}
        value=""
        onChange={addExisting}
        onFiles={(files) => handleFiles(files)}
      />
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={images.map((item) => item.key)}
            strategy={rectSortingStrategy}
          >
            <div className="mb-0 grid gap-3 sm:grid-cols-3">
              {images.map((item, index) => (
                <SortableLocalCard
                  key={item.key}
                  item={item}
                  index={index}
                  onDelete={() => removeByKey(item.key)}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay
            modifiers={[snapCenterToCursor]}
            dropAnimation={{ duration: 250, easing: "ease" }}
          >
            {activeItem ? (
              <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl">
                <img
                  className="aspect-square w-full object-cover"
                  src={activeItem.preview}
                  alt=""
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
