import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Trash2 } from "lucide-react"
import { AdminMediaDeleteDialog } from "#/components/admin/admin-media-delete-dialog"
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
  adminErrorMessage,
  deleteAdminMedia,
  listAdminGallery,
} from "#/services/admin"
import type { AdminMediaAsset } from "#/services/admin"

type Filter = "all" | "used" | "unused"

const GALLERY_QUERY_KEY = ["admin", "media", "gallery"]

const folderLabels = {
  variants: "Variantes",
  brands: "Marcas",
  categories: "Categorías",
  hero: "Hero",
} as const

const referenceLabels = {
  brand: "Marca",
  category: "Categoría",
  product: "Producto",
  variant: "Variante",
  hero: "Hero",
} as const

export function AdminGalleryPage() {
  const queryClient = useQueryClient()
  const [folder, setFolder] = useState<"all" | AdminMediaAsset["folder"]>("all")
  const [filter, setFilter] = useState<Filter>("all")
  const [deleting, setDeleting] = useState<AdminMediaAsset | null>(null)
  const gallery = useQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: listAdminGallery,
  })
  const remove = useMutation({
    mutationFn: (asset: AdminMediaAsset) =>
      deleteAdminMedia(asset.key, asset.references.length > 0),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY })
      setDeleting(null)
      toast({ title: "Imagen eliminada" })
    },
  })

  const assets = (gallery.data ?? []).filter((asset) => {
    const matchesFolder = folder === "all" || asset.folder === folder
    const matchesFilter =
      filter === "all" ||
      (filter === "used" && asset.references.length > 0) ||
      (filter === "unused" && asset.references.length === 0)
    return matchesFolder && matchesFilter
  })
  const usedCount = (gallery.data ?? []).filter(
    (asset) => asset.references.length > 0,
  ).length
  const unusedCount = (gallery.data ?? []).length - usedCount

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-10">
        <p className="text-sm font-medium text-primary">Biblioteca del sitio</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Galería</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Revisa las imágenes del bucket y elimina archivos que ya no necesites.
          Al eliminar una imagen en uso también se quitarán sus referencias.
        </p>
      </header>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Imágenes almacenadas</CardTitle>
          <CardDescription>
            {gallery.data?.length ?? 0} imágenes, {usedCount} en uso y{" "}
            {unusedCount} sin referencias.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(["all", "variants", "brands", "categories", "hero"] as const).map(
              (option) => (
                <Button
                  key={option}
                  variant={folder === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFolder(option)}
                >
                  {option === "all" ? "Todas" : folderLabels[option]}
                </Button>
              ),
            )}
            <span className="mx-1 hidden w-px bg-border sm:block" />
            {(["all", "used", "unused"] as const).map((option) => (
              <Button
                key={option}
                variant={filter === option ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option)}
              >
                {option === "all"
                  ? "Todos los estados"
                  : option === "used"
                    ? "En uso"
                    : "Sin referencias"}
              </Button>
            ))}
          </div>

          {gallery.isPending && (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Cargando imágenes...
            </div>
          )}
          {gallery.error && (
            <p className="rounded-2xl border border-destructive/30 p-6 text-sm text-destructive">
              No se pudo cargar la galería: {adminErrorMessage(gallery.error)}
            </p>
          )}
          {!gallery.isPending && !gallery.error && assets.length === 0 && (
            <div className="rounded-3xl border border-dashed p-16 text-center text-muted-foreground">
              No hay imágenes que coincidan con estos filtros.
            </div>
          )}
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => (
              <Card
                key={asset.key}
                size="sm"
                className="!h-auto !gap-0 !p-0 self-start"
              >
                <div className="relative h-64 shrink-0 overflow-hidden bg-muted">
                  <img
                    src={asset.imageUrl}
                    alt="Imagen del catálogo"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
                    <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground">
                      {asset.references.length > 0
                        ? `${asset.references.length} referencia${asset.references.length === 1 ? "" : "s"}`
                        : "Sin referencias"}
                    </span>
                    <span className="rounded-full bg-background/90 px-2.5 py-1 text-xs text-foreground">
                      {folderLabels[asset.folder]}
                    </span>
                  </div>
                </div>
                <CardHeader className="min-h-28 min-w-0 gap-2 px-4 py-4">
                  {asset.references.length > 0 ? (
                    <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                      {asset.references.slice(0, 3).map((reference) => (
                        <p
                          key={`${reference.type}-${reference.id}`}
                          className="truncate"
                        >
                          {referenceLabels[reference.type]}: {reference.name}
                        </p>
                      ))}
                      {asset.references.length > 3 && (
                        <p>Y {asset.references.length - 3} más...</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No está asociada a ninguna entidad.
                    </p>
                  )}
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <Button
                    variant={
                      asset.references.length > 0 ? "destructive" : "outline"
                    }
                    size="sm"
                    className="w-full"
                    onClick={() => setDeleting(asset)}
                  >
                    <Trash2 />
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AdminMediaDeleteDialog
        asset={deleting}
        open={deleting !== null}
        isPending={remove.isPending}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </div>
  )
}
