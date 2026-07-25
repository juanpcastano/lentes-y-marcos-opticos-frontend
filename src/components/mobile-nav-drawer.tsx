import { useState } from "react"
import { Menu, Search, ShoppingCart, User, LogOut } from "lucide-react"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet"
import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"
import { Input } from "./ui/input"
import { ModeToggle } from "./mode-toggle"
import { NAV_LINKS } from "./nav-menu"
import { useAuth } from "./auth-provider"
import { useQueryClient } from "@tanstack/react-query"
import { logout } from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"

const MobileNavDrawer = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const currentPath = useRouterState({ select: (s) => s.location.href })

  const handleClose = () => setOpen(false)

  const guardNav = (to: string) => {
    handleClose()
    if (!user) {
      navigate({ to: "/login", search: { redirect: currentPath } })
      return
    }
    navigate({ to })
  }

  const handleLogout = async () => {
    handleClose()
    await logout()
    queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    navigate({ to: "/" })
  }

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="size-14">
            <Menu className="size-8" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-3/4 sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 p-4">
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center min-h-11 px-4 py-2 text-lg rounded-3xl hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-1"
                    activeProps={{
                      className:
                        "underline underline-offset-4 font-bold bg-muted/50",
                    }}
                    onClick={handleClose}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-4 p-4 border-t">
            <ButtonGroup className="w-full">
              <Input placeholder="Buscar..." className="h-11 flex-1" />
              <Button
                variant="outline"
                className="h-11 w-11 shrink-0"
                aria-label="Search"
              >
                <Search className="size-5" />
              </Button>
            </ButtonGroup>
            <div className="flex items-center justify-between">
              <ModeToggle />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="size-14"
                  onClick={() => guardNav("/myaccount/profile")}
                >
                  <User className="size-8" />
                </Button>
                <Button
                  variant="ghost"
                  className="size-14"
                  onClick={() => guardNav("/orders")}
                >
                  <ShoppingCart className="size-8" />
                </Button>
              </div>
            </div>
            {user ? (
              <div className="flex flex-col gap-1 border-t pt-2">
                <Link
                  to="/myaccount/profile"
                  className="rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={handleClose}
                >
                  Mi Cuenta
                </Link>
                <Link
                  to="/myaccount/orders"
                  className="rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={handleClose}
                >
                  Mis Pedidos
                </Link>
                <Link
                  to="/myaccount/appointments"
                  className="rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={handleClose}
                >
                  Mis Citas
                </Link>
                <button
                  className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 border-t pt-2">
                <Link
                  to="/login"
                  search={{ redirect: currentPath }}
                  className="rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={handleClose}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  search={{ redirect: currentPath }}
                  className="rounded-2xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={handleClose}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default MobileNavDrawer
