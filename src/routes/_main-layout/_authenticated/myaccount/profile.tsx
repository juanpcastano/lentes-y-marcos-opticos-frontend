import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/profile",
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main-layout/_authenticated/myaccount/profile"!</div>
}
