import { LoginForm } from "#/components/login-form"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

const forgotPasswordSearchSchema = z.object({
  redirect: z.string().default("/"),
})

export const Route = createFileRoute("/forgot-password")({
  validateSearch: forgotPasswordSearchSchema,
  component: RouteComponent,
})

/**
 * Ya no hay contraseñas. Ingreso y recuperación son el mismo flujo por
 * teléfono + código de WhatsApp.
 */
function RouteComponent() {
  const { redirect } = Route.useSearch()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm redirect={redirect} />
      </div>
    </div>
  )
}
