import { Link } from "@tanstack/react-router"
import { ArrowLeft, Eye } from "lucide-react"
import { Button } from "#/components/ui/button"
import { adminErrorMessage } from "#/services/admin"
import type { AdminProduct } from "#/services/admin"
import type { AdminProductsSearch } from "#/components/admin/admin-products-search"
import { useProductForm } from "./product-form/use-product-form"
import { ProductInfoCard } from "./product-form/product-info-card"
import { VariantsSection } from "./product-form/variants-section"
import {
  DangerZoneCard,
  DeleteProductDialog,
  DeleteVariantDialog,
  ImageDeleteDialogs,
} from "./product-form/form-dialogs"

/**
 * Formulario crear/editar producto. Orquestador delgado: el estado y la
 * lógica viven en `useProductForm` y cada sección en su propio archivo
 * bajo `./product-form/`.
 */
export function AdminProductForm({
  product,
  returnSearch,
}: {
  product?: AdminProduct
  returnSearch?: AdminProductsSearch
}) {
  const form = useProductForm(product, returnSearch)

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
            onClick={form.goBack}
          >
            <ArrowLeft />
            Volver a productos
          </Button>
          {product && (
            <Button asChild variant="outline" size="sm">
              <Link
                to="/product/$id"
                params={{ id: product.id }}
                search={{ variant: undefined }}
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

      <ProductInfoCard form={form} />

      <VariantsSection form={form} />

      <ImageDeleteDialogs form={form} />

      {product && <DangerZoneCard form={form} />}

      <DeleteProductDialog form={form} />

      <DeleteVariantDialog form={form} />

      {form.saveError && (
        <p className="text-sm text-destructive">
          {adminErrorMessage(form.saveError)}
        </p>
      )}
      {form.validationError && (
        <p className="text-sm text-destructive">{form.validationError}</p>
      )}
      <div className="flex flex-col items-end gap-2">
        {form.stagedUpload && form.stagedUpload.total > 0 && (
          <p className="text-sm text-muted-foreground">
            Subiendo imágenes {form.stagedUpload.completed} de{" "}
            {form.stagedUpload.total}
            {form.stagedUpload.fileName
              ? ` — ${form.stagedUpload.fileName}`
              : ""}
            ...
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={form.goBack}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={form.savePending}
            onClick={form.saveProduct}
          >
            {form.savePending
              ? form.stagedUpload
                ? "Subiendo imágenes..."
                : "Guardando..."
              : "Guardar producto"}
          </Button>
        </div>
      </div>
    </div>
  )
}
