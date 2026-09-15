import * as React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import {
  Boxes,
  Images,
  LayoutDashboard,
  Tags,
  Store,
  Tag,
  LogOut,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar"
import { logout } from "#/services/auth"
import { ME_QUERY_KEY } from "#/query-options/auth"
import { ModeToggle } from "#/components/mode-toggle"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await logout()
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY })
    window.location.assign("/")
  }

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <img
                  src="/logo192.png"
                  alt="Lentes Y Marcos Ópticos"
                  className="aspect-square size-14 rounded-lg"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">LM Ópticos</span>
                  <span className="text-xs text-muted-foreground">
                    Administración
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Catálogo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin"}
                >
                  <Link to="/admin">
                    <LayoutDashboard />
                    Resumen
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/admin/products")}
                >
                  <Link to="/admin/products">
                    <Boxes />
                    Productos
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/categories"}
                >
                  <Link to="/admin/categories">
                    <Tags />
                    Categorías
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/brands"}
                >
                  <Link to="/admin/brands">
                    <Tag />
                    Marcas
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/admin/gallery"}
                >
                  <Link to="/admin/gallery">
                    <Images />
                    Galería
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <ModeToggle sidebar />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Store />
                    Ver tienda
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut />
                  Cerrar sesión
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
