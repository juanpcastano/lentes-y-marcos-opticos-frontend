import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { AdminProductForm } from "#/components/admin/admin-product-form"
import { adminProductsSearchSchema } from "#/components/admin/admin-products-search"
import { createAdminProductQueryOptions } from "#/query-options/admin"
import type { AdminProduct } from "#/services/admin"

export const Route = createFileRoute("/admin/products/$id")({
  validateSearch: adminProductsSearchSchema,
  component: EditProductPage,
})

function EditProductPage() {
  const { id } = Route.useParams()
  const { data, isPending, error } = useQuery(
    createAdminProductQueryOptions(id),
  )
  if (isPending)
    return <p className="text-muted-foreground">Cargando producto...</p>
  if (error) return <p className="text-sm text-destructive">{error.message}</p>
  if (!data)
    return <p className="text-sm text-destructive">Producto no encontrado</p>

  return <LoadedProductForm product={data} />
}

function LoadedProductForm({ product }: { product: AdminProduct }) {
  return (
    <AdminProductForm
      key={product.id}
      product={product}
      returnSearch={Route.useSearch()}
    />
  )
}
