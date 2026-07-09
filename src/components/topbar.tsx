import { Link } from "@tanstack/react-router"
import NavMenu from "./nav-menu"
import ActionsMenu from "./actions-menu"
import MobileNavDrawer from "./mobile-nav-drawer"

const Logo = () => {
  return (
    <Link to="/">
      <div className="py-3 flex flex-col gap-1 items-center justify-self-start">
        <img
          src="/logo.png"
          alt="Lentes Y Marcos Ópticos Logo"
          className="h-14 sm:h-18 pt-1 w-min"
        />
        <h1 className="text-sm sm:text-base font-black pl-2">
          LENTES Y MARCOS ÓPTICOS
        </h1>
      </div>
    </Link>
  )
}

const Topbar = () => {
  return (
    <div className="w-full flex items-center bg-sidebar px-6 border-b border-border">
      <div className="flex-1">
        <Logo />
      </div>
      <NavMenu />
      <div className="flex-1 flex justify-end items-center gap-2">
        <ActionsMenu />
        <MobileNavDrawer />
      </div>
    </div>
  )
}

export default Topbar
