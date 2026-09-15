import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router"
import { AppSidebar } from "#/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "#/components/ui/sidebar"
import { createMeQueryOptions } from "#/query-options/auth"
import { useAuth } from "#/components/auth-provider"
import { LayoutErrorPage } from "#/components/layout-error-page"

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData({
      ...createMeQueryOptions(),
      revalidateIfStale: true,
    })
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
  component: AdminLayout,
  notFoundComponent: () => (
    <LayoutErrorPage backTo="/admin" section="la administración" />
  ),
})

function AdminLayout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="p-8 text-muted-foreground">
        Cargando administración...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" search={{ redirect: location.href }} />
  }

  if (!user.isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <section className="max-w-md text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Error 403
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Acceso restringido</h1>
          <p className="mt-3 text-muted-foreground">
            Esta zona solo está disponible para cuentas administradoras.
          </p>
        </section>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-background">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-5 lg:px-8">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">
            Panel de administración
          </span>
        </header>
        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
