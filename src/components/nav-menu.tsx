import { Link } from "@tanstack/react-router"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu"
import { cn } from "#/lib/utils"
import { FEATURED_CATEGORIES } from "#/services/featured-categories"
import { FEATURED_BRANDS } from "#/services/featured-brands"

export const NAV_LINKS = [
  { to: "/", label: "Inicio", hasDropdown: false },
  { to: "/catalog", label: "Catálogo", hasDropdown: true },
  { to: "/appointments", label: "Agendar Cita", hasDropdown: false },
] as const

const NavMenu = () => {
  return (
    <div className="hidden lg:block">
      <NavigationMenu>
        <NavigationMenuList>
          {NAV_LINKS.map((link) =>
            link.hasDropdown ? (
              <NavigationMenuItem key={link.to}>
                <NavigationMenuTrigger>
                  <Link
                    to={link.to}
                    className="text-lg"
                    activeProps={{
                      className: "font-bold underline underline-offset-4",
                    }}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid min-w-[320px] grid-cols-2 gap-6 p-4">
                    <div className="flex flex-col gap-1">
                      <p className="mb-1 px-2 text-md font-bold text-muted-foreground">
                        Categorías Destacadas
                      </p>
                      {FEATURED_CATEGORIES.map((category) => (
                        <Link
                          key={category.name}
                          to="/catalog"
                          search={{ categories: [category.name] }}
                          className="rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        to="/categories"
                        className="mt-1 px-2 text-sm text-primary hover:underline"
                      >
                        Ver todas las categorías
                      </Link>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="mb-1 px-2 text-md font-bold text-muted-foreground">
                        Marcas Destacadas
                      </p>
                      {FEATURED_BRANDS.map((brand) => (
                        <Link
                          key={brand.name}
                          to="/catalog"
                          search={{ brands: [brand.name] }}
                          className="rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
                        >
                          {brand.name}
                        </Link>
                      ))}
                      <Link
                        to="/brands"
                        className="mt-1 px-2 text-sm text-primary hover:underline"
                      >
                        Ver todas las marcas
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem key={link.to}>
                <Link
                  className={cn(navigationMenuTriggerStyle(), "text-lg")}
                  to={link.to}
                  activeProps={{
                    className: "underline underline-offset-4",
                    style: { fontWeight: 700 },
                  }}
                >
                  {link.label}
                </Link>
              </NavigationMenuItem>
            ),
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default NavMenu
