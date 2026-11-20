import { createFileRoute } from "@tanstack/react-router"
import { IntegrationPage } from "#/components/admin/integration/integration-page"

export const Route = createFileRoute("/admin/products/new")({
  component: IntegrationPage,
})
