import { Search, ShoppingCart, User, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"
import { Input } from "./ui/input"
import { Link, useNavigate, useRouterState } from "@tanstack/react-router"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "./auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { logout } from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"
import createCartQueryOptions from "#/query-options/cart"

const ActionsMenu = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const currentPath = useRouterState({ select: (s) => s.location.href })
  const { data: cart } = useQuery({
    ...createCartQueryOptions(),
    enabled: !!user,
  })
  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  const guardNav = (to: string) => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: to } })
      return
    }
    navigate({ to })
  }

  const handleLogout = async () => {
    await logout()
    queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    navigate({ to: "/" })
  }

  return (
    <div className="flex gap-5">
      <div className="hidden lg:flex gap-5">
        <ButtonGroup>
          <Input placeholder="Buscar..." className="h-full" />
          <Button variant="outline" className="h-full" aria-label="Search">
            <Search className="size-8" />
          </Button>
        </ButtonGroup>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-14">
              <User className="size-8" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user ? (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/myaccount/profile">Mi Cuenta</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/myaccount/orders">Mis Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/myaccount/appointments">Mis Citas</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild>
                  <Link to="/login" search={{ redirect: currentPath }}>
                    Iniciar Sesión
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/signup" search={{ redirect: currentPath }}>
                    Registrarse
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        variant="ghost"
        className="relative size-14"
        onClick={() => guardNav("/cart")}
        aria-label="Carrito"
      >
        <ShoppingCart className="size-8" />
        {user && cartCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex min-w-5 h-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground tabular-nums"
            aria-label={`${cartCount} artículos en el carrito`}
          >
            {cartCount}
          </span>
        )}
      </Button>
    </div>
  )
}

export default ActionsMenu
