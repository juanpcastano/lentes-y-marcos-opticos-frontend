import { Link } from "@tanstack/react-router"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu"
import { cn } from "#/lib/utils"

export const NAV_LINKS = [
  { to: "/", label: "Inicio", hasDropdown: false },
  { to: "/catalog", label: "Catálogo", hasDropdown: true },
  { to: "/apointments", label: "Agendar Cita", hasDropdown: false },
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
                  <NavigationMenuLink>Link</NavigationMenuLink>
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
