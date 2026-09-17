import { Trash2 } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { AdminMediaDeleteDialog } from "#/components/admin/admin-media-delete-dialog"
import type { ProductForm } from "./use-product-form"

/**
 * "¿Qué deseas hacer con esta imagen?" + confirmación de borrado
 * permanente en galería.
 */
export function ImageDeleteDialogs({ form }: { form: ProductForm }) {
  return (
    <>
      <AlertDialog
        open={form.imageToDelete !== null && !form.permanentDeleteOpen}
        onOpenChange={(open) => !open && form.closeImageChoice()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Qué deseas hacer con esta imagen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Puedes quitarla únicamente de esta variante o eliminarla de forma
              permanente de la galería y de todas sus referencias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex-col !gap-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full min-w-0 whitespace-normal"
              disabled={form.removeImagePending || form.permanentRemovePending}
              onClick={form.openPermanentDelete}
            >
              Eliminar permanentemente
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full min-w-0 whitespace-normal"
              disabled={form.removeImagePending || form.permanentRemovePending}
              onClick={form.detachImage}
            >
              Quitar de la variante
            </Button>
            <AlertDialogCancel
              className="w-full"
              disabled={form.removeImagePending}
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminMediaDeleteDialog
        asset={form.permanentAsset}
        open={form.permanentDeleteOpen}
        isPending={form.permanentRemovePending}
        onOpenChange={form.closePermanentDelete}
        onConfirm={form.confirmPermanentDelete}
      />
    </>
  )
}

/** Zona de peligro: eliminación permanente del producto (solo edición). */
export function DangerZoneCard({ form }: { form: ProductForm }) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Zona de peligro</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Eliminar quita el producto del catálogo junto con sus variantes de
          forma permanente. Sus imágenes quedarán disponibles en la galería.
        </p>
        <Button
          type="button"
          variant="destructive"
          className="shrink-0"
          onClick={form.openDeleteProduct}
        >
          <Trash2 />
          Eliminar producto
        </Button>
      </CardContent>
    </Card>
  )
}

/** Confirmación de eliminación de una variante (se aplica al guardar). */
export function DeleteVariantDialog({ form }: { form: ProductForm }) {
  const variant =
    form.variantToDelete == null
      ? undefined
      : form.input.variants.at(form.variantToDelete)
  const open = form.variantToDelete != null && variant !== undefined
  const color = variant?.color.trim() || "sin color"
  const isLast = form.input.variants.length <= 1

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !next && form.closeDeleteVariant()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar la variante “{color}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {variant?.id
              ? "Al guardar, se eliminará del producto de forma permanente. Sus imágenes quedarán disponibles en la galería."
              : "Se descartará del formulario. Aún no se ha guardado nada."}
            {isLast &&
              " Es la única variante del producto: tendrás que añadir otra antes de guardar."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={form.confirmDeleteVariant}
          >
            Eliminar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

/** Confirmación de eliminación permanente del producto. */
export function DeleteProductDialog({ form }: { form: ProductForm }) {
  return (
    <AlertDialog
      open={form.deleteProductOpen}
      onOpenChange={form.closeDeleteProduct}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar el producto “{form.product?.name ?? ""}”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará permanentemente del catálogo junto con sus variantes.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={form.deleteProductPending}>
            Cancelar
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={form.deleteProductPending}
            onClick={form.confirmDeleteProduct}
          >
            {form.deleteProductPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
