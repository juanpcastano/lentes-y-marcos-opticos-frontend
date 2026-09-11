import Footer from "#/components/footer"
import Topbar from "#/components/topbar"
import { LayoutErrorPage } from "#/components/layout-error-page"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_main-layout")({
  component: RouteComponent,
  notFoundComponent: () => <LayoutErrorPage backTo="/" section="la tienda" />,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
