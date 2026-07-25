import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_main-layout/_authenticated/myaccount/orders",
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main-layout/_authenticated/myaccount/orders"!</div>
}
