import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { UserCircle, ShoppingBag, Calendar, MapPin, LogOut } from "lucide-react"
import { logout } from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"

export const Route = createFileRoute("/_main-layout/_authenticated/myaccount")({
  component: RouteComponent,
})

const navItems = [
  { to: "/myaccount/profile", label: "Mi Perfil", icon: UserCircle },
  { to: "/myaccount/orders", label: "Historial de Compras", icon: ShoppingBag },
  { to: "/myaccount/appointments", label: "Citas Agendadas", icon: Calendar },
  { to: "/myaccount/addresses", label: "Direcciones", icon: MapPin },
]

function RouteComponent() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    await logout()
    queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    navigate({ to: "/" })
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 p-6">
      <aside className="hidden w-64 shrink-0 lg:block">
        <nav className="rounded-xl border bg-card p-2 shadow-sm">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  activeProps={{
                    className:
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium bg-primary text-primary-foreground transition-colors hover:bg-primary",
                  }}
                  activeOptions={{ exact: true }}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="my-2 h-px bg-border" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Cerrar Sesión
          </button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 flex justify-center">
        <Outlet />
      </main>
    </div>
  )
}
