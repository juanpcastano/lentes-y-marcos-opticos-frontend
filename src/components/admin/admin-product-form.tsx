import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Loader2 } from "lucide-react"
import { Button } from "#/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
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
import { ADMIN_PRODUCTS_QUERY_KEY } from "#/query-options/admin"
import { formatCop, productTitle } from "#/components/catalog/types"
import { ProductReviewCard } from "#/components/admin/product-review-card"
import {
  adminErrorMessage,
  setProductPrimaryImage,
  updateAdminProduct,
  uploadProductImage,
} from "#/services/admin"
import type { AdminProduct, ProductStatus } from "#/services/admin"

export function AdminProductForm({
  product,
}: {
  product: AdminProduct
}) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ProductStatus>(product.status)
  const [material, setMaterial] = useState(product.material ?? "")
  const [shape, setShape] = useState(product.shape ?? "")
  const [description, setDescription] = useState(product.description ?? "")
  const [uploading, setUploading] = useState(false)

  const save = useMutation({
    mutationFn: () =>
      updateAdminProduct(product.id, {
        status,
        material,
        shape,
        description,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({ title: "Producto actualizado" })
    },
    onError: (error) =>
      toast({
        variant: "destructive",
        title: adminErrorMessage(error),
      }),
  })

  async function handleImage(file: File) {
    setUploading(true)
    try {
      await uploadProductImage(product.id, file, product.images.length === 0)
      await queryClient.invalidateQueries({
        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
      })
      toast({ title: "Imagen añadida" })
    } catch (error) {
      toast({ variant: "destructive", title: adminErrorMessage(error) })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to="/admin/products"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a productos
      </Link>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Catálogo</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {productTitle(product)}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {product.sku}
          </p>
        </div>
        {status === "HIDDEN" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <Eye />
                  Ver en tienda
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              El producto está oculto, por lo que no tiene página en la tienda.
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              target="_blank"
              rel="noreferrer"
            >
              <Eye />
              Ver en tienda
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-6">
        <ProductReviewCard product={product} />
        <Card>
          <CardHeader>
            <CardTitle>Datos de Softix</CardTitle>
            <CardDescription>
              Solo lectura. Se actualizan en la sincronización.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-muted-foreground">Marca</span>
            <span>{product.brand ?? "—"}</span>
            <span className="text-muted-foreground">Referencia</span>
            <span>{product.reference ?? "—"}</span>
            <span className="text-muted-foreground">Color</span>
            <span>{product.color ?? "—"}</span>
            <span className="text-muted-foreground">Precio</span>
            <span>{formatCop(product.price)}</span>
            <span className="text-muted-foreground">Stock</span>
            <span>{product.stock}</span>
            <span className="text-muted-foreground">IVA incluido</span>
            <span>{product.saleVat ? "Sí" : "No"}</span>
            <span className="text-muted-foreground">Última sincronización</span>
            <span>{product.syncedAt ?? "—"}</span>
            {product.softixMissing && (
              <p className="col-span-2 text-destructive">
                Este SKU ya no aparece en Softix. Está oculto en la tienda.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edición</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as ProductStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="HIDDEN">Oculto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shape">Forma</Label>
              <Input
                id="shape"
                value={shape}
                onChange={(e) => setShape(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              className="w-fit"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap gap-3">
              {product.images.map((image) => (
                <div key={image.id} className="flex flex-col gap-1">
                  <img
                    src={image.imageUrl}
                    alt=""
                    className="size-24 rounded object-cover"
                  />
                  <Button
                    variant={image.isPrimary ? "default" : "outline"}
                    size="sm"
                    onClick={async () => {
                      await setProductPrimaryImage(product.id, image.id)
                      await queryClient.invalidateQueries({
                        queryKey: ADMIN_PRODUCTS_QUERY_KEY,
                      })
                    }}
                  >
                    {image.isPrimary ? "Principal" : "Hacer principal"}
                  </Button>
                </div>
              ))}
            </div>
            <Input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void handleImage(file)
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
