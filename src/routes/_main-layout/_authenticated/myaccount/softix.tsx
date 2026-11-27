import { createFileRoute } from "@tanstack/react-router"
import { SoftixProfileForm } from "#/components/softix-profile-form"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/softix",
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full max-w-2xl">
      <h1 className="mb-3 text-2xl font-bold">Mis datos</h1>
      <p className="mb-6 text-muted-foreground">
        Revisa y actualiza tus datos personales.
      </p>
      <SoftixProfileForm />
    </div>
  )
}
