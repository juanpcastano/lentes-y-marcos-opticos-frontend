import { createFileRoute } from "@tanstack/react-router"
import { AdminSyncPage } from "#/components/admin/admin-sync-page"

export const Route = createFileRoute("/admin/products/new")({
  component: AdminSyncPage,
})
