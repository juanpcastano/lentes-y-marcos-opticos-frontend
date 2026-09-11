import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu"
import { cn } from "#/lib/utils"
import createFeaturedBrandsQueryOptions from "#/query-options/featured-brands"
import createFeaturedCategoriesQueryOptions from "#/query-options/featured-categories"

type FilterKey = "categories" | "brands"

type DropdownSection = {
  title: string
  filter: FilterKey
  allTo: "/categories" | "/brands"
  allLabel: string
}

type NavLink = {
  to: "/" | "/catalog" | "/appointments"
  label: string
  dropdown?: {
    sections: DropdownSection[]
    linkLabel: string
  }
}

export const NAV_LINKS: NavLink[] = [
  { to: "/", label: "Inicio" },
  {
    to: "/catalog",
    label: "Catálogo",
    dropdown: {
      linkLabel: "Ver todo el catálogo",
      sections: [
        {
          title: "Categorías destacadas",
          filter: "categories",
          allTo: "/categories",
          allLabel: "Ver todas las categorías",
        },
        {
          title: "Marcas destacadas",
          filter: "brands",
          allTo: "/brands",
          allLabel: "Ver todas las marcas",
        },
      ],
    },
  },
  { to: "/appointments", label: "Agendar Cita" },
]

function NavDropdown({
  sections,
  linkLabel,
  featured,
}: {
  sections: DropdownSection[]
  linkLabel: string
  featured: Record<FilterKey, { name: string }[]>
}) {
  return (
    <NavigationMenuContent>
      <div className="grid min-w-[320px] grid-cols-2 gap-6 bg-popover p-4">
        <Link
          to="/catalog"
          className="col-span-2 rounded-md px-2 py-1 text-sm font-semibold text-primary hover:bg-secondary"
        >
          {linkLabel}
        </Link>
        {sections.map((section) => (
          <div key={section.filter} className="flex flex-col gap-1">
            <p className="mb-1 px-2 text-md font-bold text-muted-foreground">
              {section.title}
            </p>
            {featured[section.filter].map((item) => (
              <Link
                key={item.name}
                to="/catalog"
                search={{ [section.filter]: [item.name] }}
                className="rounded-md px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to={section.allTo}
              className="mt-1 px-2 text-sm text-primary hover:underline"
            >
              {section.allLabel}
            </Link>
          </div>
        ))}
      </div>
    </NavigationMenuContent>
  )
}

const NavMenu = () => {
  const navigate = useNavigate()
  const [menuValue, setMenuValue] = useState<string>()
  const { data: categories = [] } = useQuery(
    createFeaturedCategoriesQueryOptions(),
  )
  const { data: brands = [] } = useQuery(createFeaturedBrandsQueryOptions())

  const featured = { categories, brands }

  return (
    <div className="hidden lg:block">
      <NavigationMenu value={menuValue} onValueChange={setMenuValue}>
        <NavigationMenuList>
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <NavigationMenuItem key={link.to}>
                <NavigationMenuTrigger
                  className="text-lg"
                  onClick={(event) => {
                    event.preventDefault()
                    setMenuValue(undefined)
                    navigate({ to: link.to })
                  }}
                >
                  {link.label}
                </NavigationMenuTrigger>
                <NavDropdown
                  sections={link.dropdown.sections}
                  linkLabel={link.dropdown.linkLabel}
                  featured={featured}
                />
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
