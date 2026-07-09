import Topbar from "#/components/topbar"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_main-layout")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Topbar />
      <Outlet />
    </div>
  )
}
