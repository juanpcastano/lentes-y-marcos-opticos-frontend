import { createFileRoute } from "@tanstack/react-router"
import { AdminGalleryPage } from "#/components/admin/admin-gallery-page"

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGalleryPage,
})
