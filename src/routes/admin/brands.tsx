import { createFileRoute } from "@tanstack/react-router"
import { AdminTaxonomyPage } from "#/components/admin/admin-taxonomy-page"

export const Route = createFileRoute("/admin/brands")({ component: BrandsPage })

function BrandsPage() {
  return <AdminTaxonomyPage mode="brands" />
}
