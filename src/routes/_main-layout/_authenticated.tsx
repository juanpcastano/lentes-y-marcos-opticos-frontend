import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_main-layout/_authenticated")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Layout de las rutas autenticadas
      <Outlet />
    </div>
  )
}
