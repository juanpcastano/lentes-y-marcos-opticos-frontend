import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"
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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Textarea } from "#/components/ui/textarea"
import { toast } from "#/hooks/use-toast"
import { ADMIN_HERO_SLIDES_QUERY_KEY } from "#/query-options/admin"
import {
  adminErrorMessage,
  createAdminHeroSlide,
  deleteAdminHeroSlide,
  listAdminHeroSlides,
  reorderAdminHeroSlides,
  updateAdminHeroSlide,
} from "#/services/admin"
import type { AdminHeroSlide } from "#/services/admin"

const PUBLIC_HERO_QUERY_KEY = ["hero-slides"]

function toForm(slide: AdminHeroSlide | null) {
  const actions = slide ? slide.actions : []
  const first = actions.length > 0 ? actions[0] : null
  const second = actions.length > 1 ? actions[1] : null
  return {
    title: slide ? slide.title : "",
    description: slide && slide.description ? slide.description : "",
    imageUrl: slide && slide.imageUrl ? slide.imageUrl : "",
    ctaLabel: first ? first.label : "",
    ctaTo: first ? first.to : "",
    cta2Label: second ? second.label : "",
    cta2To: second ? second.to : "",
    isActive: slide ? slide.isActive : true,
  }
}

export function AdminHeroPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(toForm(null))
  const [editing, setEditing] = useState<AdminHeroSlide | null>(null)
  const [deleting, setDeleting] = useState<AdminHeroSlide | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const slides = useQuery({
    queryKey: ADMIN_HERO_SLIDES_QUERY_KEY,
    queryFn: listAdminHeroSlides,
  })
  const data = slides.data ?? []

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: ADMIN_HERO_SLIDES_QUERY_KEY,
    })
    await queryClient.invalidateQueries({ queryKey: PUBLIC_HERO_QUERY_KEY })
  }

  function reset() {
    setForm(toForm(null))
    setEditing(null)
    setFormOpen(false)
    setFormError(null)
  }

  function startCreate() {
    setEditing(null)
    setForm(toForm(null))
    setFormError(null)
    setFormOpen(true)
  }

  function startEdit(item: AdminHeroSlide) {
    setEditing(item)
    setForm(toForm(item))
    setFormError(null)
    setFormOpen(true)
  }

  function validate(): string | null {
    if (!form.title.trim()) return "El título es obligatorio."
    if (!form.imageUrl.trim()) return "La imagen es obligatoria."
    const ctaHalf = Boolean(form.ctaLabel.trim()) !== Boolean(form.ctaTo.trim())
    if (ctaHalf)
      return "La acción principal necesita etiqueta y destino a la vez."
    const cta2Half =
      Boolean(form.cta2Label.trim()) !== Boolean(form.cta2To.trim())
    if (cta2Half)
      return "La acción secundaria necesita etiqueta y destino a la vez."
    for (const to of [form.ctaTo, form.cta2To]) {
      if (to.trim() && !to.trim().startsWith("/"))
        return "Los enlaces deben ser rutas internas (ej. /catalog)."
    }
    return null
  }

  const save = useMutation({
    mutationFn: async () => {
      const validation = validate()
      if (validation) throw new Error(validation)
      const blankToUndefined = (value: string) => {
        const trimmed = value.trim()
        return trimmed === "" ? undefined : trimmed
      }
      const input = {
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        ctaLabel: blankToUndefined(form.ctaLabel),
        ctaTo: blankToUndefined(form.ctaTo),
        cta2Label: blankToUndefined(form.cta2Label),
        cta2To: blankToUndefined(form.cta2To),
        isActive: form.isActive,
      }
      if (editing) return updateAdminHeroSlide(editing.id, input)
      return createAdminHeroSlide(input)
    },
    onSuccess: async () => {
      toast({
        variant: "success",
        title: editing ? "Slide actualizado" : "Slide creado",
        description: "El hero de la página principal se actualizó.",
      })
      await invalidate()
      reset()
    },
    onError: (saveError) => {
      setFormError(adminErrorMessage(saveError))
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteAdminHeroSlide(id),
    onSuccess: async () => {
      toast({ variant: "success", title: "Slide eliminado" })
      setDeleting(null)
      await invalidate()
    },
  })

  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderAdminHeroSlides(ids),
    onSuccess: () => invalidate(),
  })

  const toggleActive = useMutation({
    mutationFn: (item: AdminHeroSlide) => {
      const first = item.actions.length > 0 ? item.actions[0] : null
      const second = item.actions.length > 1 ? item.actions[1] : null
      return updateAdminHeroSlide(item.id, {
        title: item.title,
        description: item.description ?? "",
        imageUrl: item.imageUrl ?? "",
        ctaLabel: first ? first.label : "",
        ctaTo: first ? first.to : "",
        cta2Label: second ? second.label : "",
        cta2To: second ? second.to : "",
        isActive: !item.isActive,
      })
    },
    onSuccess: () => invalidate(),
  })

  function move(index: number, direction: -1 | 1) {
    const next = [...data]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    reorder.mutate(next.map((slide) => slide.id))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Contenido</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Hero principal
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Los slides se muestran en la página principal en el orden de la lista.
          Solo los activos son visibles en la tienda.
        </p>
      </header>

      {(remove.error || reorder.error || toggleActive.error) && (
        <p className="mb-4 text-sm text-destructive">
          {adminErrorMessage(
            remove.error ?? reorder.error ?? toggleActive.error,
          )}
        </p>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Slides ({data.length})</CardTitle>
          <Button type="button" onClick={startCreate}>
            <Plus />
            Añadir slide
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {slides.isPending && (
              <p className="p-6 text-sm text-muted-foreground">Cargando...</p>
            )}
            {!slides.isPending && data.length === 0 && (
              <p className="p-6 text-sm text-muted-foreground">
                Todavía no hay slides. Añade el primero para activar el hero.
              </p>
            )}
            {data.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-medium">
                    <span className="truncate">{item.title}</span>
                    {item.isActive ? (
                      <span className="shrink-0 text-xs text-primary">
                        Activo
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Inactivo
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {item.description || "Sin descripción"}
                    {item.actions.length > 0 &&
                      ` · ${item.actions.map((a) => a.label).join(" / ")}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Subir "${item.title}"`}
                    disabled={index === 0 || reorder.isPending}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Bajar "${item.title}"`}
                    disabled={index === data.length - 1 || reorder.isPending}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={
                      item.isActive
                        ? `Desactivar "${item.title}"`
                        : `Activar "${item.title}"`
                    }
                    disabled={toggleActive.isPending}
                    onClick={() => toggleActive.mutate(item)}
                  >
                    {item.isActive ? <EyeOff /> : <Eye />}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Editar "${item.title}"`}
                    onClick={() => startEdit(item)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Eliminar "${item.title}"`}
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

      {slides.error && (
        <p className="mt-4 text-sm text-destructive">
          {adminErrorMessage(slides.error)}
        </p>
      )}

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
              {editing ? "Editar slide" : "Añadir slide"}
            </DialogTitle>
            <DialogDescription>
              El contenido se publica de inmediato en la página principal si el
              slide queda activo.
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
                <FieldLabel htmlFor="hero-title">Título</FieldLabel>
                <Input
                  id="hero-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  maxLength={150}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="hero-description">Descripción</FieldLabel>
                <Textarea
                  id="hero-description"
                  className="min-h-24"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Field>
              <AdminMediaPicker
                folder="hero"
                label="Imagen"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="hero-cta-label">
                    Acción principal
                  </FieldLabel>
                  <Input
                    id="hero-cta-label"
                    placeholder="Ver catálogo"
                    value={form.ctaLabel}
                    onChange={(e) =>
                      setForm({ ...form, ctaLabel: e.target.value })
                    }
                    maxLength={50}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="hero-cta-to">Destino</FieldLabel>
                  <Input
                    id="hero-cta-to"
                    placeholder="/catalog"
                    value={form.ctaTo}
                    onChange={(e) =>
                      setForm({ ...form, ctaTo: e.target.value })
                    }
                    maxLength={255}
                  />
                  <FieldDescription>
                    Ruta interna (ej. /catalog). Acepta filtros del catálogo
                    (ej. /catalog?categories=[&quot;Sol&quot;]).
                  </FieldDescription>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="hero-cta2-label">
                    Acción secundaria
                  </FieldLabel>
                  <Input
                    id="hero-cta2-label"
                    placeholder="Agendar cita"
                    value={form.cta2Label}
                    onChange={(e) =>
                      setForm({ ...form, cta2Label: e.target.value })
                    }
                    maxLength={50}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="hero-cta2-to">Destino</FieldLabel>
                  <Input
                    id="hero-cta2-to"
                    placeholder="/appointments"
                    value={form.cta2To}
                    onChange={(e) =>
                      setForm({ ...form, cta2To: e.target.value })
                    }
                    maxLength={255}
                  />
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hero-active"
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, isActive: checked === true })
                  }
                />
                <Label htmlFor="hero-active" className="cursor-pointer">
                  Activo en la tienda
                </Label>
              </div>
              {(formError || save.error) && (
                <p className="text-sm text-destructive">
                  {formError ?? adminErrorMessage(save.error)}
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
                    : "Añadir slide"}
              </Button>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar el slide “{deleting?.title}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El slide dejará de mostrarse en
              la página principal.
            </AlertDialogDescription>
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
