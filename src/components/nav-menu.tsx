import { Link } from '@tanstack/react-router'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu'
import { cn } from '#/lib/utils'

const NavMenu = () => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link
            className={cn(navigationMenuTriggerStyle(), 'text-lg')}
            to="/"
            activeProps={{
              className: 'underline underline-offset-4',
              style: { fontWeight: 700 },
            }}
          >
            Inicio
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link
              to="/catalog"
              className="text-lg"
              activeProps={{
                className: 'font-bold underline underline-offset-4',
              }}
            >
              Catálogo
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink>Link</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            className={cn(navigationMenuTriggerStyle(), 'text-lg')}
            to="/apointments"
            activeProps={{
              className: 'underline underline-offset-4',
              style: { fontWeight: 700 },
            }}
          >
            Agendar Cita
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default NavMenu
