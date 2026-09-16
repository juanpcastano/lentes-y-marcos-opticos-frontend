import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Pencil, Plus, Trash2 } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog"
import { Button } from "#/components/ui/button"
import { AdminMediaPicker } from "#/components/admin/admin-media-picker"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { Checkbox } from "#/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select"
import { Textarea } from "#/components/ui/textarea"
import { toast } from "#/hooks/use-toast"
import {
  ADMIN_BRANDS_QUERY_KEY,
  ADMIN_CATEGORIES_QUERY_KEY,
} from "#/query-options/admin"
import {
  adminErrorMessage,
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
  const [formOpen, setFormOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured">(
    "all",
  )
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
    setFormOpen(false)
  }

  function startCreate() {
    setEditing(null)
    setName("")
    setDetail("")
    setImageUrl("")
    setFeatured(false)
    setFormOpen(true)
  }

  const visibleItems = useMemo(() => {
    const needle = search
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    const sorted = [...data].sort((a, b) =>
      a.name.localeCompare(b.name, "es-CO", { sensitivity: "base" }),
    )
    return sorted.filter((item) => {
      if (featuredFilter === "featured" && !item.isFeatured) return false
      if (!needle) return true
      return item.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(needle)
    })
  }, [data, search, featuredFilter])

  function startEdit(item: TaxonomyItem) {
    setEditing(item)
    setName(item.name)
    setDetail(item.detail)
    setImageUrl(item.imageUrl ?? "")
    setFeatured(item.isFeatured)
    setFormOpen(true)
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
      toast({
        variant: "success",
        title: `${isBrands ? "Marca" : "Categoría"} ${editing ? "actualizada" : "creada"}`,
        description: editing
          ? "Los cambios se guardaron correctamente."
          : `${isBrands ? "La marca" : "La categoría"} se añadió correctamente.`,
      })
      await queryClient.invalidateQueries({ queryKey })
      reset()
    },
    onError: (saveError) => {
      toast({
        variant: "destructive",
        title: `No se pudo ${editing ? "actualizar" : "crear"} ${isBrands ? "la marca" : "la categoría"}`,
        description: saveError.message,
      })
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
        <p className="mb-4 text-sm text-destructive">
          {adminErrorMessage(remove.error)}
        </p>
      )}
      <Card className="overflow-hidden gap-0">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>
            {isBrands ? "Marcas registradas" : "Categorías registradas"}
          </CardTitle>
          <Button type="button" onClick={startCreate}>
            <Plus />
            Añadir
          </Button>
        </CardHeader>
        <div className="px-6 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder={
                isBrands ? "Buscar marcas..." : "Buscar categorías..."
              }
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={isBrands ? "Buscar marcas" : "Buscar categorías"}
              className="sm:flex-1"
            />
            <Select
              value={featuredFilter}
              onValueChange={(value) =>
                setFeaturedFilter(value === "featured" ? "featured" : "all")
              }
            >
              <SelectTrigger
                className="w-full sm:w-44"
                aria-label="Filtrar destacadas"
              >
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="featured">Destacadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardContent className="p-0 mt-3">
          <div className="max-h-[60vh] divide-y overflow-y-auto">
            {isPending && (
              <p className="p-6 text-sm text-muted-foreground">Cargando...</p>
            )}
            {!isPending && visibleItems.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">
                {search.trim() !== ""
                  ? "Sin resultados para esta búsqueda."
                  : "Todavía no hay registros."}
              </p>
            )}
            {visibleItems.map((item) => (
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
        {!isPending && search.trim() !== "" && (
          <div className="border-t px-6 py-2 text-xs text-muted-foreground">
            Mostrando {visibleItems.length} de {data.length} resultados
          </div>
        )}
      </Card>
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) reset()
          else setFormOpen(true)
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar" : "Añadir"} {isBrands ? "marca" : "categoría"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Actualiza la información y guarda los cambios."
                : `Completa los datos para crear ${isBrands ? "una marca" : "una categoría"}.`}
            </DialogDescription>
          </DialogHeader>
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
              <AdminMediaPicker
                folder={isBrands ? "brands" : "categories"}
                label="Imagen"
                value={imageUrl}
                onChange={setImageUrl}
              />
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
                  {adminErrorMessage(save.error)}
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
        </DialogContent>
      </Dialog>
      {error && (
        <p className="mt-4 text-sm text-destructive">
          {adminErrorMessage(error)}
        </p>
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
