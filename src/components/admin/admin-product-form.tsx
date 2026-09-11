import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Eye, Plus, Trash2, Upload } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
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
import { ToastAction } from "#/components/ui/toast"
import { toast } from "#/hooks/use-toast"
import {
  createAdminProduct,
  deleteAdminImage,
  setAdminPrimaryImage,
  updateAdminProduct,
  uploadAdminImage,
} from "#/services/admin"
import type {
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
  const [validationError, setValidationError] = useState("")
  const { data: categories = [] } = useQuery(
    createAdminCategoriesQueryOptions(),
  )
  const { data: brands = [] } = useQuery(createAdminBrandsQueryOptions())

  useEffect(() => {
    if (product) {
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
          priceAdjustment: variant.priceAdjustment,
          imageUrl: variant.imageUrl ?? "",
          isActive: variant.isActive,
        })),
      })
    }
  }, [product])

  const save = useMutation({
    mutationFn: () =>
      product
        ? updateAdminProduct(product.id, input)
        : createAdminProduct(input),
    onSuccess: async (saved) => {
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
    mutationFn: ({ file, primary }: { file: File; primary: boolean }) =>
      uploadAdminImage(product!.id, file, primary),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      })
    },
  })

  const setPrimary = useMutation({
    mutationFn: (imageId: string) => setAdminPrimaryImage(product!.id, imageId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      }),
  })

  const removeImage = useMutation({
    mutationFn: (imageId: string) => deleteAdminImage(product!.id, imageId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, product?.id],
      }),
  })

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
        priceAdjustment: null,
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

  function handleImage(file: File | undefined) {
    if (!file || !product) return
    if (
      !(["image/jpeg", "image/png", "image/webp"] as string[]).includes(
        file.type,
      )
    ) {
      setImageError("Usa una imagen JPG, PNG o WebP.")
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError("La imagen no puede superar 3 MB.")
      return
    }
    setImageError("")
    upload.mutate({ file, primary: product.images.length === 0 })
  }

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
              className="grid gap-2 rounded-2xl border p-3 sm:grid-cols-[1fr_1.2fr_auto]"
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

      {product && (
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-sm text-muted-foreground hover:bg-muted">
              <Upload />
              {upload.isPending ? "Subiendo..." : "Seleccionar imagen"}
              <input
                className="hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleImage(e.target.files?.[0])}
                disabled={upload.isPending}
              />
            </label>
            {imageError && (
              <p className="text-sm text-destructive">{imageError}</p>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              {product.images.map((image) => (
                <div
                  key={image.id}
                  className="overflow-hidden rounded-2xl border"
                >
                  <img
                    className="aspect-square w-full object-cover"
                    src={image.imageUrl}
                    alt=""
                  />
                  <div className="flex items-center justify-between gap-2 p-2 text-xs">
                    <Button
                      type="button"
                      size="xs"
                      variant={image.isPrimary ? "secondary" : "ghost"}
                      onClick={() => setPrimary.mutate(image.id)}
                    >
                      {image.isPrimary ? "Principal" : "Hacer principal"}
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Eliminar imagen"
                      onClick={() => removeImage.mutate(image.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {save.error && (
        <p className="text-sm text-destructive">{save.error.message}</p>
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
