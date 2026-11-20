import { createFileRoute } from "@tanstack/react-router"
import { IntegrationPage } from "#/components/admin/integration/integration-page"

export const Route = createFileRoute("/admin/integracion")({
  component: IntegrationPage,
})
