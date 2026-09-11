import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Pencil, Plus, Trash2, X } from "lucide-react"
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
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { Checkbox } from "#/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Textarea } from "#/components/ui/textarea"
import {
  ADMIN_BRANDS_QUERY_KEY,
  ADMIN_CATEGORIES_QUERY_KEY,
} from "#/query-options/admin"
import {
  createAdminBrand,
  createAdminCategory,
  deleteAdminBrand,
  deleteAdminCategory,
  listAdminBrands,
  listAdminCategories,
  updateAdminBrand,
  updateAdminCategory,
} from "#/services/admin"

type Mode = "categories" | "brands"
type TaxonomyItem = {
  id: string
  name: string
  detail: string
  imageUrl: string | null
  isFeatured: boolean
}

export function AdminTaxonomyPage({ mode }: { mode: Mode }) {
  const isBrands = mode === "brands"
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [detail, setDetail] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [featured, setFeatured] = useState(false)
  const [editing, setEditing] = useState<TaxonomyItem | null>(null)
  const [deleting, setDeleting] = useState<TaxonomyItem | null>(null)
  const queryKey = isBrands
    ? ADMIN_BRANDS_QUERY_KEY
    : ADMIN_CATEGORIES_QUERY_KEY
  const {
    data = [],
    isPending,
    error,
  } = useQuery({
    queryKey: queryKey,
    queryFn: async (): Promise<TaxonomyItem[]> => {
      if (isBrands) {
        const brands = await listAdminBrands()
        return brands.map((item) => ({
          id: item.id,
          name: item.name,
          detail: item.tagline ?? "",
          imageUrl: item.imageUrl,
          isFeatured: item.isFeatured,
        }))
      }
      const categories = await listAdminCategories()
      return categories.map((item) => ({
        id: item.id,
        name: item.name,
        detail: item.description ?? "",
        imageUrl: item.imageUrl,
        isFeatured: item.isFeatured,
      }))
    },
  })

  function reset() {
    setName("")
    setDetail("")
    setImageUrl("")
    setFeatured(false)
    setEditing(null)
  }

  function startEdit(item: TaxonomyItem) {
    setEditing(item)
    setName(item.name)
    setDetail(item.detail)
    setImageUrl(item.imageUrl ?? "")
    setFeatured(item.isFeatured)
  }

  const save = useMutation({
    mutationFn: async () => {
      const input = isBrands
        ? { name, tagline: detail, imageUrl, isFeatured: featured }
        : { name, description: detail, imageUrl, isFeatured: featured }
      if (editing)
        return isBrands
          ? updateAdminBrand(editing.id, input)
          : updateAdminCategory(editing.id, input)
      return isBrands ? createAdminBrand(input) : createAdminCategory(input)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey })
      reset()
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) =>
      isBrands ? deleteAdminBrand(id) : deleteAdminCategory(id),
    onSuccess: () => {
      setDeleting(null)
      return queryClient.invalidateQueries({ queryKey })
    },
  })

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Catálogo</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          {isBrands ? "Marcas" : "Categorías"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Mantén ordenada la navegación pública de la tienda.
        </p>
      </header>
      {remove.error && (
        <p className="mb-4 text-sm text-destructive">{remove.error.message}</p>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>
              {isBrands ? "Marcas registradas" : "Categorías registradas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {isPending && (
                <p className="p-6 text-sm text-muted-foreground">Cargando...</p>
              )}
              {!isPending && data.length === 0 && (
                <p className="p-6 text-sm text-muted-foreground">
                  Todavía no hay registros.
                </p>
              )}
              {data.map((item) => (
                <div
                  className="flex items-center justify-between gap-4 px-6 py-4"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {item.detail || "Sin descripción"}
                    </p>
                    {item.isFeatured && (
                      <span className="text-xs text-primary">Destacada</span>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Editar ${item.name}`}
                      onClick={() => startEdit(item)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Eliminar ${item.name}`}
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center h-6 justify-between">
              <CardTitle>{editing ? "Editar" : "Añadir"}</CardTitle>
              {editing && (
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Cancelar edición"
                  onClick={reset}
                >
                  <X />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                save.mutate()
              }}
            >
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="taxonomy-name">Nombre</FieldLabel>
                  <Input
                    id="taxonomy-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="taxonomy-detail">
                    {isBrands ? "Tagline" : "Descripción"}
                  </FieldLabel>
                  <Textarea
                    id="taxonomy-detail"
                    className="min-h-24"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="taxonomy-image">
                    URL de imagen
                  </FieldLabel>
                  <Input
                    id="taxonomy-image"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="taxonomy-featured"
                    checked={featured}
                    onCheckedChange={(checked) => setFeatured(checked === true)}
                  />
                  <Label htmlFor="taxonomy-featured" className="cursor-pointer">
                    Destacada
                  </Label>
                </div>
                {save.error && (
                  <p className="text-sm text-destructive">
                    {save.error.message}
                  </p>
                )}
                <Button
                  className="w-full"
                  type="submit"
                  disabled={save.isPending}
                >
                  <Plus />
                  {save.isPending
                    ? "Guardando..."
                    : editing
                      ? "Guardar cambios"
                      : "Añadir"}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
      {error && (
        <p className="mt-4 text-sm text-destructive">{error.message}</p>
      )}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar {isBrands ? "la marca" : "la categoría"} “
              {deleting?.name}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si tiene productos asociados, la
              eliminación será rechazada y deberás reasignarlos primero.
            </AlertDialogDescription>
            {deleting && (
              <Link
                to="/admin/products"
                search={
                  isBrands
                    ? { brands: [deleting.name] }
                    : { categories: [deleting.name] }
                }
                className="text-sm font-medium text-primary underline underline-offset-4"
                onClick={() => setDeleting(null)}
              >
                Ver productos asociados
              </Link>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending || !deleting}
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              {remove.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
