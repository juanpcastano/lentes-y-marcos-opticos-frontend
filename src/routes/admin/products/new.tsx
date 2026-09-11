import { createFileRoute } from "@tanstack/react-router"
import { AdminProductForm } from "#/components/admin/admin-product-form"
import { adminProductsSearchSchema } from "#/components/admin/admin-products-search"

export const Route = createFileRoute("/admin/products/new")({
  validateSearch: adminProductsSearchSchema,
  component: NewProductPage,
})

function NewProductPage() {
  return <AdminProductForm returnSearch={Route.useSearch()} />
}
