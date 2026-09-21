import { AlertTriangle, ImageIcon } from "lucide-react"
import { PermanentDeleteDialog } from "#/components/permanent-delete-dialog"
import type { AdminMediaAsset } from "#/services/admin"

export function AdminMediaDeleteDialog({
  asset,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  asset: AdminMediaAsset | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <PermanentDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      isPending={isPending}
      confirmDisabled={!asset}
      confirmLabel="Eliminar definitivamente"
      onConfirm={onConfirm}
      title={
        <span className="flex items-center gap-2">
          {asset?.references.length ? (
            <AlertTriangle className="text-destructive" />
          ) : (
            <ImageIcon />
          )}
          ¿Eliminar esta imagen?
        </span>
      }
      description={
        asset?.references.length
          ? `Está siendo usada por ${formatReferenceNames(asset)}. Se quitarán todas esas referencias y, si era principal, se elegirá otra imagen del producto.`
          : "El objeto se eliminará permanentemente del bucket y no se podrá recuperar desde el panel."
      }
    />
  )
}

function formatReferenceNames(asset: AdminMediaAsset) {
  const names = [
    ...new Set(asset.references.map((reference) => reference.name)),
  ]
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} y ${names[1]}`
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`
}
