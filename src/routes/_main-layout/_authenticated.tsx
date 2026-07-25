import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { createMeQueryOptions } from "#/query-options/auth"

export const Route = createFileRoute("/_main-layout/_authenticated")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.ensureQueryData(
      createMeQueryOptions(),
    )
    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
