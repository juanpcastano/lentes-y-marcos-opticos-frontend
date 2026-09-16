import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
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
import {
  ArrowLeft,
  Eye,
  GripVertical,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"
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
import { AdminMediaPicker } from "#/components/admin/admin-media-picker"
import { AdminMediaDeleteDialog } from "#/components/admin/admin-media-delete-dialog"
import { Checkbox } from "#/components/ui/checkbox"
import { Field, FieldLabel } from "#/components/ui/field"
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
import { Switch } from "#/components/ui/switch"
import { ToastAction } from "#/components/ui/toast"
import { toast } from "#/hooks/use-toast"
import {
  adminErrorMessage,
  createAdminProduct,
  attachExistingAdminImage,
  deleteAdminImage,
  deleteAdminMedia,
  deleteAdminProduct,
  listAdminGallery,
  reorderAdminImages,
  updateAdminProduct,
  uploadAdminImage,
} from "#/services/admin"
import type {
  AdminImage,
  AdminMediaAsset,
  AdminProduct,
  AdminProductInput,
  AdminVariantInput,
} from "#/services/admin"
import type { AdminProductsSearch } from "#/components/admin/admin-products-search"
import {
  ADMIN_PRODUCTS_QUERY_KEY,
  createAdminBrandsQueryOptions,
  createAdminCategoriesQueryOptions,
} from "#/query-options/admin"

const emptyInput: AdminProductInput = {
  name: "",
  brandId: null,
  basePrice: 0,
  discountPercentage: null,
  material: "",
  shape: "",
  description: "",
  taxRate: null,
  productType: "marco_optico",
  isActive: true,
  categories: [],
  variants: [],
}

const PRODUCT_TYPES = [
  { value: "marco_optico", label: "Marco óptico" },
  { value: "gafa_sol", label: "Gafa de sol" },
  { value: "producto_oftalmico", label: "Producto oftálmico" },
  { value: "lente_contacto", label: "Lente de contacto" },
  { value: "accesorio", label: "Accesorio" },
]

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

export function AdminProductForm({
  product,
  returnSearch,
}: {
  product?: AdminProduct
  returnSearch?: AdminProductsSearch
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [input, setInput] = useState<AdminProductInput>(emptyInput)
  const [imageError, setImageError] = useState("")
  const [pendingImages, setPendingImages] = useState<
    { file: File; preview: string }[]
  >([])
  const [pendingExistingImages, setPendingExistingImages] = useState<string[]>(
    [],
  )
  const [activeImageId, setActiveImageId] = useState<string | null>(null)
  const [activeImageWidth, setActiveImageWidth] = useState<number>()
  const [imageToDelete, setImageToDelete] = useState<AdminImage | null>(null)
  const [permanentDeleteOpen, setPermanentDeleteOpen] = useState(false)
  const [deleteProductOpen, setDeleteProductOpen] = useState(false)
  const [orderedImages, setOrderedImages] = useState<AdminImage[]>(
    product?.images ?? [],
  )
  const [validationError, setValidationError] = useState("")
  const { data: categories = [] } = useQuery(
    createAdminCategoriesQueryOptions(),
  )
  const { data: brands = [] } = useQuery(createAdminBrandsQueryOptions())
  const mediaGallery = useQuery({
    queryKey: ["admin", "media", "gallery"],
    queryFn: listAdminGallery,
    enabled: imageToDelete !== null,
  })
  const permanentAsset: AdminMediaAsset | null = imageToDelete
    ? (mediaGallery.data?.find(
        (asset) => asset.imageUrl === imageToDelete.imageUrl,
      ) ?? {
        key: storageKeyFromUrl(imageToDelete.imageUrl),
        imageUrl: imageToDelete.imageUrl,
        folder: "products",
        references: [
          {
            type: "product",
            id: product?.id ?? "",
            name: product?.name ?? "este producto",
          },
        ],
      })
    : null

  useEffect(() => {
    if (product) {
      setOrderedImages(
        product.images.map((image, index) => ({
          ...image,
          isPrimary: index === 0,
        })),
      )
      setInput({
        name: product.name,
        brandId: product.brandId,
        basePrice: product.basePrice,
        discountPercentage: product.discountPercentage,
        material: product.material ?? "",
        shape: product.shape ?? "",
        description: product.description ?? "",
        taxRate: product.taxRate,
        productType: product.productType,
        isActive: product.isActive,
        categories: product.categories,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          variantName: variant.variantName ?? "",
          sku: variant.sku ?? "",
          imageUrl: variant.imageUrl ?? "",
          isActive: variant.isActive,
        })),
      })
    }
  }, [product])

  const attachExisting = useMutation({
    mutationFn: (imageUrl: string) =>
      attachExistingAdminImage(
        product!.id,
        imageUrl,
        product!.images.length === 0,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      }),
  })

  const save = useMutation({
    mutationFn: async () => {
      const saved = product
        ? await updateAdminProduct(product.id, input)
        : await createAdminProduct(input)

      if (!product && pendingImages.length > 0) {
        for (const [index, image] of pendingImages.entries()) {
          await uploadAdminImage(saved.id, image.file, index === 0)
        }
      }

      if (!product && pendingExistingImages.length > 0) {
        for (const [index, imageUrl] of pendingExistingImages.entries()) {
          await attachExistingAdminImage(
            saved.id,
            imageUrl,
            pendingImages.length === 0 && index === 0,
          )
        }
      }

      if (product && orderedImages.length > 0) {
        const imageIds = orderedImages.map((image) => image.id)
        const originalImageIds = product.images.map((image) => image.id)
        const orderChanged = imageIds.some(
          (imageId, index) => imageId !== originalImageIds[index],
        )
        const firstImageChanged = imageIds[0] !== originalImageIds[0]

        if (orderChanged || firstImageChanged) {
          await reorderAdminImages(saved.id, imageIds)
        }
      }

      return saved
    },
    onSuccess: async (saved) => {
      pendingImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
      setPendingImages([])
      setPendingExistingImages([])
      toast({
        variant: "success",
        title: product ? "Producto actualizado" : "Producto creado",
        description: product
          ? "Los cambios se guardaron correctamente."
          : "El producto se añadió al catálogo.",
        action: (
          <ToastAction
            altText="Ver producto"
            onClick={() =>
              navigate({
                to: "/admin/products/$id",
                params: { id: saved.id },
                search: returnSearch,
              })
            }
          >
            Ver producto
          </ToastAction>
        ),
      })
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      navigate({
        to: "/admin/products",
        search: returnSearch,
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: product
          ? "No se pudo actualizar el producto"
          : "No se pudo crear el producto",
        description: error.message,
      })
    },
  })

  const upload = useMutation({
    mutationFn: async (files: File[]) => {
      const uploaded: Awaited<ReturnType<typeof uploadAdminImage>>[] = []
      for (const [index, file] of files.entries()) {
        uploaded.push(
          await uploadAdminImage(
            product!.id,
            file,
            product!.images.length === 0 && index === 0,
          ),
        )
      }
      return uploaded
    },
    onSuccess: async () => {
      pendingImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
      setPendingImages([])
      await queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      })
    },
  })

  const removeImage = useMutation({
    mutationFn: (imageId: string) => deleteAdminImage(product!.id, imageId),
    onSuccess: async () => {
      setImageToDelete(null)
      await queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      })
    },
  })

  const permanentlyRemoveImage = useMutation({
    mutationFn: (asset: NonNullable<typeof permanentAsset>) =>
      deleteAdminMedia(asset.key, true),
    onSuccess: async () => {
      setImageToDelete(null)
      setPermanentDeleteOpen(false)
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin", "media", "gallery"],
        }),
      ])
    },
  })

  const deleteProduct = useMutation({
    mutationFn: () => deleteAdminProduct(product!.id),
    onSuccess: async () => {
      // Saca la query de detalle antes de invalidar: el producto ya no
      // existe y re-pedirlo daría 404 con reintentos (segundos de espera).
      queryClient.removeQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      })
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({
        title: "Producto eliminado",
        description: "Se eliminó permanentemente del catálogo.",
      })
      navigate({ to: "/admin/products", search: returnSearch })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "No se pudo eliminar el producto",
        description: error.message,
      })
    },
  })

  function handleImageDragStart({ active }: DragStartEvent) {
    setActiveImageId(String(active.id))
    setActiveImageWidth(active.rect.current.initial?.width)
  }

  function handleImageDragCancel() {
    setActiveImageId(null)
    setActiveImageWidth(undefined)
  }

  function clearActiveImageAfterDrop() {
    window.setTimeout(() => {
      setActiveImageId(null)
      setActiveImageWidth(undefined)
    }, 250)
  }

  function handleImageDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      clearActiveImageAfterDrop()
      return
    }
    const from = orderedImages.findIndex(
      (image) => image.id === String(active.id),
    )
    const to = orderedImages.findIndex((image) => image.id === String(over.id))
    if (from >= 0 && to >= 0) {
      let nextImages = [...orderedImages]
      const [moved] = nextImages.splice(from, 1)
      nextImages.splice(to, 0, moved)
      nextImages = nextImages.map((image, index) => ({
        ...image,
        isPrimary: index === 0,
      }))
      setOrderedImages(nextImages)
    }
    clearActiveImageAfterDrop()
  }

  const activeImage = orderedImages.find((image) => image.id === activeImageId)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function updateField<TKey extends keyof AdminProductInput>(
    key: TKey,
    value: AdminProductInput[TKey],
  ) {
    setInput((current) => ({ ...current, [key]: value }))
  }

  function addVariant() {
    updateField("variants", [
      ...input.variants,
      {
        variantName: "",
        sku: "",
        imageUrl: "",
        isActive: true,
      },
    ])
  }

  function updateVariant(index: number, value: Partial<AdminVariantInput>) {
    updateField(
      "variants",
      input.variants.map((variant, current) =>
        current === index ? { ...variant, ...value } : variant,
      ),
    )
  }

  function handleImages(files: File[]) {
    if (files.length === 0) return
    const selected = files
    const file = selected.find(
      (candidate) =>
        !(["image/jpeg", "image/png", "image/webp"] as string[]).includes(
          candidate.type,
        ) || candidate.size > 10 * 1024 * 1024,
    )
    if (file) {
      setImageError(
        file.size > 10 * 1024 * 1024
          ? "Cada imagen no puede superar 10 MB."
          : "Usa imágenes JPG, PNG o WebP.",
      )
      return
    }
    pendingImages.forEach(({ preview }) => URL.revokeObjectURL(preview))
    setImageError("")
    setPendingImages(
      selected.map((selectedFile) => ({
        file: selectedFile,
        preview: URL.createObjectURL(selectedFile),
      })),
    )
  }

  function uploadSelectedImages() {
    if (pendingImages.length > 0) {
      upload.mutate(pendingImages.map(({ file }) => file))
    }
  }

  function selectExistingImage(imageUrl: string) {
    if (product) {
      attachExisting.mutate(imageUrl)
      return
    }
    setPendingExistingImages((current) =>
      current.includes(imageUrl) ? current : [...current, imageUrl],
    )
  }

  /*
    if (!file || !product) return
    if (
      !(["image/jpeg", "image/png", "image/webp"] as string[]).includes(
        file.type,
      )
    ) {
      setImageError("Usa una imagen JPG, PNG o WebP.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("La imagen no puede superar 10 MB.")
      return
    }
    setImageError("")
    upload.mutate({ file, primary: product.images.length === 0 })
  } */

  function saveProduct() {
    if (input.basePrice <= 0) {
      setValidationError("El precio base debe ser mayor que cero.")
      return
    }
    const invalidVariant = input.variants.some(
      (variant) => !variant.variantName.trim() || !variant.sku.trim(),
    )
    if (invalidVariant) {
      setValidationError("Completa el nombre y SKU de cada variante.")
      return
    }
    if (input.variants.length === 0) {
      setValidationError("El producto debe tener al menos una variante.")
      return
    }
    const variantNames = input.variants.map((variant) =>
      variant.variantName.trim().toLowerCase(),
    )
    if (new Set(variantNames).size !== variantNames.length) {
      setValidationError("No puede haber variantes con el mismo nombre.")
      return
    }
    setValidationError("")
    save.mutate()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Catálogo</p>
        <h1 className="mt-2 text-3xl font-semibold">
          {product ? "Editar producto" : "Nuevo producto"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-muted-foreground"
            onClick={() =>
              navigate({ to: "/admin/products", search: returnSearch })
            }
          >
            <ArrowLeft />
            Volver a productos
          </Button>
          {product && (
            <Button asChild variant="outline" size="sm">
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                target="_blank"
                rel="noreferrer"
              >
                <Eye />
                Ver en página de ventas
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información principal</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
            <Input
              id="product-name"
              value={input.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-brand">Marca</FieldLabel>
            <Select
              value={input.brandId ?? "none"}
              onValueChange={(value) =>
                updateField("brandId", value === "none" ? null : value)
              }
            >
              <SelectTrigger id="product-brand" className="w-full">
                <SelectValue placeholder="Sin marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin marca</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="product-type">Tipo</FieldLabel>
            <Select
              value={input.productType}
              onValueChange={(value) => updateField("productType", value)}
            >
              <SelectTrigger id="product-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="product-base-price">
              Precio base (COP)
            </FieldLabel>
            <Input
              id="product-base-price"
              type="number"
              min="1"
              value={input.basePrice === 0 ? "" : input.basePrice}
              onChange={(e) => updateField("basePrice", Number(e.target.value))}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-discount">Descuento (%)</FieldLabel>
            <Input
              id="product-discount"
              type="number"
              min="0"
              max="100"
              value={input.discountPercentage ?? ""}
              onChange={(e) =>
                updateField(
                  "discountPercentage",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-material">Material</FieldLabel>
            <Input
              id="product-material"
              value={input.material}
              onChange={(e) => updateField("material", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-shape">Forma</FieldLabel>
            <Input
              id="product-shape"
              value={input.shape}
              onChange={(e) => updateField("shape", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-tax-rate">IVA (%)</FieldLabel>
            <Input
              id="product-tax-rate"
              type="number"
              value={input.taxRate ?? ""}
              onChange={(e) =>
                updateField(
                  "taxRate",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
          </Field>
          <div className="flex items-center gap-2 self-end pb-1">
            <Checkbox
              id="product-active"
              checked={input.isActive}
              onCheckedChange={(checked) =>
                updateField("isActive", checked === true)
              }
            />
            <Label htmlFor="product-active" className="cursor-pointer">
              Producto activo
            </Label>
          </div>
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="product-description">Descripción</FieldLabel>
            <Textarea
              id="product-description"
              className="min-h-28"
              value={input.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium">Categorías</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm"
                >
                  <Checkbox
                    checked={input.categories.includes(category.name)}
                    onCheckedChange={(checked) =>
                      updateField(
                        "categories",
                        checked === true
                          ? [...input.categories, category.name]
                          : input.categories.filter(
                              (name) => name !== category.name,
                            ),
                      )
                    }
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Variantes y SKU</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addVariant}
            >
              <Plus />
              Añadir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {input.variants.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Añade al menos una variante vendible.
            </p>
          )}
          {input.variants.map((variant, index) => (
            <div
              key={variant.id ?? index}
              className="grid gap-3 rounded-2xl border p-3 sm:grid-cols-[1fr_1.2fr_auto_auto] sm:items-center"
            >
              <Input
                placeholder="Nombre o combinación (ej. Rojo / M)"
                value={variant.variantName}
                onChange={(e) =>
                  updateVariant(index, { variantName: e.target.value })
                }
              />
              <Input
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) => updateVariant(index, { sku: e.target.value })}
              />
              <label className="flex items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-col sm:items-center sm:justify-center">
                <span>{variant.isActive ? "Activa" : "Inactiva"}</span>
                <Switch
                  checked={variant.isActive}
                  onCheckedChange={(isActive) =>
                    updateVariant(index, { isActive })
                  }
                  aria-label={`${variant.isActive ? "Desactivar" : "Activar"} variante ${variant.variantName || index + 1}`}
                />
              </label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Eliminar variante"
                onClick={() =>
                  updateField(
                    "variants",
                    input.variants.filter((_, current) => current !== index),
                  )
                }
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Imágenes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminMediaPicker
            folder="products"
            label="Añadir imágenes"
            value=""
            onChange={selectExistingImage}
            onFiles={handleImages}
          />
          {pendingExistingImages.length > 0 && !product && (
            <div className="rounded-2xl border bg-muted/30 p-3">
              <p className="text-sm font-medium">
                {pendingExistingImages.length} imagen(es) existentes
                seleccionadas
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {pendingExistingImages.map((imageUrl) => (
                  <img
                    key={imageUrl}
                    className="aspect-square rounded-lg object-cover"
                    src={imageUrl}
                    alt="Imagen existente seleccionada"
                  />
                ))}
              </div>
            </div>
          )}
          {pendingImages.length > 0 && !upload.isPending && (
            <div className="space-y-3 rounded-2xl border bg-muted/30 p-3">
              <p className="text-sm font-medium">
                {pendingImages.length} imagen(es) listas para subir
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {pendingImages.map(({ file, preview }) => (
                  <img
                    key={`${file.name}-${file.lastModified}`}
                    className="aspect-square rounded-lg object-cover"
                    src={preview}
                    alt={`Vista previa de ${file.name}`}
                  />
                ))}
              </div>
              <Button type="button" onClick={uploadSelectedImages}>
                <Upload />
                Subir imágenes
              </Button>
            </div>
          )}
          {imageError && (
            <p className="text-sm text-destructive">{imageError}</p>
          )}
          {upload.error && (
            <p className="text-sm text-destructive">
              {adminErrorMessage(upload.error)}
            </p>
          )}
          {attachExisting.error && (
            <p className="text-sm text-destructive">
              {adminErrorMessage(attachExisting.error)}
            </p>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleImageDragStart}
            onDragEnd={handleImageDragEnd}
            onDragCancel={handleImageDragCancel}
          >
            <SortableContext
              items={orderedImages.map((image) => image.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {orderedImages.map((image) => (
                  <SortableImageCard
                    key={image.id}
                    image={image}
                    onDelete={() => setImageToDelete(image)}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay
              modifiers={[snapCenterToCursor]}
              dropAnimation={{ duration: 250, easing: "ease" }}
            >
              {activeImage ? (
                <ImageDragOverlay
                  image={activeImage}
                  width={activeImageWidth}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      <AlertDialog
        open={imageToDelete !== null && !permanentDeleteOpen}
        onOpenChange={(open) => !open && setImageToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Qué deseas hacer con esta imagen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Puedes quitarla únicamente de este producto o eliminarla de forma
              permanente de la galería y de todas sus referencias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="!flex-col !gap-2">
            <Button
              type="button"
              variant="destructive"
              className="w-full min-w-0 whitespace-normal"
              disabled={
                removeImage.isPending || permanentlyRemoveImage.isPending
              }
              onClick={() => setPermanentDeleteOpen(true)}
            >
              Eliminar permanentemente
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full min-w-0 whitespace-normal"
              disabled={
                removeImage.isPending || permanentlyRemoveImage.isPending
              }
              onClick={() => {
                if (imageToDelete) removeImage.mutate(imageToDelete.id)
              }}
            >
              Quitar del producto
            </Button>
            <AlertDialogCancel
              className="w-full"
              disabled={removeImage.isPending}
            >
              Cancelar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminMediaDeleteDialog
        asset={permanentAsset}
        open={permanentDeleteOpen}
        isPending={permanentlyRemoveImage.isPending}
        onOpenChange={(open) => {
          setPermanentDeleteOpen(open)
          if (!open) setImageToDelete(null)
        }}
        onConfirm={() =>
          permanentAsset && permanentlyRemoveImage.mutate(permanentAsset)
        }
      />

      {product && (
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
              onClick={() => setDeleteProductOpen(true)}
            >
              <Trash2 />
              Eliminar producto
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={deleteProductOpen}
        onOpenChange={(open) => !open && setDeleteProductOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar el producto “{product?.name ?? ""}”?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente del catálogo junto con sus variantes.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProduct.isPending}>
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteProduct.isPending}
              onClick={() => deleteProduct.mutate()}
            >
              {deleteProduct.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {save.error && (
        <p className="text-sm text-destructive">
          {adminErrorMessage(save.error)}
        </p>
      )}
      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            navigate({ to: "/admin/products", search: returnSearch })
          }
        >
          Cancelar
        </Button>
        <Button type="button" disabled={save.isPending} onClick={saveProduct}>
          {save.isPending ? "Guardando..." : "Guardar producto"}
        </Button>
      </div>
    </div>
  )
}

function storageKeyFromUrl(url: string) {
  try {
    return new URL(url).pathname.replace(/^\/+/, "")
  } catch {
    return url
  }
}
