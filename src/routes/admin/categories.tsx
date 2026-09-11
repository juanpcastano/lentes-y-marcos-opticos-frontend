import { createFileRoute } from "@tanstack/react-router"
import { AdminTaxonomyPage } from "#/components/admin/admin-taxonomy-page"

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
})

function CategoriesPage() {
  return <AdminTaxonomyPage mode="categories" />
}
