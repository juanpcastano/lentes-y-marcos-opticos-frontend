import { createFileRoute } from "@tanstack/react-router"
import { AdminHeroPage } from "#/components/admin/admin-hero-page"

export const Route = createFileRoute("/admin/hero")({
  component: HeroAdminPage,
})

function HeroAdminPage() {
  return <AdminHeroPage />
}
