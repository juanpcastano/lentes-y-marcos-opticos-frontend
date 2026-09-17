import { useEffect, useRef } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card"
import { Input } from "#/components/ui/input"
import { Label } from "#/components/ui/label"
import { Switch } from "#/components/ui/switch"
import { StagedImagesSection } from "./staged-images-section"
import { VariantImagesSection } from "./variant-images-section"
import type { ProductForm } from "./use-product-form"

/**
 * Tarjeta "Variantes, precios e imágenes": una fila editable por color
 * (precio, descuento, SKU, estado) con sus imágenes, más el bloque de
 * pendientes cuando el producto aún no existe.
 */
export function VariantsSection({ form }: { form: ProductForm }) {
  const { input } = form
  const variantRefs = useRef(new Map<number, HTMLDivElement>())
  const prevCount = useRef(input.variants.length)

  useEffect(() => {
    if (input.variants.length > prevCount.current) {
      const element = variantRefs.current.get(input.variants.length - 1)
      requestAnimationFrame(() => {
        element?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
    prevCount.current = input.variants.length
  }, [input.variants.length])
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Variantes, precios e imágenes</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={form.addVariant}
          >
            <Plus />
            Añadir
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {input.variants.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Añade al menos una variante vendible: cada color tiene su precio,
            descuento e imágenes.
          </p>
        )}
        {input.variants.map((variant, index) => (
          <div
            key={variant.id ?? `new-${index}`}
            ref={(element) => {
              if (element) variantRefs.current.set(index, element)
              else variantRefs.current.delete(index)
            }}
            className="scroll-mt-24 space-y-4 rounded-2xl border p-4 sm:p-5"
          >
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_0.7fr_auto] sm:items-end">
              <div className="space-y-1">
                <Label htmlFor={`variant-color-${index}`}>Color</Label>
                <Input
                  id={`variant-color-${index}`}
                  placeholder="ej. Negro"
                  value={variant.color}
                  onChange={(e) =>
                    form.updateVariant(index, { color: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`variant-sku-${index}`}>SKU</Label>
                <Input
                  id={`variant-sku-${index}`}
                  placeholder="Código Softix"
                  value={variant.sku}
                  onChange={(e) =>
                    form.updateVariant(index, { sku: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`variant-price-${index}`}>Precio (COP)</Label>
                <Input
                  id={`variant-price-${index}`}
                  placeholder="0"
                  type="number"
                  min="1"
                  value={variant.price === 0 ? "" : variant.price}
                  onChange={(e) =>
                    form.updateVariant(index, { price: Number(e.target.value) })
                  }
                  className="mt-2"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`variant-discount-${index}`}>
                  Descuento (%)
                </Label>
                <Input
                  id={`variant-discount-${index}`}
                  placeholder="0–100"
                  type="number"
                  min="0"
                  max="100"
                  value={variant.discountPercentage ?? ""}
                  onChange={(e) =>
                    form.updateVariant(index, {
                      discountPercentage:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="mt-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{variant.isActive ? "Activa" : "Inactiva"}</span>
                  <Switch
                    checked={variant.isActive}
                    onCheckedChange={(isActive) =>
                      form.updateVariant(index, { isActive })
                    }
                    aria-label={`${variant.isActive ? "Desactivar" : "Activar"} variante ${variant.color || index + 1}`}
                  />
                </label>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Eliminar variante"
                  onClick={() => form.askDeleteVariant(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
            {variant.id ? (
              <VariantImagesSection
                images={form.imagesByVariant[variant.id] ?? []}
                sensors={form.sensors}
                activeImage={
                  form.activeDragVariantId === variant.id
                    ? form.activeImage
                    : undefined
                }
                pendingImages={
                  form.pendingVariantId === variant.id ? form.pendingImages : []
                }
                isUploading={
                  form.uploadPending && form.pendingVariantId === variant.id
                }
                uploadProgress={
                  form.pendingVariantId === variant.id
                    ? form.uploadProgress
                    : null
                }
                imageError={
                  form.pendingVariantId === variant.id ? form.imageError : ""
                }
                uploadError={
                  form.pendingVariantId === variant.id ? form.uploadError : null
                }
                isAttaching={
                  form.attachPending &&
                  form.attachVariables?.variantId === variant.id
                }
                attachError={
                  form.attachVariables?.variantId === variant.id
                    ? form.attachError
                    : null
                }
                onDragStart={(event) =>
                  form.handleImageDragStart(variant.id!, event)
                }
                onDragEnd={(event) =>
                  form.handleImageDragEnd(variant.id!, event)
                }
                onDragCancel={form.handleImageDragCancel}
                onFiles={(files) => form.handleImages(variant.id!, files)}
                onSelectExisting={(imageUrl) =>
                  form.selectExistingImage(variant.id!, imageUrl)
                }
                onUpload={form.uploadSelectedImages}
                onRemovePending={form.removePendingImage}
                onDeleteImage={(image) =>
                  form.askDeleteImage(variant.id!, image)
                }
              />
            ) : (
              <StagedImagesSection
                label={`Imágenes del color (${variant.color || "nuevo"}) — se subirán al guardar`}
                images={variant.localImages}
                onImagesChange={(localImages) =>
                  form.updateVariant(index, { localImages })
                }
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
