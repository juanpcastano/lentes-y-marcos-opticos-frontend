import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * Ruta heredada. Los datos personales ahora se editan en línea desde
 * "Mi Perfil", así que se conserva este destino solo para enlaces antiguos.
 */
export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/softix",
)({
  beforeLoad: () => {
    throw redirect({ to: "/myaccount/profile" })
  },
})
